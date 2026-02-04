from sqlalchemy import Column, Integer, String, DateTime
from app.db.base import Base
import datetime

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(String, unique=True, index=True)
    filename = Column(String)
    filepath = Column(String)
    upload_time = Column(DateTime, default=datetime.datetime.utcnow)
    extracted_text = Column(String)
    chunk_count = Column(Integer)
    user_id = Column(Integer, index=True)
    
    # Versioning
    version_number = Column(Integer, default=1)
    version_label = Column(String, nullable=True)
    latest_ats_score = Column(Integer, nullable=True) # Store latest score directly on resume for easy access

