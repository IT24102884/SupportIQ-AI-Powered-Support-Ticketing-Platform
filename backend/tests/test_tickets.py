def test_create_ticket_triggers_ai_triage(client, customer_headers):
    # Billing issue with urgent keywords
    response = client.post(
        "/api/tickets",
        headers=customer_headers,
        json={
            "title": "Urgent duplicate charge on credit card",
            "description": "I was charged twice $49 on my Visa statement. Please refund immediately!"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Urgent duplicate charge on credit card"
    assert data["status"] == "Open"
    assert data["category"] == "Billing"
    assert data["priority"] == "High"
    # Thread should contain initial message
    assert len(data["messages"]) == 1
    assert "charged twice" in data["messages"][0]["message"]


def test_list_tickets_agent_vs_customer(client, customer_headers, agent_headers):
    # Customer creates 1 ticket
    client.post(
        "/api/tickets",
        headers=customer_headers,
        json={
            "title": "General question about settings",
            "description": "How do I configure my profile preferences?"
        }
    )

    # Customer list
    cust_res = client.get("/api/tickets", headers=customer_headers)
    assert cust_res.status_code == 200
    cust_tickets = cust_res.json()
    assert len(cust_tickets) >= 1

    # Agent list
    agent_res = client.get("/api/tickets", headers=agent_headers)
    assert agent_res.status_code == 200
    agent_tickets = agent_res.json()
    assert len(agent_tickets) >= len(cust_tickets)


def test_agent_update_ticket(client, customer_headers, agent_headers, test_agent):
    # Create ticket
    create_res = client.post(
        "/api/tickets",
        headers=customer_headers,
        json={
            "title": "API 500 error on webhook endpoint",
            "description": "Receiving HTTP 500 internal server error on all webhook events."
        }
    )
    ticket_id = create_res.json()["id"]

    # Agent claims and updates status
    patch_res = client.patch(
        f"/api/tickets/{ticket_id}",
        headers=agent_headers,
        json={
            "status": "In Progress",
            "agent_id": test_agent.id,
            "priority": "High"
        }
    )
    assert patch_res.status_code == 200
    updated = patch_res.json()
    assert updated["status"] == "In Progress"
    assert updated["agent_id"] == test_agent.id
    assert updated["priority"] == "High"


def test_customer_cannot_see_or_access_other_customer_tickets(client, customer_headers, db_session):
    # Customer A creates a ticket
    create_res = client.post(
        "/api/tickets",
        headers=customer_headers,
        json={
            "title": "Customer A private ticket",
            "description": "Sensitive billing details for Customer A"
        }
    )
    assert create_res.status_code == 201
    ticket_a_id = create_res.json()["id"]

    # Register Customer B
    reg_b = client.post(
        "/api/auth/register",
        json={
            "name": "Customer B",
            "email": "customer_b@example.com",
            "password": "password123",
            "role": "customer"
        }
    )
    assert reg_b.status_code == 201
    token_b = reg_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 1. Customer B lists tickets: Must NOT contain Customer A's ticket
    list_res = client.get("/api/tickets", headers=headers_b)
    assert list_res.status_code == 200
    b_tickets = list_res.json()
    assert all(t["id"] != ticket_a_id for t in b_tickets)

    # 2. Customer B attempts to directly GET Customer A's ticket: Must return 403 Forbidden
    get_res = client.get(f"/api/tickets/{ticket_a_id}", headers=headers_b)
    assert get_res.status_code == 403
    assert "not authorized" in get_res.json()["detail"].lower()

    # 3. Customer B attempts to post message to Customer A's ticket: Must return 403 Forbidden
    msg_res = client.post(
        f"/api/tickets/{ticket_a_id}/messages",
        headers=headers_b,
        json={"message": "Unauthorized message attempt"}
    )
    assert msg_res.status_code == 403


