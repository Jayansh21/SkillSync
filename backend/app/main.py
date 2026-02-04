from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.router import api_router

app = FastAPI(
    title=settings.PROJECT_NAME, 
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
from app.db.base import Base
from app.db.session import engine
from app.models.resume import Resume
from app.models.score import ResumeScore
from app.models.user import User

# Create tables (Moved to startup event)
# Base.metadata.create_all(bind=engine)

import asyncio

@app.on_event("startup")
async def startup_event():
    print("Server ready")
    
    async def load_models_background():
        print("Models loading in background...")
        try:
            # 1. Initialize DB
            Base.metadata.create_all(bind=engine)
            print("Database initialized.")
            
            # 2. Loading AI Models
            from app.services.embedding_service import EmbeddingService
            from app.vectorstore.faiss_store import FAISSStore
            
            print("Loading Embedding Model...")
            EmbeddingService().load_model()
            print("Embedding Model loaded.")
            
            print("Initializing Vector Store...")
            FAISSStore().initialize()
            print("Vector Store initialized.")
            
        except Exception as e:
            print(f"Startup initialization failed (non-critical, retrying or continuing): {e}")

    # Schedule the task to run in the background
    asyncio.create_task(load_models_background())

# Set all CORS enabled origins
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)
