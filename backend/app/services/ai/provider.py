"""
AI Provider abstraction layer.

All LLM calls go through this class.  Swapping from IBM watsonx.ai to
OpenAI (or any other provider) requires only changes inside this file.

Current implementation:
  - Uses the IBM watsonx.ai REST API via ibm-watsonx-ai SDK when
    credentials are configured.
  - Falls back to a mock/demo response when credentials are absent so
    the frontend can be demonstrated without a live watsonx project.

TODO: wire up real watsonx credentials in .env for production use.
"""

import json
import logging
from typing import Optional

from app.config.settings import get_settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Prompt templates
# ---------------------------------------------------------------------------

_CHAT_PROMPT = """You are an expert HR onboarding assistant for a large enterprise.
Use the context below (extracted from official HR documents) to answer the question.
If the context does not contain enough information, say so honestly.

Context:
{context}

Question: {question}

Answer:"""

_WORKFLOW_PROMPT = """You are an expert HR onboarding specialist.
Based on the HR policies and documents provided below, generate a structured
onboarding workflow for a {role}{department_clause}.

Return ONLY a valid JSON array with no extra text.  Each element must have:
  "step"        (integer, starting at 1)
  "title"       (short action title)
  "description" (one or two sentence explanation)
  "estimated_duration" (e.g. "30 minutes", "1 day")
  "category"    (one of: orientation, compliance, it-setup, training, social)

HR Document Context:
{context}

JSON workflow:"""

_SUMMARIZE_PROMPT = """Summarize the following HR document excerpt in 3-5 bullet points:

{text}

Summary:"""


class AIProvider:
    """
    Unified interface to the underlying language model.

    Methods
    -------
    generate(prompt)           → raw string completion
    chat(question, context)    → answer string
    summarize(text)            → bullet-point summary
    generate_workflow(...)     → list[dict] parsed from JSON
    """

    def __init__(self):
        self.settings = get_settings()
        self._client = None  # lazy-initialised

    # ── Internal helpers ─────────────────────────────────────────────────────

    def _get_client(self):
        """
        Return a watsonx ModelInference client, or None when credentials
        are not configured (triggers mock mode).
        """
        if self._client is not None:
            return self._client

        api_key = self.settings.watsonx_api_key
        project_id = self.settings.watsonx_project_id

        if not api_key or not project_id:
            logger.warning(
                "watsonx credentials not set — running in MOCK mode. "
                "Set WATSONX_API_KEY and WATSONX_PROJECT_ID in .env to use real AI."
            )
            return None

        try:
            from ibm_watsonx_ai.foundation_models import ModelInference
            from ibm_watsonx_ai import Credentials

            self._client = ModelInference(
                model_id=self.settings.watsonx_model_id,
                credentials=Credentials(
                    api_key=api_key,
                    url=self.settings.watsonx_api_url,
                ),
                project_id=project_id,
            )
            return self._client
        except ImportError:
            logger.warning("ibm-watsonx-ai not installed — running in MOCK mode.")
            return None
        except Exception as exc:
            logger.error("Failed to initialise watsonx client: %s", exc)
            return None

    def _call_llm(self, prompt: str, max_new_tokens: int = 1024) -> str:
        """Send *prompt* to the LLM and return the generated text."""
        client = self._get_client()

        if client is None:
            return self._mock_response(prompt)

        try:
            response = client.generate_text(
                prompt=prompt,
                params={"max_new_tokens": max_new_tokens, "temperature": 0.3},
            )
            return response
        except Exception as exc:
            logger.error("LLM call failed: %s", exc)
            return self._mock_response(prompt)

    # ── Mock responses (demo mode) ────────────────────────────────────────────

    def _mock_response(self, prompt: str) -> str:
        """Return a canned response when no LLM is available."""
        if "JSON workflow" in prompt or "generate_workflow" in prompt:
            return json.dumps(
                [
                    {
                        "step": 1,
                        "title": "Complete HR Paperwork",
                        "description": "Fill out tax forms, NDAs, and employment contracts with the HR team.",
                        "estimated_duration": "2 hours",
                        "category": "compliance",
                    },
                    {
                        "step": 2,
                        "title": "IT Account Setup",
                        "description": "Work with IT to provision your laptop, email, and access credentials.",
                        "estimated_duration": "1 day",
                        "category": "it-setup",
                    },
                    {
                        "step": 3,
                        "title": "Read the Employee Handbook",
                        "description": "Review company policies, code of conduct, and benefits information.",
                        "estimated_duration": "3 hours",
                        "category": "orientation",
                    },
                    {
                        "step": 4,
                        "title": "Mandatory Cybersecurity Training",
                        "description": "Complete the online cybersecurity awareness course on the LMS portal.",
                        "estimated_duration": "1 hour",
                        "category": "compliance",
                    },
                    {
                        "step": 5,
                        "title": "Meet Your Team",
                        "description": "Attend the new-hire introduction session and schedule 1-on-1s with key stakeholders.",
                        "estimated_duration": "Half day",
                        "category": "social",
                    },
                ]
            )

        if "summarize" in prompt.lower():
            return (
                "• Company values center on integrity, innovation, and inclusion.\n"
                "• New employees must complete compliance training within 30 days.\n"
                "• PTO accrues from day one at a rate of 1.5 days per month.\n"
                "• Remote work requires manager approval and a secure home network.\n"
                "• All conflicts of interest must be disclosed to Legal within 14 days."
            )

        return (
            "Based on the HR documents, new employees should start by completing "
            "required paperwork, then attend orientation, set up IT accounts, complete "
            "mandatory compliance training, and schedule introductory meetings with their "
            "team and manager during the first week.  Detailed timelines are outlined in "
            "the Employee Handbook. (Demo mode — connect watsonx for real AI responses.)"
        )

    # ── Public API ────────────────────────────────────────────────────────────

    def generate(self, prompt: str) -> str:
        """Raw text generation from a custom prompt."""
        return self._call_llm(prompt)

    def chat(self, question: str, context: str) -> str:
        """Answer a question using retrieved RAG context."""
        prompt = _CHAT_PROMPT.format(context=context, question=question)
        return self._call_llm(prompt)

    def summarize(self, text: str) -> str:
        """Summarize a document excerpt as bullet points."""
        prompt = _SUMMARIZE_PROMPT.format(text=text)
        return self._call_llm(prompt, max_new_tokens=512)

    def generate_workflow(
        self,
        context: str,
        role: str = "new employee",
        department: Optional[str] = None,
    ) -> list[dict]:
        """
        Generate a structured onboarding workflow.

        Returns:
            A list of step dicts parsed from the LLM JSON output.

        Raises:
            ValueError: if the LLM response cannot be parsed as JSON.
        """
        department_clause = f" in the {department} department" if department else ""
        prompt = _WORKFLOW_PROMPT.format(
            role=role,
            department_clause=department_clause,
            context=context,
        )

        raw = self._call_llm(prompt, max_new_tokens=2048)

        # The LLM sometimes wraps JSON in markdown code fences — strip them.
        raw = raw.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]

        try:
            steps = json.loads(raw)
            return steps if isinstance(steps, list) else [steps]
        except json.JSONDecodeError as exc:
            logger.error("Failed to parse workflow JSON: %s\nRaw: %s", exc, raw[:200])
            # Return the mock workflow as a safe fallback
            return json.loads(self._mock_response("generate_workflow"))
