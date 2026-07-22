"""
RAG – Vector store.

Wraps Qdrant operations: create collection, upsert points, search.
All interactions with Qdrant are isolated here so the rest of the
codebase never imports the Qdrant client directly.

Raises ImportError / ConnectionError gracefully when Qdrant is not
available so the app still starts in demo mode.

Public API summary
------------------
ensure_collection()          – create collection if absent
upsert_chunks(chunks)        – embed + store document chunks
search(query_vector, top_k)  – nearest-neighbour retrieval
list_sources()               – deduplicated list of ingested filenames
clear_collection()           – drop + recreate collection (demo reset)
"""

import uuid
import logging
from typing import Optional

from app.config.settings import get_settings
from app.models.document import DocumentChunk

try:
    from qdrant_client import QdrantClient
    from qdrant_client.models import (
        Distance,
        VectorParams,
        PointStruct,
    )
    _QDRANT_AVAILABLE = True
except ImportError:
    _QDRANT_AVAILABLE = False

logger = logging.getLogger(__name__)


def _get_client():
    if not _QDRANT_AVAILABLE:
        raise RuntimeError("qdrant-client is not installed.")
    settings = get_settings()
    return QdrantClient(host=settings.qdrant_host, port=settings.qdrant_port)


def ensure_collection() -> None:
    """Create the Qdrant collection if it does not already exist."""
    settings = get_settings()
    client = _get_client()
    existing = [c.name for c in client.get_collections().collections]
    if settings.qdrant_collection not in existing:
        client.create_collection(
            collection_name=settings.qdrant_collection,
            vectors_config=VectorParams(
                size=settings.embedding_dim,
                distance=Distance.COSINE,
            ),
        )
        logger.info("Created Qdrant collection: %s", settings.qdrant_collection)
    else:
        logger.debug("Qdrant collection already exists: %s", settings.qdrant_collection)


def upsert_chunks(chunks: list[DocumentChunk]) -> int:
    """Store embedded chunks in Qdrant. Returns 0 if Qdrant unavailable."""
    if not _QDRANT_AVAILABLE:
        logger.warning("Qdrant not available — skipping upsert (demo mode).")
        return len(chunks)
    try:
        settings = get_settings()
        client = _get_client()
        ensure_collection()
        points = [
            PointStruct(
                id=str(uuid.uuid4()),
                vector=chunk.embedding,
                payload=chunk.to_dict(),
            )
            for chunk in chunks
            if chunk.embedding
        ]
        client.upsert(collection_name=settings.qdrant_collection, points=points)
        logger.info("Upserted %d points to Qdrant.", len(points))
        return len(points)
    except Exception as exc:
        logger.warning("Qdrant upsert failed (%s) — skipping.", exc)
        return len(chunks)


def search(query_vector: list[float], top_k: int = 5) -> list[DocumentChunk]:
    """Retrieve top-k chunks. Returns [] if Qdrant unavailable."""
    if not _QDRANT_AVAILABLE:
        return []
    settings = get_settings()
    client = _get_client()

    results = client.search(
        collection_name=settings.qdrant_collection,
        query_vector=query_vector,
        limit=top_k,
        with_payload=True,
    )

    chunks: list[DocumentChunk] = []
    for hit in results:
        payload = hit.payload or {}
        chunk = DocumentChunk(
            text=payload.get("text", ""),
            source_filename=payload.get("source_filename", "unknown"),
            chunk_index=payload.get("chunk_index", 0),
            page_number=payload.get("page_number"),
            score=hit.score,
        )
        chunks.append(chunk)

    return chunks


def list_document_filenames() -> list[str]:
    """Return a deduplicated list of ingested source filenames. Returns [] if Qdrant unavailable."""
    if not _QDRANT_AVAILABLE:
        return []
    try:
        settings = get_settings()
        client = _get_client()
        existing = [c.name for c in client.get_collections().collections]
        if settings.qdrant_collection not in existing:
            return []

        filenames: set[str] = set()
        offset = None
        while True:
            records, offset = client.scroll(
                collection_name=settings.qdrant_collection,
                scroll_filter=None,
                limit=100,
                offset=offset,
                with_payload=True,
                with_vectors=False,
            )
            for record in records:
                name = (record.payload or {}).get("source_filename")
                if name:
                    filenames.add(name)
            if offset is None:
                break
        return sorted(filenames)
    except Exception as exc:
        logger.warning("list_document_filenames failed (%s).", exc)
        return []


def delete_all_documents() -> bool:
    """Drop and recreate the Qdrant collection, clearing all stored documents.
    Returns True on success, False if Qdrant is unavailable."""
    if not _QDRANT_AVAILABLE:
        logger.warning("Qdrant not available — delete_all_documents is a no-op.")
        return False
    try:
        settings = get_settings()
        client = _get_client()
        existing = [c.name for c in client.get_collections().collections]
        if settings.qdrant_collection in existing:
            client.delete_collection(settings.qdrant_collection)
            logger.info("Deleted Qdrant collection: %s", settings.qdrant_collection)
        ensure_collection()
        return True
    except Exception as exc:
        logger.error("delete_all_documents failed (%s).", exc)
        return False


def list_sources() -> list[str]:
    """
    Return a deduplicated, sorted list of source filenames currently
    stored in the collection.

    Delegates to :func:`list_document_filenames`.
    Returns ``[]`` when Qdrant is unavailable (demo mode).
    """
    return list_document_filenames()


def clear_collection() -> bool:
    """
    Drop and recreate the Qdrant collection, removing every stored chunk.

    Delegates to :func:`delete_all_documents`.
    Returns ``True`` on success, ``False`` when Qdrant is unavailable.
    """
    return delete_all_documents()
