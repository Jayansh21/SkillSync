from fastapi import APIRouter
from app.api.routes import health, resume, analysis, ats, progress, interview, auth

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(resume.router, prefix="/resume", tags=["resume"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["analysis"])
api_router.include_router(ats.router, prefix="/ats", tags=["ats"])
api_router.include_router(progress.router, prefix="/progress", tags=["progress"])
api_router.include_router(interview.router, prefix="/interview", tags=["interview"])
from app.api.routes import versions
api_router.include_router(versions.router, prefix="/resume/versions", tags=["versions"])
