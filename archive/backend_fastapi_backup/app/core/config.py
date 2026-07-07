import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Multi-Portal OMS"
    API_V1_STR: str = "/api/v1"
    
    # Database (Fallback to SQLite if no PostgreSQL is available)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./oms_db.sqlite")
    
    # Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-for-local-dev-only")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    class Config:
        env_file = ".env"

settings = Settings()
