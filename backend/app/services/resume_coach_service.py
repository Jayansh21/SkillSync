from typing import Dict, List
from app.services.llm_service import LLMService

class ResumeCoachService:
    def __init__(self):
        self.llm_service = LLMService()

    def coach_resume(self, resume_text: str) -> Dict:
        """
        Analyzes resume bullet points and provides rewrites for impact.
        """
        prompt = f"""
        You are an expert Resume Coach and Career Strategist.
        Analyze the following resume text. Identify weak, vague, or passive bullet points in the Experience section.
        
        Resume Text:
        {resume_text[:5000]}

        Task:
        1. Find 3-5 specific bullet points or sentences that are weak (e.g., lack metrics, use passive voice).
        2. Rewrite them to be strong, results-oriented, and impactful (using Google XYZ formula or similar).
        3. Provide 3 general high-level suggestions for the overall resume.

        Return ONLY a JSON object with this structure:
        {{
            "improvements": [
                {{
                    "original": "<exact text of weak bullet>",
                    "improved": "<rewritten strong version>",
                    "reason": "<brief explanation of why this is better>"
                }}
            ],
            "general_suggestions": [
                "<string>",
                "<string>",
                "<string>"
            ]
        }}
        """
        
        response = self.llm_service._call_groq([{"role": "user", "content": prompt}])
        
        if not response:
            return {
                "improvements": [],
                "general_suggestions": ["Could not generate suggestions at this time."]
            }
            
        return response
