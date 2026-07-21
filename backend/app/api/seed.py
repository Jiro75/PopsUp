"""
Seed router.

POST /seed — auto-ingests the bundled sample document so the demo
             works without a manual upload step.
"""

import logging
from pathlib import Path
from fastapi import APIRouter, HTTPException
from app.schemas.documents import SeedResponse
from app.services.rag.chunker import chunk_text
from app.services.rag.embedder import embed_chunks
from app.services.rag.vector_store import upsert_chunks

logger = logging.getLogger(__name__)
router = APIRouter()

# Resolved relative to this file: backend/app/api/ → backend/sample_data/
_SAMPLE_DIR = Path(__file__).parent.parent.parent / "sample_data"
_SAMPLE_FILES = ["employee_handbook.txt"]


@router.post("", response_model=list[SeedResponse])
async def seed_documents():
    """
    Ingest all bundled sample documents into the vector store.

    Plain-text files are read directly; the full RAG pipeline
    (chunk → embed → store) is applied to each one.  Re-running
    this endpoint is safe — Qdrant upserts are idempotent.
    """
    results: list[SeedResponse] = []

    for name in _SAMPLE_FILES:
        path = _SAMPLE_DIR / name
        if not path.exists():
            logger.warning("Sample file not found, skipping: %s", path)
            continue

        try:
            text = path.read_text(encoding="utf-8")
            chunks = chunk_text(text, source_filename=name)
            chunks = embed_chunks(chunks)
            stored = upsert_chunks(chunks)
            logger.info("Seeded '%s': %d chunks stored.", name, stored)
            results.append(
                SeedResponse(
                    filename=name,
                    chunks_stored=stored,
                    message="Sample document ingested successfully.",
                )
            )
        except Exception as exc:
            logger.error("Failed to seed '%s': %s", name, exc)
            raise HTTPException(
                status_code=500,
                detail=f"Failed to seed '{name}': {exc}",
            )

    if not results:
        raise HTTPException(
            status_code=404,
            detail="No sample files found to seed.",
        )

    return results
