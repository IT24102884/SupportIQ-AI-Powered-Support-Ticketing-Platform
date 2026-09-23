def test_ticket_message_thread(client, customer_headers, agent_headers):
    # 1. Customer creates ticket
    create_res = client.post(
        "/api/tickets",
        headers=customer_headers,
        json={
            "title": "Need help with invoice receipt",
            "description": "Where can I find the PDF receipt for last month?"
        }
    )
    assert create_res.status_code == 201
    ticket_id = create_res.json()["id"]

    # 2. Agent replies with AI-suggested flag
    agent_msg_res = client.post(
        f"/api/tickets/{ticket_id}/messages",
        headers=agent_headers,
        json={
            "message": "Hi! You can find your official PDF invoices in Settings > Billing > Invoices.",
            "is_ai_suggested": True
        }
    )
    assert agent_msg_res.status_code == 201
    msg_data = agent_msg_res.json()
    assert msg_data["is_ai_suggested"] is True
    assert "Settings > Billing" in msg_data["message"]

    # 3. Customer views full thread
    get_res = client.get(f"/api/tickets/{ticket_id}", headers=customer_headers)
    assert get_res.status_code == 200
    ticket_data = get_res.json()
    assert len(ticket_data["messages"]) == 2
    assert ticket_data["messages"][1]["is_ai_suggested"] is True

