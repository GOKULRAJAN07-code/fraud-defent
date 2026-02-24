import asyncio
import random
import uuid
import datetime
from typing import AsyncGenerator

async def generate_transactions() -> AsyncGenerator[dict, None]:
    """
    Simulates a never-ending stream of financial transactions.
    Yields a transaction every 1 to 4 seconds.
    """
    txn_id_counter = 1000
    
    while True:
        await asyncio.sleep(random.uniform(1.0, 4.0))
        
        # Decide if we want to force a fraud-like transaction (20% chance)
        is_suspicious = random.random() < 0.2
        
        if is_suspicious:
            amount = random.uniform(500, 5000)
            user_age_days = random.randint(1, 100)
            device_trust = random.uniform(0.01, 0.4)
            velocity_1h = random.randint(4, 15)
            distance = random.uniform(100, 2000)
        else:
            amount = random.uniform(5, 300)
            user_age_days = random.randint(100, 3650)
            device_trust = random.uniform(0.6, 1.0)
            velocity_1h = random.randint(0, 3)
            distance = random.uniform(0, 50)
            
        txn_id_counter += 1
        
        yield {
            "id": f"TXN-{txn_id_counter}-{uuid.uuid4().hex[:6]}",
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
            "user_id": f"user_{random.randint(1000, 9999)}",
            "features": {
                "amount": round(amount, 2),
                "user_age_days": user_age_days,
                "device_trust_score": round(device_trust, 4),
                "velocity_1h": velocity_1h,
                "distance_from_home": round(distance, 2)
            }
        }
