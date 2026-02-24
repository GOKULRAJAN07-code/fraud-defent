import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import List
from pydantic import BaseModel
from datetime import datetime
import uuid

from app.websocket.manager import manager
from app.fraud.model import predict_fraud
from app.auth.jwt_handler import get_current_user

router = APIRouter()

active_transactions = [] # Cache in memory for REST GET

class TransactionFeatures(BaseModel):
    amount: float
    user_age_days: int
    device_trust_score: float
    velocity_1h: int
    distance_from_home: float

class TransactionInput(BaseModel):
    user_id: str
    features: TransactionFeatures

@router.post("/transactions")
async def submit_transaction(tx_input: TransactionInput, current_user: dict = Depends(get_current_user)):
    global active_transactions
    
    raw_tx = {
        "id": f"TXN-{uuid.uuid4().hex[:8]}",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "user_id": tx_input.user_id,
        "features": tx_input.features.dict()
    }
    
    # Score transaction using XGBoost
    risk_score, is_fraud, explanations = predict_fraud(raw_tx["features"])
    
    # Enrich transaction with results
    tx_result = {
        **raw_tx,
        "risk_score": float(risk_score),
        "is_fraud": is_fraud,
        "explanations": explanations
    }
    
    # Prepend to array
    active_transactions.insert(0, tx_result)
    
    # Limit size to 100 for memory demo
    if len(active_transactions) > 100:
        active_transactions = active_transactions[:100]
        
    # Broadcast to UI
    await manager.broadcast(tx_result)
    
    return {"message": "Transaction processed", "transaction": tx_result}

@router.delete("/transactions/{tx_id}")
async def delete_transaction(tx_id: str, current_user: dict = Depends(get_current_user)):
    global active_transactions
    active_transactions = [tx for tx in active_transactions if tx["id"] != tx_id]
    
    # Broadcast delete event to UI
    await manager.broadcast({"action": "delete", "id": tx_id})
    
    return {"message": f"Transaction {tx_id} cleared"}

@router.get("/transactions")
async def get_recent_transactions(
    skip: int = 0, 
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """
    Returns the latest transactions with pagination (requires Auth).
    """
    paginated_transactions = active_transactions[skip : skip + limit]
    return {
        "transactions": paginated_transactions,
        "total": len(active_transactions),
        "skip": skip,
        "limit": limit
    }

@router.post("/simulate")
async def simulate_transaction(features: TransactionFeatures, current_user: dict = Depends(get_current_user)):
    """
    Scores a transaction and returns explanations without saving or broadcasting it.
    Used for the interactive What-If Simulator.
    """
    # Score transaction using XGBoost
    risk_score, is_fraud, explanations = predict_fraud(features.dict())
    
    return {
        "risk_score": float(risk_score),
        "is_fraud": is_fraud,
        "explanations": explanations
    }

@router.websocket("/stream")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint. No auth required for the demo, 
    but in prod we would check token in query string or subprotocols.
    """
    await manager.connect(websocket)
    try:
        while True:
            # We don't expect messages from client, just keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
