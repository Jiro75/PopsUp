"""
FastAPI application factory.

All routers are registered here.  Keep this file thin —
business logic lives in services/.

Registered routes
-----------------
GET    /health       – liveness check: app version, Qdrant status, AI mode
POST   /upload       – ingest one or more PDF/DOCX files into the vector store
GET    /documents    – list all ingested document filenames
DELETE /documents    – clear all documents (demo reset)
POST   /seed         – auto-ingest bundled sample data (no upload required)
POST   /chat         – RAG-powered question answering
POST   /workflow     – generate a structured onboarding workflow
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import get_settings
from app.api import upload, chat, workflow, health, documents, seed

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)

logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="AI-powered HR onboarding workflow orchestrator.",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # ── CORS ──────────────────────────────────────────────────────────────────
    # TODO: restrict origins in production
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Routers ───────────────────────────────────────────────────────────────
    app.include_router(health.router, prefix="/health", tags=["health"])
    app.include_router(upload.router, prefix="/upload", tags=["documents"])
    app.include_router(documents.router, prefix="/documents", tags=["documents"])
    app.include_router(seed.router, prefix="/seed", tags=["documents"])
    app.include_router(chat.router, prefix="/chat", tags=["ai"])
    app.include_router(workflow.router, prefix="/workflow", tags=["ai"])

    logger.info("Application '%s' v%s ready.", settings.app_name, settings.app_version)
    return app


app = create_app()
