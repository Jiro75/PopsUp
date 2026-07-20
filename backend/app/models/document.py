"""
Internal domain model for a parsed document chunk.
This is NOT a database ORM model — it is a plain dataclass used
throughout the processing pipeline.
"""

from dataclasses import dataclass, field
from typing import Optional


@dataclass
class DocumentChunk:
    """A single text chunk produced by the chunking stage."""

    text: str
    source_filename: str
    chunk_index: int
    page_number: Optional[int] = None

    # Populated by the embedder
    embedding: list[float] = field(default_factory=list)

    # Populated when retrieved from Qdrant
    score: float = 0.0

    def to_dict(self) -> dict:
        return {
            "text": self.text,
            "source_filename": self.source_filename,
            "chunk_index": self.chunk_index,
            "page_number": self.page_number,
        }
