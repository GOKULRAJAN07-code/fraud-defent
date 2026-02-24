from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import init_redis, close_redis
from app.auth.routes import router as auth_router
from app.fraud.routes import router as fraud_router
from app.dao.routes import router as dao_router
from app.logs.routes import router as logs_router

app = FastAPI(
    title="Fraud Detection & DAO Verification API",
    description="Backend API for the real-time fraud detection and DAO identity defense system.",
    version="1.0.0",
    on_startup=[init_redis],
    on_shutdown=[close_redis]
)

# Set up CORS
origins = [
    "http://localhost:3000",  # React CRA
    "http://127.0.0.1:3000",
    "http://localhost:5173",  # React Vite
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(fraud_router, prefix="/fraud", tags=["Fraud Detection & WebSockets"])
app.include_router(dao_router, prefix="/dao", tags=["DAO Identity Verification"])
app.include_router(logs_router, prefix="/logs", tags=["Explainability & Analytics"])

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Fraud Detection API is running"}
