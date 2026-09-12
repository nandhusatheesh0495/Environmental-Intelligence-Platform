"""Application configuration settings."""

from pydantic import BaseModel
import os


class Settings(BaseModel):
    PROJECT_NAME: str = "Environmental Intelligence Platform"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    DESCRIPTION: str = (
        "AI-powered environmental change detection and monitoring platform. "
        "Engineered for Environmental and Disaster Management Officers with human-in-the-loop verification."
    )
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]
    DATA_STORAGE_PATH: str = os.getenv("DATA_STORAGE_PATH", "./storage")
    HUMAN_IN_THE_LOOP_ENFORCED: bool = True


settings = Settings()
