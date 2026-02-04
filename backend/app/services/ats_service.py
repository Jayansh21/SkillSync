import json
from typing import Dict, List
from app.services.llm_service import LLMService

class ATSService:
    def __init__(self):
        self.llm_service = LLMService()

    def is_resume(self, text: str) -> bool:
        """
        Heuristic check to see if the document appears to be a resume.
        """
        text_lower = text.lower()
        
        # 1. Negative Checks (Paper Detection)
        # If it has "abstract" AND "introduction" in first 1000 chars, it's likely a paper
        header_section = text_lower[:1500]
        if "abstract" in header_section and "introduction" in header_section:
            return False
            
        # 2. Essential Contact Info (Mandatory)
        # Must have at least an email or phone pattern
        import re
        has_email = "@" in text
        # Simple phone check: look for 10 digits or patterns like (123) 456-7890
        # This is a loose check to avoid false negatives on varied formats
        phone_pattern = re.search(r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
        has_phone = phone_pattern is not None
        
        if not (has_email or has_phone):
            return False

        # 3. Mandatory Section Headers
        # Must have at least ONE core section: Experience OR Education
        education_keywords = ["education", "academic history", "qualifications"]
        has_education = any(keyword in text_lower for keyword in education_keywords)
        
        experience_keywords = ["experience", "employment", "work history", "professional background"]
        has_experience = any(keyword in text_lower for keyword in experience_keywords)
        
        if not (has_education or has_experience):
            return False
            
        # 4. Secondary Confidence Check
        # If we passed above, we have Contact + (Edu OR Exp). 
        # Let's enforce a threshold of "Resume-like words".
        resume_score = 0
        if has_education: resume_score += 1
        if has_experience: resume_score += 1
        
        skills_keywords = ["skills", "technical skills", "languages", "competencies", "technologies"]
        if any(keyword in text_lower for keyword in skills_keywords):
            resume_score += 1
            
        projects_keywords = ["projects", "personal projects", "certifications", "awards"]
        if any(keyword in text_lower for keyword in projects_keywords):
            resume_score += 1

        # We already know we have Contact + 1 Core section.
        # If we have BOTH Edu and Exp, we are good (Score 2).
        # If we have (Edu OR Exp) + Skills, we are good (Score 2).
        # If we only have (Edu OR Exp) and nothing else, it might be sparse but valid?
        # Let's require score >= 2 to be safe against generic letters.
        
        return resume_score >= 2

    def analyze_resume(self, resume_text: str) -> Dict:
        """
        Analyzes a resume for ATS compatibility and general quality using LLM.
        """
        prompt = f"""
        You are an expert ATS (Applicant Tracking System) optimizing consultant. 
        Analyze the following resume text and provide a structured assessment.
        
        Resume Text:
        {resume_text[:4000]}  # Truncate to avoid context limits if overly long

        Evaluate based on:
        1. Section Completeness (Contact, Summary, Experience, Education, Skills)
        2. Action Verbs & Keywords (Use of strong professional language)
        3. Quantifiable Results (Are there metrics/numbers in experience?)
        4. formatting_readability (Is the text structure logical?)

        Return ONLY a valid JSON object with this exact structure:
        {{
            "ats_score": <integer from 0 to 100>,
            "missing_sections": [<list of strings of missing or weak sections>],
            "hard_skills_found": [<list of strings>],
            "soft_skills_found": [<list of strings>],
            "formatting_issues": [<list of strings describing potential parsing issues>],
            "improvement_suggestions": [<list of actionable advice strings>]
        }}
        """
        
        response = self.llm_service._call_groq([{"role": "user", "content": prompt}])
        
        # Fallback if empty
        if not response:
            return {
                "ats_score": 0,
                "missing_sections": ["Error analyzing resume"],
                "hard_skills_found": [],
                "soft_skills_found": [],
                "formatting_issues": ["Could not process text"],
                "improvement_suggestions": ["Please try again"]
            }
            
        return response
