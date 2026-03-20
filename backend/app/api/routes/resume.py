from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from app.utils.file_handler import FileHandler
from app.services.resume_parser import ResumeParser
from app.services.embedding_service import EmbeddingService
from app.vectorstore.faiss_store import FAISSStore
from app.db.session import SessionLocal
from app.models.resume import Resume
import uuid

router = APIRouter()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Initialize services
embedding_service = EmbeddingService()
vector_store = FAISSStore()

from app.api.deps import get_current_user, oauth2_scheme
from app.models.user import User
from fastapi.security import OAuth2PasswordBearer

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    token: str = Depends(oauth2_scheme)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    try:
        # 1. Upload to Supabase Storage DIRECTLY using HTTP API
        # This bypasses potential SDK version mismatches or ClientOptions issues.
        import requests
        import os
        from app.core.config import settings
        
        # Read file content
        file_content = await file.read()

        # Generate unique path: user_id/uuid/filename
        unique_file_id = str(uuid.uuid4())
        bucket_name = "resumes"
        storage_path = f"{current_user.id}/{unique_file_id}_{file.filename}"
        
        # Determine content type
        content_type = file.content_type or "application/pdf"
        
        # API URL for Supabase Storage
        # https://<project>.supabase.co/storage/v1/object/<bucket>/<path>
        storage_url = f"{settings.SUPABASE_URL}/storage/v1/object/resumes/{storage_path}"
        
        headers = {
            "Authorization": f"Bearer {token}",
            "apikey": settings.SUPABASE_KEY,
            "Content-Type": content_type,
            "x-upsert": "true" # Optional: overwrite if exists
        }
        
        # Perform Upload
        response = requests.post(storage_url, data=file_content, headers=headers)
        
        if response.status_code not in (200, 201):
                print(f"Storage Upload Failed: {response.text}")
                raise HTTPException(status_code=response.status_code, detail=f"Failed to upload to storage: {response.text}")

        # Get Public URL
        # For public buckets: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
        public_url = f"{settings.SUPABASE_URL}/storage/v1/object/public/resumes/{storage_path}"
        file_path = public_url

        # 2. Parse content (We still need the content for AI)
        # Since we have file_content in memory, we can use io.BytesIO for parsers that support it
        # or we save to a temporary file just for parsing.
        # ResumeParser.parse_file usually takes a path. 
        # Let's create a temporary file for parsing to be safe with existing parser logic.
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(file_content)
            temp_path = tmp.name
            
        try:
            parsed_data = ResumeParser.parse_file(temp_path)
        finally:
            os.remove(temp_path) # Clean up temp file immediately

        text_content = parsed_data["content"]
        
        if not text_content:
             raise HTTPException(status_code=400, detail="Could not extract text from resume")

        # 2.5 Validation: Check if it's actually a resume
        from app.services.ats_service import ATSService
        ats_service = ATSService()
        if not ats_service.is_resume(text_content):
            # We uploaded it... maybe we should delete it if invalid?
            # supabase.storage.from_(bucket_name).remove([storage_path])
            raise HTTPException(
                status_code=400, 
                detail="Uploaded file does not appear to be a resume. Please upload a proper resume document."
            )

        # 3. Check for existing version
        existing_resume = db.query(Resume)\
            .filter(Resume.user_id == current_user.id, Resume.filename == file.filename)\
            .order_by(Resume.version_number.desc())\
            .first()
        
        new_version_number = 1
        if existing_resume:
            new_version_number = existing_resume.version_number + 1

        # 4. Generate unique ID for this specific version
        resume_id = unique_file_id # Reuse UUID
        
        # 5. Generate Embeddings
        embeddings = embedding_service.generate_embeddings(text_content)
        
        # 6. Store in FAISS
        base_metadata = {
            **parsed_data["metadata"],
            "resume_id": resume_id,
            "filename": file.filename,
            "filepath": file_path, # Now a URL - ensures this overwrites any temp path in parsed_data
            "version": new_version_number,
        }
        metadatas = [base_metadata] * len(embeddings)
        vector_store.add_vectors(embeddings, metadatas)
        
        # 7. Store in Database
        db_resume = Resume(
            resume_id=resume_id,
            filename=file.filename,
            filepath=file_path, # URL
            extracted_text=text_content,
            chunk_count=len(embeddings),
            user_id=current_user.id,
            version_number=new_version_number,
        )
        db.add(db_resume)
        db.commit()
        db.refresh(db_resume)

        return {
            "filename": file.filename,
            "resume_id": resume_id,
            "version": new_version_number,
            "chunk_count": len(embeddings),
            "message": f"Resume v{new_version_number} processed successfully (Stored in Cloud)",
            "metadata": base_metadata,
            "url": file_path
        }
    except Exception as e:
        print(f"Error processing resume: {e}")
        # raise e # Debugging
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list")
async def list_resumes(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """List all available resumes for current user."""
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).all()
    return resumes

@router.delete("/{resume_id}")
async def delete_resume(resume_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Delete a resume by ID from both DB and FAISS."""
    # Delete from DB
    resume = db.query(Resume).filter(Resume.resume_id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
         raise HTTPException(status_code=404, detail="Resume not found")
    
    db.delete(resume)
    db.commit()

    # Soft Delete from FAISS (In-memory)
    vector_store.delete_by_resume_id(resume_id)
    
    return {"message": "Resume deleted successfully"}

# --- Coach Endpoint ---
from pydantic import BaseModel
from typing import List
from app.services.resume_coach_service import ResumeCoachService

resume_coach_service = ResumeCoachService()

class CoachRequest(BaseModel):
    resume_id: str

class Improvement(BaseModel):
    original: str
    improved: str
    reason: str

class CoachResponse(BaseModel):
    improvements: List[Improvement]
    general_suggestions: List[str]

@router.post("/coach", response_model=CoachResponse)
async def coach_resume(request: CoachRequest, db: Session = Depends(get_db)):
    """Run AI Resume Coach on a specific resume."""
    resume = db.query(Resume).filter(Resume.resume_id == request.resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    if not resume.extracted_text:
         raise HTTPException(status_code=400, detail="Resume has no text content")
         
    try:
        result = resume_coach_service.coach_resume(resume.extracted_text)
        return result
    except Exception as e:
        print(f"Coach Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to run Resume Coach")
