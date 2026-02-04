from typing import List, Dict, Tuple
from app.services.embedding_service import EmbeddingService
from app.vectorstore.faiss_store import FAISSStore
from app.utils.text_cleaner import TextCleaner
import numpy as np

class SimilarityService:
    def __init__(self):
        self.embedding_service = EmbeddingService()
        self.vector_store = FAISSStore()

    
    def find_similar_resumes(self, job_description: str, k: int = 5, resume_id: str = None) -> Dict:
        # Import here to avoid circular dependencies if any
        from app.services.llm_service import LLMService
        from app.services.resume_parser import ResumeParser
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
            resume_id = metadata.get("resume_id")
            if not resume_id:
                continue
            
            similarity = float(1 - (dist / 2))
            
            if resume_id not in resume_scores:
                resume_scores[resume_id] = []
                resume_meta[resume_id] = metadata
            
            resume_scores[resume_id].append(similarity)

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
                "filepath": resume_meta[r_id].get("source") # Assuming source is filepath
            })
            
        final_results.sort(key=lambda x: x["score"], reverse=True)
        top_matches = final_results[:k]
        # 5. LLM Analysis for Top Matches
        # We need to re-read the resume text to send to LLM.
        # Ideally, we would have stored text in a DB. For this file-based version, re-read.
        for match in top_matches:
            filepath = match.get("filepath")
            if filepath:
                try:
                    # Re-parse to get text (clean text only needed)
                    # Optimization: create a retrieve_text method in Parser or Store
                    # Since we added filtering, we are likely analyzing just one resume if resume_id was passed.
                    parsed = ResumeParser.parse_file(filepath) 
                    resume_text = parsed["content"]
                    
                    analysis = llm_service.analyze_skill_gap(resume_text, cleaned_jd)
                    
                    match.update({
                        "missing_skills": analysis.get("missing_skills", []),
                        "strengths": analysis.get("strengths", []),
                        "improvement_suggestions": analysis.get("improvement_suggestions", [])
                    })
                except Exception as e:
                    print(f"Error analyzing with LLM: {e}")
                    
        # 6. Generate Interview Questions (Global)
        interview_questions = llm_service.generate_interview_questions(cleaned_jd)

        return {
            "match_score": top_matches[0]["score"] if top_matches else 0.0,
            "top_matches": top_matches,
            "interview_questions": interview_questions.get("questions", [])
        }
