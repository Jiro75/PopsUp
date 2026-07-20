"""
Health check router.

GET /health  →  {
    "status": "ok",
    "version": "...",
    "qdrant": "ok" | "unavailable",
    "ai_mode": "watsonx" | "mock"
}
"""

import logging
from fastapi import APIRouter
from app.config.settings import get_settings

logger = logging.getLogger(__name__)
router = APIRouter()


def _qdrant_status() -> str:
    """Ping Qdrant and return 'ok' or 'unavailable'."""
    try:
        from app.services.rag.vector_store import _get_client, _QDRANT_AVAILABLE
        if not _QDRANT_AVAILABLE:
            return "unavailable"
        _get_client().get_collections()
        return "ok"
    except Exception as exc:
        logger.warning("Health: Qdrant unreachable — %s", exc)
        return "unavailable"


def _ai_mode() -> str:
    """Return 'watsonx' when credentials are configured, otherwise 'mock'."""
    settings = get_settings()
    if settings.watsonx_api_key and settings.watsonx_project_id:
        return "watsonx"
    return "mock"


@router.get("")
async def health():
    settings = get_settings()
    return {
        "status": "ok",
        "app": settings.app_name,
        "version": settings.app_version,
        "qdrant": _qdrant_status(),
        "ai_mode": _ai_mode(),
    }
