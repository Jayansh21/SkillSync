from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import Optional
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.services.similarity_service import SimilarityService
from app.services.jd_parser import JDParser

router = APIRouter()
similarity_service = SimilarityService()

@router.post("/match")
async def match_job_description(
    resume_id: str = Form(...),
    jd_text: Optional[str] = Form(None),
    jd_url: Optional[str] = Form(None),
    jd_file: Optional[UploadFile] = File(None),
    top_k: int = Form(3),
    db: Session = Depends(get_db)
):
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

        results = similarity_service.find_similar_resumes(
            job_description, 
            k=top_k,
            resume_id=resume_id,
            db=db
        )
        return results
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
