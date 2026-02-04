from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from app.db.session import SessionLocal
from app.models.resume import Resume
from app.services.ats_service import ATSService

router = APIRouter()
ats_service = ATSService()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class ATSCheckRequest(BaseModel):
    resume_id: str

class ATSResponse(BaseModel):
    ats_score: int
    missing_sections: List[str]
    hard_skills_found: List[str]
    soft_skills_found: List[str]
    formatting_issues: List[str]
    improvement_suggestions: List[str]

from app.models.score import ResumeScore
import datetime

from app.api.deps import get_current_user
from app.models.user import User

@router.post("/check", response_model=ATSResponse)
async def check_ats_score(
    request: ATSCheckRequest, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Fetch Resume
    resume = db.query(Resume).filter(Resume.resume_id == request.resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # 2. Analyze
    try:
        if not resume.extracted_text:
             raise HTTPException(status_code=400, detail="Resume has no text content")
             
        # Validation: Check if it's actually a resume
        if not ats_service.is_resume(resume.extracted_text):
            raise HTTPException(
                status_code=400, 
                detail="Document does not appear to be a resume. ATS scan skipped."
            )

        result = ats_service.analyze_resume(resume.extracted_text)
        
        # 3. Save Score History
        score_entry = ResumeScore(
            resume_id=request.resume_id,
            user_id=current_user.id,
            ats_score=result.get("ats_score", 0),
            missing_skills=",".join(result.get("missing_sections", [])) + " | " + ",".join(result.get("improvement_suggestions", [])[:3]),
            timestamp=datetime.datetime.utcnow()
        )
        
        # 4. Update Resume latest score
        resume.latest_ats_score = result.get("ats_score", 0)
        
        db.add(score_entry)
        db.commit()

        return result
    except Exception as e:
        print(f"ATS Check Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to perform ATS analysis")
