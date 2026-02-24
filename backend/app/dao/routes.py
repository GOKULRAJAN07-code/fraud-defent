from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from app.dao.face_detect import detect_and_compare_faces
from app.dao.blockchain import generate_blockchain_id, verify_blockchain_id
from app.auth.jwt_handler import get_current_user

from datetime import datetime
import uuid

router = APIRouter()

dao_verification_logs = []

@router.post("/verify")
async def verify_identity(
    id_image: UploadFile = File(...),
    camera_image: UploadFile = File(...),
    fullname: str = Form(...),
    dob: str = Form(...)
):
    """
    1) Receives an uploaded ID + a live Camera photo
    2) Extracts faces and compares them
    3) If match, issues a Blockchain ID Hash
    """
    
    id_bytes = await id_image.read()
    camera_bytes = await camera_image.read()
    
    result = detect_and_compare_faces(camera_bytes, id_bytes)
    
    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["error"])
        
    response = {
        "status": "APPROVED" if result["match"] else "REJECTED",
        "match_score": result["score"],
        "message": "Faces match!" if result["match"] else "Faces do not match.",
        "blockchain_did": None
    }
    
    # If successful match, register to demo blockchain
    if result["match"]:
        user_info = {
            "name": fullname,
            "dob": dob,
            "face_match_score": result["score"]
        }
        did_hash = generate_blockchain_id(user_info)
        response["blockchain_did"] = did_hash
        
    # Append to logs for Unified Audit
    log_entry = {
        "id": f"DAO-{uuid.uuid4().hex[:8]}",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "type": "DAO_VERIFICATION",
        "user_id": fullname,
        "features": {
            "Match Confidence": f"{(result['score'] * 100):.1f}%",
            "DOB": dob
        },
        "is_fraud": not result["match"], # False if approved, True if rejected
        "risk_score": 1.0 - result["score"] # Inverse of confidence
    }
    
    dao_verification_logs.insert(0, log_entry)
    
    if len(dao_verification_logs) > 100:
        dao_verification_logs.pop()

    return response
@router.get("/blockchain/{did}")
async def check_blockchain_id(did: str):
    record = verify_blockchain_id(did)
    if not record:
        raise HTTPException(status_code=404, detail="Blockchain Identity not found")
        
    return {"status": "success", "data": record}
