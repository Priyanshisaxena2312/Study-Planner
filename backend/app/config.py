import os

class Settings:
    PROJECT_NAME: str = "Smart Study Planner API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Secret key for JWT signing
    SECRET_KEY: str = os.getenv("SECRET_KEY", "smart_study_planner_super_secret_jwt_key_2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database: SQLite by default for instant zero-config setup, supports PostgreSQL via DATABASE_URL
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./study_planner.db")
    
    # CORS Origins
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

settings = Settings()
