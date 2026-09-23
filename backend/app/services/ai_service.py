import json
import logging
import re
from typing import Optional
from openai import OpenAI

from app.core.config import settings
from app.schemas.ai import TriageResult

logger = logging.getLogger(__name__)


def _heuristic_triage(title: str, description: str) -> TriageResult:
    """Intelligent rule-based fallback when LLM API key is not configured or fails."""
    text = f"{title} {description}".lower()

    billing_keywords = [
        "charge", "refund", "invoice", "receipt", "credit card", "billing",
        "payment", "subscription", "price", "plan", "upgrade", "downgrade",
        "cost", "cancel plan", "tax", "vat", "dollar", "$", "money", "charged"
    ]
    technical_keywords = [
        "error", "bug", "exception", "500", "504", "429", "404", "timeout",
        "crash", "api", "webhook", "token", "sso", "saml", "endpoint",
        "rate limit", "sdk", "code", "latency", "failure", "broken", "script",
        "postman", "payload", "hmac", "auth error"
    ]

    # Priority keywords
    high_keywords = [
        "urgent", "critical", "outage", "down", "duplicate charge", "unauthorized",
        "production", "broken", "emergency", "immediately", "blocked", "data loss",
        "cannot login", "can't access"
    ]
    low_keywords = [
        "how to", "question", "feedback", "feature request", "roadmap", "curious",
        "suggestion", "documentation", "guide", "where can i find"
    ]

    # Category determination
    billing_score = sum(1 for kw in billing_keywords if kw in text)
    tech_score = sum(1 for kw in technical_keywords if kw in text)

    if billing_score > tech_score and billing_score > 0:
        category = "Billing"
    elif tech_score > 0:
        category = "Technical"
    else:
        category = "General"

    # Priority determination
    if any(kw in text for kw in high_keywords):
        priority = "High"
    elif any(kw in text for kw in low_keywords) and category == "General":
        priority = "Low"
    else:
        priority = "Medium"

    reasoning = f"Heuristic classification: detected keywords matching {category} category and {priority} priority."
    return TriageResult(category=category, priority=priority, reasoning=reasoning)


def triage_ticket(title: str, description: str) -> TriageResult:
    """
    Triages a ticket into Category ('Billing', 'Technical', 'General')
    and Priority ('Low', 'Medium', 'High').
    Uses OpenAI/Groq if configured, with guaranteed fallback to heuristic triage.
    """
    api_key = settings.OPENAI_API_KEY or settings.GROQ_API_KEY
    base_url = settings.OPENAI_BASE_URL
    model = settings.OPENAI_MODEL

    # If Groq key provided without base URL, set Groq endpoint
    if settings.GROQ_API_KEY and not settings.OPENAI_API_KEY and not base_url:
        base_url = "https://api.groq.com/openai/v1"
        model = settings.GROQ_MODEL

    if not api_key:
        logger.info("No LLM API key detected, running deterministic heuristic triage.")
        return _heuristic_triage(title, description)

    try:
        client = OpenAI(api_key=api_key, base_url=base_url)
        system_prompt = (
            "You are an expert customer support triage AI. "
            "Analyze the ticket title and description and output strict JSON with fields: "
            "'category' (MUST be one of: 'Billing', 'Technical', 'General'), "
            "'priority' (MUST be one of: 'Low', 'Medium', 'High'), and "
            "'reasoning' (1 concise sentence explaining the classification). "
            "Do NOT include any markdown code blocks or additional text."
        )
        user_prompt = f"Ticket Title: {title}\nTicket Description: {description}"

        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.0,
            max_tokens=150,
        )

        content = response.choices[0].message.content or ""
        # Clean any accidental code block markers
        clean_json = re.sub(r"^```json\s*|\s*```$", "", content.strip(), flags=re.MULTILINE)
        data = json.loads(clean_json)

        # Validate category and priority
        category = data.get("category", "General")
        if category not in ["Billing", "Technical", "General"]:
            category = "General"

        priority = data.get("priority", "Medium")
        if priority not in ["Low", "Medium", "High"]:
            priority = "Medium"

        reasoning = data.get("reasoning", "Classified by LLM triage.")
        return TriageResult(category=category, priority=priority, reasoning=reasoning)

    except Exception as e:
        logger.warning(f"LLM triage failed ({e}). Falling back to heuristic triage.")
        return _heuristic_triage(title, description)

