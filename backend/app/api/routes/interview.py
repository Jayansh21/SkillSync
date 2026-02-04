from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from app.db.session import SessionLocal
from app.models.resume import Resume
from app.services.llm_service import LLMService
from app.services.jd_parser import JDParser

router = APIRouter()
llm_service = LLMService()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class InterviewPrepResponse(BaseModel):
    questions: List[str]
    company_overview: str
    role_expectations: str
    interview_focus: str
    disclaimer: str

@router.post("/prep", response_model=InterviewPrepResponse)
async def generate_questions(
    resume_id: str = Form(...),
    jd_text: Optional[str] = Form(None),
    jd_url: Optional[str] = Form(None),
    jd_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    # 1. Fetch Resume (validation)
    if resume_id:
        resume = db.query(Resume).filter(Resume.resume_id == resume_id).first()
        if not resume:
             raise HTTPException(status_code=404, detail="Resume not found")

    try:
        # Extract JD text
        job_description = ""
        
        if jd_text and jd_text.strip():
            job_description = JDParser.extract_from_text(jd_text)
        elif jd_url and jd_url.strip():
            job_description = JDParser.extract_from_url(jd_url)
        elif jd_file:
            content = await jd_file.read()
            if jd_file.filename.lower().endswith('.pdf'):
                job_description = JDParser.extract_from_pdf(content)
            elif jd_file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                 job_description = JDParser.extract_from_image(content)
            else:
                raise HTTPException(status_code=400, detail="Unsupported file type")
        else:
             raise HTTPException(status_code=400, detail="No job description provided (text, url, or file required)")

        if not job_description or not job_description.strip():
             raise HTTPException(status_code=400, detail="Could not extract text from the provided job description input")
             
        result = llm_service.generate_interview_questions(job_description)
        return result
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Interview Prep Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate interview questions")
