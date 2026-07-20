"""
RAG – Text chunker.

Splits a long document string into overlapping chunks suitable for
embedding.  Uses LangChain's RecursiveCharacterTextSplitter when
available, falls back to a simple fixed-size splitter otherwise.
"""

import logging
from app.config.settings import get_settings
from app.models.document import DocumentChunk

logger = logging.getLogger(__name__)


def _simple_split(text: str, chunk_size: int, overlap: int) -> list[str]:
    """Minimal fallback splitter — no LangChain required."""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return chunks


def chunk_text(text: str, source_filename: str) -> list[DocumentChunk]:
    """
    Split *text* into overlapping DocumentChunk objects.
    Uses LangChain if available, otherwise uses a simple fallback splitter.
    """
    try:
        from langchain.text_splitter import RecursiveCharacterTextSplitter
        _langchain_available = True
    except ImportError:
        _langchain_available = False

    if not _langchain_available:
        # Fallback: simple character splitter
        settings = get_settings()
        raw_chunks = _simple_split(text, settings.chunk_size, settings.chunk_overlap)
        return [
            DocumentChunk(text=c, source_filename=source_filename, chunk_index=i)
            for i, c in enumerate(raw_chunks) if c.strip()
        ]

    from langchain.text_splitter import RecursiveCharacterTextSplitter

    settings = get_settings()
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.chunk_size,
        chunk_overlap=settings.chunk_overlap,
        separators=["\n\n", "\n", ". ", " ", ""],
    )

    raw_chunks: list[str] = splitter.split_text(text)
    chunks = [
        DocumentChunk(
            text=chunk,
            source_filename=source_filename,
            chunk_index=i,
        )
        for i, chunk in enumerate(raw_chunks)
    ]

    logger.info(
        "Chunked '%s' → %d chunks (size=%d, overlap=%d)",
        source_filename,
        len(chunks),
        settings.chunk_size,
        settings.chunk_overlap,
    )
    return chunks
