from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from app.db.session import SessionLocal
from app.models.resume import Resume
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class ResumeVersionResponse(BaseModel):
    resume_id: str
    filename: str
    version_number: int
    version_label: Optional[str] = None
    upload_time: datetime
    latest_ats_score: Optional[int] = None

@router.get("/{filename}", response_model=List[ResumeVersionResponse])
async def get_resume_versions(
    filename: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all versions of a specific resume file.
    """
    versions = db.query(Resume)\
        .filter(Resume.user_id == current_user.id, Resume.filename == filename)\
        .order_by(Resume.version_number.desc())\
        .all()
        
    if not versions:
        raise HTTPException(status_code=404, detail="No resume found with this filename")
        
    return versions
