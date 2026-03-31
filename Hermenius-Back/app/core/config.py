from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Hermenius"
    
    OPENROUTER_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    
    BACKEND_CORS_ORIGINS: List[str] = ["*"] # CORS
    
    MAX_UPLOAD_SIZE: int = 50 * 1024 * 1024  # 50 MB
    MAX_ROWS_ANALYSIS: int = 10000

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()