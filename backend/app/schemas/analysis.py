from typing import List, Optional
from pydantic import BaseModel

class JobDescriptionRequest(BaseModel):
    job_description: str
    top_k: Optional[int] = 5
    resume_id: Optional[str] = None

class MatchResult(BaseModel):
    resume_id: str
    score: float
    filename: Optional[str] = None
    missing_skills: List[str] = []
    strengths: List[str] = []
    improvement_suggestions: List[str] = []

class AnalysisResponse(BaseModel):
    match_score: float
    top_matches: List[MatchResult]
    interview_questions: List[str] = []
