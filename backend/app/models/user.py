from sqlalchemy import Column, Integer, String, DateTime
from app.db.base import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String, nullable=True)
    reset_token = Column(String, nullable=True)
    reset_token_expiry = Column(DateTime, nullable=True)
    reset_token_expiry = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
