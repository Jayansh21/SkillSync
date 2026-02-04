import os
from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "SkillSync"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "changethis"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8 
    
    # CORS
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Database
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "skillsync"
    DATABASE_URL: str = "sqlite:///./sql_app.db"
    
    # AI - Groq
    GROQ_API_KEY: str = "gsk_..."

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"

settings = Settings()
