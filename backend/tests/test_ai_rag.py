from app.services.ai_service import triage_ticket, _heuristic_triage
from app.services.rag_service import retrieve_relevant_articles, seed_chroma_kb


def test_heuristic_triage_classification():
    # Billing classification
    res_bill = _heuristic_triage(
        "Charged twice on my Visa card",
        "My bank statement shows two duplicate charges for subscription."
    )
    assert res_bill.category == "Billing"
    assert res_bill.priority in ["High", "Medium"]

    # Technical classification
    res_tech = _heuristic_triage(
        "HTTP 500 internal server error",
        "Getting 500 error when calling webhook API endpoint."
    )
    assert res_tech.category == "Technical"

    # General classification
    res_gen = _heuristic_triage(
        "Question about roadmap",
        "How do I submit a feature request for the team?"
    )
    assert res_gen.category == "General"


def test_chroma_kb_retrieval():
    seed_chroma_kb()
    results = retrieve_relevant_articles("Where can I download my VAT invoice receipt?", top_k=2)
    assert len(results) > 0
    # At least one article should contain invoice or billing
    found_relevant = any("invoice" in r.title.lower() or "billing" in r.category.lower() for r in results)
    assert found_relevant


def test_suggest_reply_endpoint(client, customer_headers, agent_headers):
    # Customer creates ticket
    create_res = client.post(
        "/api/tickets",
        headers=customer_headers,
        json={
            "title": "Need refund for duplicate subscription fee",
            "description": "I was accidentally billed twice on my renewal date."
        }
    )
    ticket_id = create_res.json()["id"]

    # Customer tries to call suggest-reply -> 403 Forbidden
    cust_attempt = client.get(f"/api/tickets/{ticket_id}/suggest-reply", headers=customer_headers)
    assert cust_attempt.status_code == 403

    # Agent calls suggest-reply -> 200 OK with suggested_reply and sources
    agent_res = client.get(f"/api/tickets/{ticket_id}/suggest-reply", headers=agent_headers)
    assert agent_res.status_code == 200
    suggestion_data = agent_res.json()
    assert "suggested_reply" in suggestion_data
    assert len(suggestion_data["suggested_reply"]) > 20
    assert "sources" in suggestion_data
    assert len(suggestion_data["sources"]) > 0

