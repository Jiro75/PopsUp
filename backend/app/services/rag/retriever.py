"""
RAG – Retriever.

High-level interface: given a user query string, return the most
relevant DocumentChunk objects from Qdrant.
Falls back gracefully when Qdrant or sentence-transformers is unavailable.
"""

import logging
from app.services.rag.embedder import _mock_embed, _SENTENCE_TRANSFORMERS_AVAILABLE
from app.models.document import DocumentChunk

logger = logging.getLogger(__name__)


def retrieve(query: str, top_k: int = 5) -> list[DocumentChunk]:
    """
    Embed the query and retrieve the top-k matching chunks.
    Returns empty list if Qdrant is unreachable (demo mode).
    """
    try:
        from app.services.rag.vector_store import search
        if _SENTENCE_TRANSFORMERS_AVAILABLE:
            from app.services.rag.embedder import _get_model
            query_vector: list[float] = _get_model().encode(query).tolist()
        else:
            from app.config.settings import get_settings
            query_vector = _mock_embed(query, get_settings().embedding_dim)
        chunks = search(query_vector, top_k=top_k)
        logger.info("Retrieved %d chunks for query: %.60s…", len(chunks), query)
        return chunks
    except Exception as exc:
        logger.warning("Retriever unavailable (%s) — returning empty context.", exc)
        return []
