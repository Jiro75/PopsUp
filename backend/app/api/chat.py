"""
Chat router.

POST /chat
  Body: { "message": "..." }
  Returns: { "answer": "...", "sources": [...] }
"""

import logging
from fastapi import APIRouter, HTTPException
from app.schemas.documents import ChatRequest, ChatResponse
from app.services.rag.retriever import retrieve
from app.services.ai.provider import AIProvider

logger = logging.getLogger(__name__)
router = APIRouter()
_ai = AIProvider()


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    RAG-powered chat endpoint.

    1. Retrieve the most relevant chunks from Qdrant.
    2. Send them as context to the LLM.
    3. Return the answer and source excerpts.
    """
    try:
        chunks = retrieve(request.message, top_k=5)

        if not chunks:
            # No documents ingested yet — answer from base LLM knowledge
            context = "No HR documents have been uploaded yet. Answer based on general HR best practices."
            sources: list[str] = []
        else:
            context = "\n\n---\n\n".join(c.text for c in chunks)
            sources = [c.text[:200] + "…" for c in chunks]

        answer = _ai.chat(question=request.message, context=context)
        return ChatResponse(answer=answer, sources=sources)

    except Exception as exc:
        logger.error("Chat error: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))
