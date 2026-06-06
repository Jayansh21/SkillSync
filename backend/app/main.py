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
            
            # Models will load lazily on usage, saving startup memory.
            # print("Loading Embedding Model...")
            # EmbeddingService().load_model()
            # print("Embedding Model loaded.")
            
            # print("Initializing Vector Store...")
            # FAISSStore().initialize()
            # print("Vector Store initialized.")
            
            # 2. Rebuild FAISS index from DB if needed (Stateless Recovery)
            from app.vectorstore.faiss_store import FAISSStore
            from app.services.embedding_service import EmbeddingService
            from app.db.session import SessionLocal
            
            faiss_store = FAISSStore()
            faiss_store.initialize()
            
            db = SessionLocal()
            try:
                db_resumes = db.query(Resume).all()
                if db_resumes:
                    print(f"Startup check: Found {len(db_resumes)} resumes in database.")
                    unique_faiss_resumes = faiss_store.get_all_resumes()
                    unique_faiss_ids = {r.get("resume_id") for r in unique_faiss_resumes if r.get("resume_id")}
                    
                    missing_resumes = [r for r in db_resumes if r.resume_id not in unique_faiss_ids]
                    
                    if missing_resumes:
                        print(f"Rebuilding FAISS index: {len(missing_resumes)} resumes are missing from the FAISS store. Indexing...")
                        embedding_service = EmbeddingService()
                        embedding_service.load_model()
                        
                        for resume in missing_resumes:
                            if resume.extracted_text:
                                print(f"Generating embeddings and indexing resume: {resume.filename} (v{resume.version_number})")
                                embeddings = embedding_service.generate_embeddings(resume.extracted_text)
                                base_metadata = {
                                    "source": resume.filepath,
                                    "page_count": 0,
                                    "author": None,
                                    "creation_date": None,
                                    "producer": None,
                                    "resume_id": resume.resume_id,
                                    "filename": resume.filename,
                                    "filepath": resume.filepath,
                                    "version": resume.version_number,
                                }
                                metadatas = [base_metadata] * len(embeddings)
                                faiss_store.add_vectors(embeddings, metadatas)
                        print("FAISS index rebuild completed successfully.")
                    else:
                        print("Startup check: FAISS index is fully in sync with database.")
                else:
                    print("Startup check: No resumes found in database.")
            except Exception as e:
                print(f"FAISS startup rebuild failed: {e}")
            finally:
                db.close()
            
        except Exception as e:
            print(f"Startup initialization failed (non-critical, retrying or continuing): {e}")

    # Schedule the task to run in the background
    asyncio.create_task(load_models_background())

# Set all CORS enabled origins
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

# Append dynamic CORS origins from environment config
if settings.BACKEND_CORS_ORIGINS:
    for origin in settings.BACKEND_CORS_ORIGINS:
        origin_str = str(origin).rstrip("/")
        if origin_str not in origins:
            origins.append(origin_str)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)
