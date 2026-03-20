from typing import List, Dict, Tuple
from sqlalchemy.orm import Session
from app.services.embedding_service import EmbeddingService
from app.vectorstore.faiss_store import FAISSStore
from app.utils.text_cleaner import TextCleaner
from app.models.resume import Resume
import numpy as np

class SimilarityService:
    def __init__(self):
        self.embedding_service = EmbeddingService()
        self.vector_store = FAISSStore()

    
    def find_similar_resumes(self, job_description: str, k: int = 5, resume_id: str = None, db: Session = None) -> Dict:
        # Import here to avoid circular dependencies if any
        from app.services.llm_service import LLMService
        # from app.services.resume_parser import ResumeParser # Removed as we use DB now
        llm_service = LLMService()

        # 1. Clean and Embed Request
        cleaned_jd = TextCleaner.clean_text(job_description)
        query_embedding = self.embedding_service.generate_embedding(cleaned_jd)
        
        # 2. Search Vector Store
        raw_results = self.vector_store.search(query_embedding, k=k*3, filter_resume_id=resume_id)
        
        # 3. Aggregate Results by Resume ID
        resume_scores: Dict[str, List[float]] = {}
        resume_meta: Dict[str, Dict] = {}
        
        for dist, idx, metadata in raw_results:
            r_id = metadata.get("resume_id") # Variable name fix (metadata uses resume_id)
            if not r_id:
                continue
            
            similarity = float(1 - (dist / 2))
            
            if r_id not in resume_scores:
                resume_scores[r_id] = []
                resume_meta[r_id] = metadata
            
            resume_scores[r_id].append(similarity)

        # 4. Compute Final Scores per Resume
        final_results = []
        for r_id, scores in resume_scores.items():
            best_score = max(scores)
            avg_score = sum(scores) / len(scores)
            final_score = (best_score * 0.7) + (avg_score * 0.3)
            
            final_results.append({
                "resume_id": r_id,
                "score": float(final_score * 100), 
                "filename": resume_meta[r_id].get("filename"),
                "filepath": resume_meta[r_id].get("filepath") or resume_meta[r_id].get("source") # Handle both keys
            })
            
        final_results.sort(key=lambda x: x["score"], reverse=True)
        top_matches = final_results[:k]
        
        # 5. LLM Analysis for Top Matches
        # Retrieve text from Database using injected Session
        for match in top_matches:
            resume_text = ""
            if db:
                try:
                    db_resume = db.query(Resume).filter(Resume.resume_id == match["resume_id"]).first()
                    if db_resume and db_resume.extracted_text:
                        resume_text = db_resume.extracted_text
                except Exception as e:
                    print(f"Error retrieving resume from DB: {e}")

            # Fallback (optional, maybe check file if local? But we are Cloud now)
            # If no text, we can't analyze.
            
            if resume_text:
                try:
                    analysis = llm_service.analyze_skill_gap(resume_text, cleaned_jd)
                    
                    match.update({
                        "missing_skills": analysis.get("missing_skills", []),
                        "strengths": analysis.get("strengths", []),
                        "improvement_suggestions": analysis.get("improvement_suggestions", [])
                    })
                except Exception as e:
                    print(f"Error analyzing with LLM: {e}")
            else:
                print(f"Warning: No text found for resume {match['resume_id']}, skipping LLM analysis.")
                    
        # 6. Generate Interview Questions (Global)
        interview_questions = llm_service.generate_interview_questions(cleaned_jd)

        return {
            "match_score": top_matches[0]["score"] if top_matches else 0.0,
            "top_matches": top_matches,
            "interview_questions": interview_questions.get("questions", [])
        }
