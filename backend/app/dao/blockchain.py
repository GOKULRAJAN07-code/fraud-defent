import hashlib
import json
import time
from typing import Optional

# Simulated on-chain storage for hackathon
MOCK_BLOCKCHAIN = {}

def generate_blockchain_id(user_info: dict) -> str:
    """
    Simulates writing identity data to a blockchain and returning a transaction hash.
    In reality, this would hash user info (PII, biometrics hash) and sign it 
    or store it to a smart contract on Ethereum/Polygon/Solana, etc.
    """
    
    # Sort keys for consistent hashing
    payload = json.dumps(user_info, sort_keys=True)
    
    # Add salt and timestamp
    timestamp = str(time.time())
    raw_data = payload + ":secret_salt_123:" + timestamp
    
    # Generate SHA-256 hash (simulates Tx Hash or DID identifier)
    did_hash = "did:fraud:" + hashlib.sha256(raw_data.encode('utf-8')).hexdigest()
    
    # Store in "blockchain" mapping
    MOCK_BLOCKCHAIN[did_hash] = {
        "timestamp": timestamp,
        "verified": True,
        "payload_hash": hashlib.sha256(payload.encode()).hexdigest(),
        "creator_address": "0xMockedWalletAddress999"
    }
    
    return did_hash

def verify_blockchain_id(did_hash: str) -> Optional[dict]:
    """
    Retrieves the identity record from the mock blockchain.
    """
    return MOCK_BLOCKCHAIN.get(did_hash)
