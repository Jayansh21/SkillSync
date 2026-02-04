from typing import Dict, List, Optional
import json
import requests
from app.core.config import settings

class LLMService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.base_url = "https://api.groq.com/openai/v1/chat/completions"
        self.model = "llama-3.3-70b-versatile" # Supported Groq model

    def _call_groq(self, messages: List[Dict], json_mode: bool = True) -> Dict:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.2, 
        }
        
        if json_mode:
            payload["response_format"] = {"type": "json_object"}
            
        try:
            response = requests.post(self.base_url, headers=headers, json=payload, timeout=30)
            
            if response.status_code != 200:
                print(f"Groq API Error: {response.status_code} - {response.text}")
                return {}
                
            response.raise_for_status()
            content = response.json()['choices'][0]['message']['content']
            
            if json_mode:
                try:
                    return json.loads(content)
                except json.JSONDecodeError:
                    print("Failed to parse JSON response from LLM")
                    return {}
            return content
        except Exception as e:
            print(f"LLM API Exception: {e}")
            return {}

    def analyze_skill_gap(self, resume_text: str, job_description: str) -> Dict:
        system_prompt = """
        You are an expert technical recruiter and career coach. 
        Analyze the Resume against the Job Description.
        Identify missing critical skills, strengths, and specific actionable improvement suggestions.
        Return logic ONLY as valid JSON in the following format:
        {
            "missing_skills": ["skill1", "skill2"],
            "strengths": ["strength1", "strength2"],
            "improvement_suggestions": ["suggestion1", "suggestion2"]
        }
        """
        
        user_prompt = f"""
        JOB DESCRIPTION:
        {job_description[:2000]}
        
        RESUME:
        {resume_text[:2000]}
        """
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        return self._call_groq(messages)

    def generate_interview_questions(self, job_description: str) -> Dict:
        system_prompt = """
        You are an expert interview coach. Analyze the job description provided.
        Provide a JSON response with:
        1. "company_overview": A brief summary of what the company does (if inferred) or the nature of the role.
        2. "role_expectations": What is expected from this candidate (2-3 sentences).
        3. "interview_focus": Key technical or behavioral areas to focus on.
        4. "questions": A list of 10 relevant interview questions (technical + behavioral).
        5. "disclaimer": Standard disclaimer.

        Format:
        {
            "company_overview": "...",
            "role_expectations": "...",
            "interview_focus": "...",
            "questions": ["q1", "q2", ...],
            "disclaimer": "..."
        }
        """
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": job_description[:3000]} # Increased context limit slightly
        ]
        
        return self._call_groq(messages)
