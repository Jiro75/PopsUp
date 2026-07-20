"""
Upload router.

POST /upload
  - Accepts one or more files (PDF / DOCX).
  - Runs the full RAG ingestion pipeline.
  - Returns chunk counts per file.
"""

import logging
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.schemas.documents import UploadResponse
from app.services.rag.loader import save_and_load
from app.services.rag.chunker import chunk_text
from app.services.rag.embedder import embed_chunks
from app.services.rag.vector_store import upsert_chunks
from app.config.settings import get_settings

logger = logging.getLogger(__name__)
router = APIRouter()

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc"}


@router.post("", response_model=list[UploadResponse])
async def upload_documents(files: list[UploadFile] = File(...)):
    """
    Ingest one or more HR documents through the full RAG pipeline:
    save → parse → chunk → embed → store in Qdrant.
    """
    settings = get_settings()
    results: list[UploadResponse] = []

    for file in files:
        filename = file.filename or "unknown"
        ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=415,
                detail=f"Unsupported file type '{ext}'. Allowed: {ALLOWED_EXTENSIONS}",
            )

        content = await file.read()
        size_mb = len(content) / (1024 * 1024)
        if size_mb > settings.max_upload_size_mb:
            raise HTTPException(
                status_code=413,
                detail=f"File '{filename}' exceeds {settings.max_upload_size_mb} MB limit.",
            )

        try:
            text = save_and_load(filename, content)
            chunks = chunk_text(text, filename)
            chunks = embed_chunks(chunks)
            stored = upsert_chunks(chunks)
            results.append(UploadResponse(filename=filename, chunks_stored=stored))
            logger.info("Ingested '%s': %d chunks stored.", filename, stored)
        except Exception as exc:
            logger.error("Failed to process '%s': %s", filename, exc)
            raise HTTPException(status_code=500, detail=f"Processing failed: {exc}")

    return results
