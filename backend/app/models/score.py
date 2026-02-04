from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from app.db.base import Base
import datetime

class ResumeScore(Base):
    __tablename__ = "resume_scores"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(String, index=True)
    user_id = Column(Integer, index=True)
    ats_score = Column(Float)
    missing_skills = Column(String) # Stored as comma-separated or simple string representation
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
