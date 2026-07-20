"""Request / response schemas for document-related endpoints."""

from pydantic import BaseModel, Field
from typing import Optional


class UploadResponse(BaseModel):
    filename: str
    chunks_stored: int
    message: str = "Document processed successfully."


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    session_id: Optional[str] = None  # TODO: use for conversation memory


class ChatResponse(BaseModel):
    answer: str
    sources: list[str] = []   # chunk excerpts used as context


class WorkflowRequest(BaseModel):
    role: Optional[str] = "new employee"
    department: Optional[str] = None
    custom_context: Optional[str] = None  # free-text override


class WorkflowStep(BaseModel):
    step: int
    title: str
    description: str
    estimated_duration: Optional[str] = None   # e.g. "30 minutes"
    category: Optional[str] = None             # e.g. "compliance", "it-setup"


class WorkflowResponse(BaseModel):
    role: str
    steps: list[WorkflowStep]
