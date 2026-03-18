from pydantic import BaseModel
import os

class Settings(BaseModel):
    app_env: str = os.getenv("APP_ENV", "local")
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./data/app.db")
    cors_origins: list[str] = os.getenv(
        "CORS_ORIGINS", "http://localhost:3000,http://localhost:5173"
    ).split(",")

    jwt_secret_key: str = os.getenv(
        "JWT_SECRET_KEY", "orive-dev-secret-change-in-production"
    )

    ai_mode: str = os.getenv("AI_MODE", "mock")  # mock | llm
    llm_provider: str = os.getenv("LLM_PROVIDER", "openai")
    openai_api_key: str | None = os.getenv("OPENAI_API_KEY")
    openai_model: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

settings = Settings()
