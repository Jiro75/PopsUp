"""
Documents router.

GET    /documents  — returns list of ingested filenames.
DELETE /documents  — clears all documents (demo reset).
"""

import logging
from fastapi import APIRouter, HTTPException
from app.schemas.documents import DocumentListResponse, DeleteDocumentsResponse
from app.services.rag.vector_store import list_sources, clear_collection

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("", response_model=DocumentListResponse)
async def get_documents():
    """
    Return the deduplicated list of filenames that have been ingested
    into the vector store.
    """
    try:
        filenames = list_sources()
        return DocumentListResponse(filenames=filenames, count=len(filenames))
    except Exception as exc:
        logger.error("get_documents error: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))


@router.delete("", response_model=DeleteDocumentsResponse)
async def clear_documents():
    """
    Drop and recreate the vector store collection, removing all ingested
    documents. Intended for demo resets.
    """
    try:
        deleted = clear_collection()
        if deleted:
            return DeleteDocumentsResponse(
                deleted=True,
                message="All documents have been cleared.",
            )
        return DeleteDocumentsResponse(
            deleted=False,
            message="Vector store unavailable — no documents were cleared.",
        )
    except Exception as exc:
        logger.error("clear_documents error: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))
