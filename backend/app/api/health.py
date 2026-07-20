"""
Health check router.

GET /health  →  { "status": "ok", "version": "..." }
"""

from fastapi import APIRouter
from app.config.settings import get_settings

router = APIRouter()


@router.get("")
async def health():
    settings = get_settings()
    return {
        "status": "ok",
        "app": settings.app_name,
        "version": settings.app_version,
    }
