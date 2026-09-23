from app.services.rag_service import retrieve_relevant_articles


def test_agent_create_kb_article_and_vector_indexed(client, agent_headers):
    # Agent creates a unique article
    payload = {
        "title": "Quantum Kubernetes Pod Eviction Rule",
        "category": "Technical",
        "content": "Workloads consuming greater than 92% heap memory will be evicted after a 30 second grace window."
    }
    response = client.post("/api/kb/articles", headers=agent_headers, json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == payload["title"]
    assert data["category"] == payload["category"]
    article_id = data["id"]

    # Verify that ChromaDB vector store can retrieve this newly embedded article
    retrieved = retrieve_relevant_articles("heap memory pod eviction", top_k=3)
    matching_titles = [a.title for a in retrieved]
    assert "Quantum Kubernetes Pod Eviction Rule" in matching_titles


def test_customer_cannot_create_kb_article(client, customer_headers):
    payload = {
        "title": "Unauthorized Customer Article",
        "category": "General",
        "content": "Customer attempting to modify corporate knowledge base."
    }
    response = client.post("/api/kb/articles", headers=customer_headers, json=payload)
    assert response.status_code == 403
    assert "Support Agent role required" in response.json()["detail"]


def test_agent_delete_kb_article(client, agent_headers):
    # Create article
    create_res = client.post(
        "/api/kb/articles",
        headers=agent_headers,
        json={
            "title": "Temporary Deprecated Policy",
            "category": "General",
            "content": "This temporary policy will be deleted shortly."
        }
    )
    article_id = create_res.json()["id"]

    # Delete article
    del_res = client.delete(f"/api/kb/articles/{article_id}", headers=agent_headers)
    assert del_res.status_code == 204

    # Verify article is gone from list
    list_res = client.get("/api/kb/articles")
    articles = list_res.json()
    assert all(a["id"] != article_id for a in articles)


def test_agent_sync_kb_vectors(client, agent_headers):
    sync_res = client.post("/api/kb/sync", headers=agent_headers)
    assert sync_res.status_code == 200
    data = sync_res.json()
    assert data["status"] == "success"
    assert "synced" in data
