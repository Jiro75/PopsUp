"""
Workflow router.

POST /workflow
  Body: { "role": "...", "department": "...", "custom_context": "..." }
  Returns: { "role": "...", "steps": [...] }
"""

import logging
from fastapi import APIRouter, HTTPException
from app.schemas.documents import WorkflowRequest, WorkflowResponse
from app.services.workflow.generator import generate_onboarding_workflow

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("", response_model=WorkflowResponse)
async def generate_workflow(request: WorkflowRequest):
    """
    Generate a structured onboarding workflow from HR documents.

    Uses RAG to retrieve relevant HR policy chunks, then asks the LLM
    to convert them into a step-by-step JSON workflow.
    """
    try:
        workflow = generate_onboarding_workflow(
            role=request.role or "new employee",
            department=request.department,
            custom_context=request.custom_context,
        )
        return workflow
    except Exception as exc:
        logger.error("Workflow generation error: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))
