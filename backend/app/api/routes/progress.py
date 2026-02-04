from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
import datetime

from app.db.session import SessionLocal
from app.models.score import ResumeScore
from app.models.resume import Resume

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class ProgressItem(BaseModel):
    id: int
    resume_id: str
    filename: str
    ats_score: float
    timestamp: datetime.datetime
    summary_bit: str

from app.api.deps import get_current_user
from app.models.user import User

@router.get("/", response_model=List[ProgressItem])
async def get_progress(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Fetch chronological progress of resumes."""
    # Join scores with resume info
    # Filter by user_id
    
    results = db.query(ResumeScore, Resume.filename, Resume.version_number, Resume.version_label)\
        .join(Resume, ResumeScore.resume_id == Resume.resume_id)\
        .filter(ResumeScore.user_id == current_user.id)\
        .order_by(ResumeScore.timestamp.asc()).all()
    
    response = []
    for score, filename, v_num, v_lbl in results:
        response.append({
            "id": score.id,
            "resume_id": score.resume_id,
            "filename": filename,
            "ats_score": score.ats_score,
            "timestamp": score.timestamp,
            "summary_bit": score.missing_skills
        })
        
    return response
