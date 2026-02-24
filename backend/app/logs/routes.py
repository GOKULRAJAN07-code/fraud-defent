from fastapi import APIRouter, Depends
from typing import List

from app.auth.jwt_handler import get_current_user
from app.fraud.routes import active_transactions
from app.dao.routes import dao_verification_logs

router = APIRouter()

@router.get("/")
async def get_logs(
    skip: int = 0,
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """
    Returns unified recent events for the logs/analytics view with pagination.
    Includes BOTH Fraud Transactions and DAO Verification attempts.
    """
    # 1. Get Transaction Logs
    tx_logs = []
    for tx in active_transactions:
        if tx.get("is_fraud"):
            # Ensure it has a type for the frontend
            tx_copy = dict(tx)
            tx_copy["type"] = "TRANSACTION"
            tx_logs.append(tx_copy)
            
    # 2. Get DAO Logs
    # (We already appended 'type': 'DAO_VERIFICATION' to these in logic)
    dao_logs = list(dao_verification_logs)
    
    # 3. Combine and Sort by timestamp descending (newest first)
    combined_logs = tx_logs + dao_logs
    combined_logs.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    
    # 4. Apply pagination
    paginated_logs = combined_logs[skip : skip + limit]
    
    return {
        "logs": paginated_logs,
        "total": len(combined_logs),
        "skip": skip,
        "limit": limit
    }

@router.get("/analytics")
async def get_analytics(current_user: dict = Depends(get_current_user)):
    """
    Returns aggregated analytics for the dashboard across all sub-systems.
    """
    total_tx = len(active_transactions)
    fraud_tx = sum(1 for tx in active_transactions if tx.get("is_fraud"))
    
    total_dao = len(dao_verification_logs)
    rejected_dao = sum(1 for log in dao_verification_logs if log.get("is_fraud"))
    
    total_events = total_tx + total_dao
    total_anomalies = fraud_tx + rejected_dao
    
    return {
        "total_transactions": total_events,
        "total_fraud_detected": total_anomalies,
        "clean_transactions": total_events - total_anomalies,
        "fraud_rate": round(total_anomalies / total_events, 4) if total_events > 0 else 0
    }
