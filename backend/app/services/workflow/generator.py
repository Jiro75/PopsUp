"""
Workflow generation service.

Orchestrates: RAG retrieval → AI provider → schema validation.
"""

import logging
from typing import Optional

from app.services.rag.retriever import retrieve
from app.services.ai.provider import AIProvider
from app.schemas.documents import WorkflowStep, WorkflowResponse

logger = logging.getLogger(__name__)

_ai = AIProvider()


def generate_onboarding_workflow(
    role: str = "new employee",
    department: Optional[str] = None,
    custom_context: Optional[str] = None,
) -> WorkflowResponse:
    """
    Full pipeline: retrieve HR context → generate workflow via LLM →
    validate and return as WorkflowResponse.

    Args:
        role:           Target role (e.g. "software engineer", "manager").
        department:     Optional department hint.
        custom_context: Optional extra context injected alongside RAG results.

    Returns:
        WorkflowResponse with validated steps.
    """
    # Build a natural language query to retrieve relevant HR policy chunks
    query = f"onboarding checklist for {role}"
    if department:
        query += f" in {department}"

    chunks = retrieve(query, top_k=6)
    context_parts = [c.text for c in chunks]

    if custom_context:
        context_parts.insert(0, custom_context)

    context = "\n\n---\n\n".join(context_parts) if context_parts else (
        "Use general HR onboarding best practices."
    )

    raw_steps: list[dict] = _ai.generate_workflow(
        context=context, role=role, department=department
    )

    # Validate each step through the Pydantic schema
    validated_steps: list[WorkflowStep] = []
    for i, raw in enumerate(raw_steps):
        try:
            validated_steps.append(WorkflowStep(**raw))
        except Exception as exc:
            logger.warning("Skipping invalid workflow step %d: %s", i, exc)

    return WorkflowResponse(role=role, steps=validated_steps)
