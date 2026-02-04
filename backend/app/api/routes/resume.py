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

from app.api.deps import get_current_user
from app.models.user import User

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    try:
        # 1. Save file locally
        file_path = await FileHandler.save_upload_file(file)
        
        # 2. Parse content
        parsed_data = ResumeParser.parse_file(file_path)
        text_content = parsed_data["content"]
        
        if not text_content:
             raise HTTPException(status_code=400, detail="Could not extract text from resume")

        # 2.5 Validation: Check if it's actually a resume
        from app.services.ats_service import ATSService
        ats_service = ATSService()
        if not ats_service.is_resume(text_content):
            # Cleanup file since we're rejecting it
            import os
            if os.path.exists(file_path):
                os.remove(file_path)
            
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
        resume_id = str(uuid.uuid4())
        
        # 5. Generate Embeddings
        embeddings = embedding_service.generate_embeddings(text_content)
        
        # 6. Store in FAISS
        base_metadata = {
            "resume_id": resume_id,
            "filename": file.filename,
            "filepath": file_path,
            "version": new_version_number,
            **parsed_data["metadata"]
        }
        metadatas = [base_metadata] * len(embeddings)
        vector_store.add_vectors(embeddings, metadatas)

        # 7. Store in Database
        db_resume = Resume(
            resume_id=resume_id,
            filename=file.filename,
            filepath=file_path,
            extracted_text=text_content,
            chunk_count=len(embeddings),
            user_id=current_user.id,
            version_number=new_version_number,
            # We can link the optional label if we add it to params
        )
        db.add(db_resume)
        db.commit()
        db.refresh(db_resume)

        return {
            "filename": file.filename,
            "resume_id": resume_id,
            "version": new_version_number,
            "chunk_count": len(embeddings),
            "message": f"Resume v{new_version_number} processed successfully",
            "metadata": base_metadata
        }
    except Exception as e:
        print(f"Error processing resume: {e}")
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
