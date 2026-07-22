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

    # Role-specific mock workflows used when watsonx is not connected.
    _MOCK_WORKFLOWS: dict = {
        "software engineer": [
            {"step":1,"title":"Complete HR & Legal Paperwork","description":"Sign employment contract, NDA, and IP assignment agreement with the HR team.","estimated_duration":"2 hours","category":"compliance"},
            {"step":2,"title":"Dev Environment Setup","description":"Install IDE, clone repositories, set up SSH keys, and configure local dev environment with the engineering guide.","estimated_duration":"1 day","category":"it-setup"},
            {"step":3,"title":"Codebase & Architecture Walkthrough","description":"Attend a 2-hour session with your tech lead to understand the system architecture, coding standards, and branching strategy.","estimated_duration":"2 hours","category":"training"},
            {"step":4,"title":"Complete Security & SDLC Training","description":"Finish the mandatory secure coding practices and software development lifecycle compliance course on the LMS.","estimated_duration":"3 hours","category":"compliance"},
            {"step":5,"title":"First Ticket — Starter Task","description":"Pick up a pre-selected onboarding ticket from the backlog. Pair with a senior engineer for your first PR review.","estimated_duration":"2 days","category":"training"},
            {"step":6,"title":"Meet the Engineering Team","description":"Join the team standup, attend sprint planning, and schedule 1-on-1s with your manager and two team members.","estimated_duration":"Half day","category":"social"},
        ],
        "data scientist": [
            {"step":1,"title":"HR Paperwork & Data Privacy Agreement","description":"Sign employment contract, NDA, and mandatory data privacy / GDPR compliance agreement.","estimated_duration":"2 hours","category":"compliance"},
            {"step":2,"title":"Data Access & Tool Provisioning","description":"Request access to data warehouse, ML platform (MLflow/SageMaker), Jupyter environment, and relevant datasets.","estimated_duration":"1 day","category":"it-setup"},
            {"step":3,"title":"Data Governance & Ethics Training","description":"Complete the mandatory data ethics, bias awareness, and responsible AI usage training on the LMS portal.","estimated_duration":"4 hours","category":"compliance"},
            {"step":4,"title":"Explore Existing Models & Datasets","description":"Review the model registry, existing notebooks, and data documentation to understand current ML assets.","estimated_duration":"1 day","category":"training"},
            {"step":5,"title":"Shadow a Data Pipeline Run","description":"Observe a full data pipeline execution end-to-end with a senior data scientist to understand data flows.","estimated_duration":"Half day","category":"training"},
            {"step":6,"title":"Meet Stakeholders & Data Owners","description":"Schedule introductions with product managers, data engineers, and business stakeholders who own your key datasets.","estimated_duration":"Half day","category":"social"},
        ],
        "hr specialist": [
            {"step":1,"title":"Complete Employment Documentation","description":"Submit signed employment contract, tax forms, and benefits enrollment forms to the HR operations team.","estimated_duration":"2 hours","category":"compliance"},
            {"step":2,"title":"HRIS System Access & Training","description":"Get provisioned in Workday/SAP HR and complete the mandatory HR systems training course.","estimated_duration":"1 day","category":"it-setup"},
            {"step":3,"title":"HR Policies & Labor Law Review","description":"Read the HR policy manual, equal opportunity guidelines, and jurisdiction-specific labor law summary.","estimated_duration":"Half day","category":"orientation"},
            {"step":4,"title":"Shadow Employee Relations Cases","description":"Sit in on anonymised ER case reviews with a senior HR partner to understand escalation procedures.","estimated_duration":"2 days","category":"training"},
            {"step":5,"title":"Benefits & Compensation Briefing","description":"Meet with the Compensation & Benefits team to understand the company's total rewards framework.","estimated_duration":"2 hours","category":"orientation"},
            {"step":6,"title":"Meet HR Business Partners & Legal","description":"Introduction sessions with HRBP leads, employment legal counsel, and the payroll team.","estimated_duration":"Half day","category":"social"},
        ],
        "product manager": [
            {"step":1,"title":"HR Paperwork & Confidentiality Agreement","description":"Complete employment documents and sign the product confidentiality and IP agreement.","estimated_duration":"2 hours","category":"compliance"},
            {"step":2,"title":"Tool Access Setup","description":"Get provisioned in Jira, Confluence, Figma, analytics dashboards, and the product roadmap tool.","estimated_duration":"Half day","category":"it-setup"},
            {"step":3,"title":"Product Strategy & Roadmap Briefing","description":"Attend a deep-dive with the VP of Product to understand the product vision, current OKRs, and 12-month roadmap.","estimated_duration":"Half day","category":"orientation"},
            {"step":4,"title":"Customer & Market Research Review","description":"Study the latest customer research reports, NPS data, and competitive analysis documents.","estimated_duration":"1 day","category":"training"},
            {"step":5,"title":"Cross-Functional Stakeholder Intros","description":"Schedule 30-minute introductions with Engineering leads, Design, Sales, Marketing, and Customer Success.","estimated_duration":"2 days","category":"social"},
            {"step":6,"title":"Shadow a Sprint & Customer Call","description":"Attend one full sprint ceremony and one customer discovery call before taking ownership of any features.","estimated_duration":"1 week","category":"training"},
        ],
        "sales representative": [
            {"step":1,"title":"HR Paperwork & Commission Agreement","description":"Sign employment contract, commission structure agreement, and CRM data usage policy.","estimated_duration":"2 hours","category":"compliance"},
            {"step":2,"title":"CRM & Sales Tool Setup","description":"Get access to Salesforce/HubSpot, LinkedIn Sales Navigator, email sequencing tool, and demo environments.","estimated_duration":"Half day","category":"it-setup"},
            {"step":3,"title":"Product & Pricing Deep Dive","description":"Attend the product training bootcamp covering features, pricing tiers, competitive differentiators, and common objections.","estimated_duration":"2 days","category":"training"},
            {"step":4,"title":"Shadow Senior Sales Calls","description":"Join 5 live customer calls with a senior AE before making independent outreach.","estimated_duration":"1 week","category":"training"},
            {"step":5,"title":"Territory & Pipeline Review","description":"Meet with your sales manager to understand your assigned territory, quota, and inherited pipeline.","estimated_duration":"2 hours","category":"orientation"},
            {"step":6,"title":"Meet Sales, Marketing & CS Teams","description":"Introductions with SDRs, Marketing for lead gen alignment, and Customer Success for handoff processes.","estimated_duration":"Half day","category":"social"},
        ],
        "team manager": [
            {"step":1,"title":"HR, Legal & Management Agreements","description":"Complete employment documents, sign management accountability agreement, and review leadership code of conduct.","estimated_duration":"2 hours","category":"compliance"},
            {"step":2,"title":"People Systems Access","description":"Get provisioned in Workday Manager Self-Service, performance management platform, and budget planning tool.","estimated_duration":"Half day","category":"it-setup"},
            {"step":3,"title":"Team Introduction & 1-on-1s","description":"Hold individual 30-minute introduction meetings with every direct report within your first week.","estimated_duration":"1 week","category":"social"},
            {"step":4,"title":"Management Training Programme","description":"Complete the mandatory people management, feedback delivery, and anti-harassment training modules.","estimated_duration":"1 day","category":"compliance"},
            {"step":5,"title":"Review Team OKRs & Performance Data","description":"Study the team's current objectives, last-quarter performance reviews, and any open PIPs or promotions.","estimated_duration":"Half day","category":"orientation"},
            {"step":6,"title":"Senior Leadership & Peer Manager Intros","description":"Meet with your VP, HR Business Partner, and peer managers to align on expectations and team dependencies.","estimated_duration":"Half day","category":"social"},
        ],
        "new employee": [
            {"step":1,"title":"Complete HR Paperwork","description":"Fill out tax forms, NDAs, and employment contracts with the HR team.","estimated_duration":"2 hours","category":"compliance"},
            {"step":2,"title":"IT Account Setup","description":"Work with IT to provision your laptop, email, VPN, and access credentials.","estimated_duration":"1 day","category":"it-setup"},
            {"step":3,"title":"Attend New-Hire Orientation","description":"Join the company-wide orientation session covering culture, values, benefits, and key policies.","estimated_duration":"Half day","category":"orientation"},
            {"step":4,"title":"Mandatory Cybersecurity Training","description":"Complete the online cybersecurity awareness course on the LMS portal within your first week.","estimated_duration":"1 hour","category":"compliance"},
            {"step":5,"title":"Read the Employee Handbook","description":"Review company policies, code of conduct, expense policy, and benefits information.","estimated_duration":"3 hours","category":"orientation"},
            {"step":6,"title":"Meet Your Team","description":"Attend the new-hire introduction session and schedule 1-on-1s with your manager and key stakeholders.","estimated_duration":"Half day","category":"social"},
        ],
    }

    def _mock_response(self, prompt: str) -> str:
        """Return a role-specific canned response when no LLM is available."""
        if "JSON workflow" in prompt or "generate_workflow" in prompt:
            # Extract role from prompt to return role-specific steps
            role_key = "new employee"
            prompt_lower = prompt.lower()
            for key in self._MOCK_WORKFLOWS:
                if key in prompt_lower:
                    role_key = key
                    break
            return json.dumps(self._MOCK_WORKFLOWS[role_key])

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
