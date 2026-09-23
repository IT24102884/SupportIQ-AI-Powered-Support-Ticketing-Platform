def test_register_customer(client):
    response = client.post(
        "/api/auth/register",
        json={
            "name": "Jane Doe",
            "email": "jane@example.com",
            "password": "securepassword",
            "role": "customer"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "jane@example.com"
    assert data["user"]["role"] == "customer"


def test_register_duplicate_email(client, test_customer):
    response = client.post(
        "/api/auth/register",
        json={
            "name": "Another",
            "email": test_customer.email,
            "password": "somepassword",
            "role": "customer"
        }
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_login_success(client, test_customer):
    response = client.post(
        "/api/auth/login",
        json={
            "email": test_customer.email,
            "password": "password123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["id"] == test_customer.id


def test_login_invalid_password(client, test_customer):
    response = client.post(
        "/api/auth/login",
        json={
            "email": test_customer.email,
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401


def test_get_me(client, customer_headers, test_customer):
    response = client.get("/api/auth/me", headers=customer_headers)
    assert response.status_code == 200
    assert response.json()["email"] == test_customer.email

