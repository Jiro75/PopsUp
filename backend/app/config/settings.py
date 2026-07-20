"""
Application settings loaded from environment variables.
Uses pydantic-settings so every value can be overridden via a .env file.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # ── Application ──────────────────────────────────────────────────────────
    app_name: str = "HR Onboarding Orchestrator"
    app_version: str = "0.1.0"
    debug: bool = False

    # ── Qdrant ────────────────────────────────────────────────────────────────
    qdrant_host: str = "qdrant"
    qdrant_port: int = 6333
    qdrant_collection: str = "hr_documents"

    # ── Embedding model ───────────────────────────────────────────────────────
    embedding_model: str = "all-MiniLM-L6-v2"
    embedding_dim: int = 384

    # ── Chunking ──────────────────────────────────────────────────────────────
    chunk_size: int = 512
    chunk_overlap: int = 64

    # ── IBM watsonx.ai ────────────────────────────────────────────────────────
    # TODO: fill these in when a real watsonx project is available
    watsonx_api_url: str = "https://us-south.ml.cloud.ibm.com"
    watsonx_api_key: str = ""
    watsonx_project_id: str = ""
    watsonx_model_id: str = "ibm/granite-13b-instruct-v2"

    # ── File upload ───────────────────────────────────────────────────────────
    upload_dir: str = "/tmp/hr_uploads"
    max_upload_size_mb: int = 20

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Return a cached Settings singleton."""
    return Settings()
