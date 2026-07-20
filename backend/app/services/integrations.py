"""
Mock integration layer.

These placeholder functions simulate third-party HR system calls.
Each teammate can replace a function body with a real API call
without affecting the rest of the codebase.

Systems modelled:
  - Workday  (HR tickets)
  - Outlook  (email notifications)
  - Active Directory / Entra ID (account provisioning)
  - Slack    (welcome message)
  - Jira     (task creation)
"""

import logging
from datetime import datetime, timezone
from typing import Optional

logger = logging.getLogger(__name__)


# ── Workday ──────────────────────────────────────────────────────────────────

def create_hr_ticket(
    employee_name: str,
    role: str,
    department: Optional[str] = None,
) -> dict:
    """
    Create an onboarding ticket in Workday.

    TODO: replace with real Workday REST API call.
    """
    ticket_id = f"WD-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}"
    logger.info("[MOCK] Created HR ticket %s for %s", ticket_id, employee_name)
    return {
        "system": "Workday",
        "ticket_id": ticket_id,
        "employee_name": employee_name,
        "role": role,
        "department": department,
        "status": "open",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }


# ── Outlook / Exchange ────────────────────────────────────────────────────────

def send_welcome_email(
    to_address: str,
    employee_name: str,
    start_date: str,
) -> dict:
    """
    Send a welcome email via Outlook / Exchange.

    TODO: replace with Microsoft Graph API call.
    """
    logger.info("[MOCK] Sending welcome email to %s", to_address)
    return {
        "system": "Outlook",
        "to": to_address,
        "subject": f"Welcome to the team, {employee_name}!",
        "status": "sent",
        "sent_at": datetime.now(timezone.utc).isoformat(),
    }


# ── Active Directory / Entra ID ───────────────────────────────────────────────

def provision_account(
    employee_name: str,
    role: str,
    department: Optional[str] = None,
) -> dict:
    """
    Create an Active Directory / Entra ID account.

    TODO: replace with Microsoft Graph / AD API call.
    """
    username = employee_name.lower().replace(" ", ".")
    logger.info("[MOCK] Provisioning AD account for %s", username)
    return {
        "system": "ActiveDirectory",
        "username": f"{username}@company.com",
        "role": role,
        "department": department,
        "groups": ["All-Employees", "VPN-Access", role.replace(" ", "-")],
        "status": "provisioned",
        "provisioned_at": datetime.now(timezone.utc).isoformat(),
    }


# ── Slack ─────────────────────────────────────────────────────────────────────

def send_slack_welcome(
    channel: str,
    employee_name: str,
) -> dict:
    """
    Post a welcome message to a Slack channel.

    TODO: replace with Slack Web API call using a bot token.
    """
    logger.info("[MOCK] Sending Slack welcome to #%s for %s", channel, employee_name)
    return {
        "system": "Slack",
        "channel": f"#{channel}",
        "message": f"🎉 Please welcome our newest team member, {employee_name}!",
        "status": "posted",
        "posted_at": datetime.now(timezone.utc).isoformat(),
    }


# ── Jira ──────────────────────────────────────────────────────────────────────

def create_onboarding_tasks(
    employee_name: str,
    workflow_steps: list[dict],
) -> dict:
    """
    Create Jira tasks for each onboarding workflow step.

    TODO: replace with Jira REST API v3 call.
    """
    project_key = "ONBOARD"
    tasks = [
        {
            "key": f"{project_key}-{i + 1:03d}",
            "summary": step.get("title", f"Step {i + 1}"),
            "assignee": employee_name,
            "status": "To Do",
        }
        for i, step in enumerate(workflow_steps)
    ]
    logger.info("[MOCK] Created %d Jira tasks for %s", len(tasks), employee_name)
    return {
        "system": "Jira",
        "project": project_key,
        "tasks": tasks,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
