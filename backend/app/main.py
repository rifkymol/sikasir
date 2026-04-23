from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from .routers import product, transaction
from .websocket_manager import manager
from .database import create_db_and_tables

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up... Creating database tables if not exist.")
    create_db_and_tables()
    yield
    print("Shutting down...")

app = FastAPI(
    title="Sikasir API",
    description="Backend API for Sikasir POS system",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(product.router, prefix="/api")
app.include_router(transaction.router, prefix="/api")

# WebSocket end point for real-time updates
@app.websocket("/ws/inventory")
async def websocket_inventory(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()  # Keep connection alive
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/api/health", tags=["System"])
async def health_check():
    return {"status": "ok", "message": "Sikasir API is running"}
