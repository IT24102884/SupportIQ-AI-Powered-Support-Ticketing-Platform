import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "SupportIQ — AI-Powered Support Ticketing Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # Database (Defaults to SQLite for instant local execution, supports PostgreSQL)
    DATABASE_URL: str = "sqlite:///./tickets.db"

    # Security
    JWT_SECRET: str = "super-secret-key-support-ai-change-in-prod-123456"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # LLM Settings (OpenAI, Groq, Ollama compatible)
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_BASE_URL: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"
    GROQ_API_KEY: Optional[str] = None
    GROQ_MODEL: str = "qwen/qwen3.8-27b"

    # Vector DB Directory
    CHROMA_PERSIST_DIR: str = "./chroma_data"

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()

