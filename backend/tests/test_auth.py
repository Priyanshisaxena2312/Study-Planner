def test_register_user(client):
    response = client.post(
        "/api/auth/register",
        json={"email": "priya@example.com", "password": "SecurePassword123!", "full_name": "Priya Sharma"}
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["email"] == "priya@example.com"
    assert data["full_name"] == "Priya Sharma"

def test_register_duplicate_email(client):
    client.post(
        "/api/auth/register",
        json={"email": "duplicate@example.com", "password": "Password123!"}
    )
    response = client.post(
        "/api/auth/register",
        json={"email": "duplicate@example.com", "password": "Password123!"}
    )
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]

def test_login_user(client):
    client.post(
        "/api/auth/register",
        json={"email": "login@example.com", "password": "Password123!", "full_name": "Student"}
    )
    response = client.post(
        "/api/auth/login",
        json={"email": "login@example.com", "password": "Password123!"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data

def test_login_invalid_password(client):
    client.post(
        "/api/auth/register",
        json={"email": "wrongpwd@example.com", "password": "CorrectPassword123!"}
    )
    response = client.post(
        "/api/auth/login",
        json={"email": "wrongpwd@example.com", "password": "WrongPassword!"}
    )
    assert response.status_code == 401

def test_get_current_user_profile(client):
    reg = client.post(
        "/api/auth/register",
        json={"email": "profile@example.com", "password": "Password123!", "full_name": "Priya Sharma"}
    )
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/auth/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "profile@example.com"
    assert data["full_name"] == "Priya Sharma"

