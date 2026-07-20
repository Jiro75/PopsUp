"""
RAG – Document loader.

Saves an uploaded file to the configured upload directory and
delegates text extraction to the parser service.
"""

import os
import logging
from pathlib import Path

from app.config.settings import get_settings
from app.services.parser.document_parser import parse_document

logger = logging.getLogger(__name__)


def save_and_load(filename: str, content: bytes) -> str:
    """
    Persist *content* to disk and extract its text.

    Args:
        filename: original filename (used to determine file type).
        content:  raw bytes of the uploaded file.

    Returns:
        Extracted plain text.
    """
    settings = get_settings()
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)

    dest = upload_dir / filename
    dest.write_bytes(content)
    logger.info("File saved to %s", dest)

    return parse_document(str(dest))
