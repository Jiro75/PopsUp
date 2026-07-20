"""
RAG – Embedder.

Generates vector embeddings using sentence-transformers.
The model is loaded once (singleton) for performance.

TODO: swap with IBM watsonx embeddings when available.

DEMO MODE: when sentence-transformers is not installed, uses random
vectors so the rest of the pipeline still runs without ML deps.
"""

import logging
import hashlib
import math
from functools import lru_cache

from app.config.settings import get_settings
from app.models.document import DocumentChunk

logger = logging.getLogger(__name__)

_SENTENCE_TRANSFORMERS_AVAILABLE = False
try:
    from sentence_transformers import SentenceTransformer  # noqa: F401
    _SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    logger.warning("sentence-transformers not installed — using deterministic mock embeddings.")


@lru_cache()
def _get_model():
    """Load and cache the SentenceTransformer model."""
    settings = get_settings()
    logger.info("Loading embedding model: %s", settings.embedding_model)
    from sentence_transformers import SentenceTransformer
    return SentenceTransformer(settings.embedding_model)


def _mock_embed(text: str, dim: int = 384) -> list[float]:
    """Deterministic pseudo-embedding based on text hash (demo only)."""
    seed = int(hashlib.md5(text.encode()).hexdigest(), 16)
    vec = []
    for i in range(dim):
        seed = (seed * 1664525 + 1013904223) & 0xFFFFFFFF
        vec.append((seed / 0xFFFFFFFF) * 2 - 1)
    norm = math.sqrt(sum(x * x for x in vec)) or 1.0
    return [x / norm for x in vec]


def embed_chunks(chunks: list[DocumentChunk]) -> list[DocumentChunk]:
    """
    Populate the `.embedding` field on each chunk in-place.
    Falls back to mock embeddings when sentence-transformers is unavailable.
    """
    if _SENTENCE_TRANSFORMERS_AVAILABLE:
        model = _get_model()
        texts = [c.text for c in chunks]
        vectors = model.encode(texts, show_progress_bar=False)
        for chunk, vector in zip(chunks, vectors):
            chunk.embedding = vector.tolist()
    else:
        settings = get_settings()
        for chunk in chunks:
            chunk.embedding = _mock_embed(chunk.text, settings.embedding_dim)

    logger.info("Embedded %d chunks.", len(chunks))
    return chunks
