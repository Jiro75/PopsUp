"""
Document parser service.

Supports:
  - PDF  → PyMuPDF (fitz)
  - DOCX → python-docx

Returns plain text extracted from the file.
TODO: add OCR fallback for scanned PDFs (pytesseract).
"""

import os
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


def parse_pdf(file_path: str) -> str:
    """Extract text from a PDF file using PyMuPDF."""
    try:
        import fitz  # type: ignore  # PyMuPDF

        doc = fitz.open(file_path)
        pages: list[str] = []
        for page in doc:
            pages.append(page.get_text())
        doc.close()
        text = "\n".join(pages)
        logger.info("PDF parsed: %s  (%d pages)", file_path, len(pages))
        return text
    except Exception as exc:
        logger.error("Failed to parse PDF %s: %s", file_path, exc)
        raise


def parse_docx(file_path: str) -> str:
    """Extract text from a DOCX file using python-docx."""
    try:
        from docx import Document  # type: ignore

        doc = Document(file_path)
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        text = "\n".join(paragraphs)
        logger.info("DOCX parsed: %s  (%d paragraphs)", file_path, len(paragraphs))
        return text
    except Exception as exc:
        logger.error("Failed to parse DOCX %s: %s", file_path, exc)
        raise


def parse_document(file_path: str) -> str:
    """
    Dispatch to the correct parser based on file extension.

    Raises:
        ValueError: if the file type is unsupported.
    """
    ext = Path(file_path).suffix.lower()
    if ext == ".pdf":
        return parse_pdf(file_path)
    elif ext in (".docx", ".doc"):
        return parse_docx(file_path)
    else:
        raise ValueError(f"Unsupported file type: {ext}")
