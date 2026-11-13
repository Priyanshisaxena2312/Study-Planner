def get_auth_token(client, email="user@example.com"):
    res = client.post(
        "/api/auth/register",
        json={"email": email, "password": "Password123!", "full_name": "Test User"}
    )
    return res.json()["access_token"]

def test_subject_crud(client):
    token = get_auth_token(client, "sub_tester@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create subject
    create_res = client.post(
        "/api/subjects",
        json={"name": "Mathematics", "code": "MATH-101", "tone": "sage", "exam_date": "2026-11-20"},
        headers=headers
    )
    assert create_res.status_code == 201
    sub_data = create_res.json()
    assert sub_data["name"] == "Mathematics"
    sub_id = sub_data["id"]

    # 2. List subjects
    list_res = client.get("/api/subjects", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) == 1

    # 3. Update subject
    update_res = client.put(
        f"/api/subjects/{sub_id}",
        json={"name": "Advanced Calculus"},
        headers=headers
    )
    assert update_res.status_code == 200
    assert update_res.json()["name"] == "Advanced Calculus"

    # 4. Delete subject
    del_res = client.delete(f"/api/subjects/{sub_id}", headers=headers)
    assert del_res.status_code == 204

    # 5. List after delete
    list_after = client.get("/api/subjects", headers=headers)
    assert len(list_after.json()) == 0

def test_multi_tenant_isolation(client):
    # User A creates a subject
    token_a = get_auth_token(client, "user_a@example.com")
    headers_a = {"Authorization": f"Bearer {token_a}"}
    sub_a_res = client.post(
        "/api/subjects",
        json={"name": "User A Private Physics", "code": "PHY-101"},
        headers=headers_a
    )
    sub_a_id = sub_a_res.json()["id"]

    # User B registers
    token_b = get_auth_token(client, "user_b@example.com")
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # User B lists subjects -> should be empty!
    list_b = client.get("/api/subjects", headers=headers_b)
    assert len(list_b.json()) == 0

    # User B attempts to delete User A's subject -> must return 404
    del_b = client.delete(f"/api/subjects/{sub_a_id}", headers=headers_b)
    assert del_b.status_code == 404

def test_timetable_session_flow(client):
    token = get_auth_token(client, "timetable_tester@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    create_res = client.post(
        "/api/timetable",
        json={
            "day": "Thu",
            "start_time": "08:00 AM",
            "end_time": "09:30 AM",
            "subject": "Mathematics",
            "topic": "Integration by parts",
            "tag": "High priority",
            "color": "sage"
        },
        headers=headers
    )
    assert create_res.status_code == 201
    session_id = create_res.json()["id"]

    # Toggle done
    toggle_res = client.patch(f"/api/timetable/{session_id}/toggle", headers=headers)
    assert toggle_res.status_code == 200
    assert toggle_res.json()["done"] is True

    # Move to Friday
    move_res = client.patch(f"/api/timetable/{session_id}/move", json={"target_day": "Fri"}, headers=headers)
    assert move_res.status_code == 200
    assert move_res.json()["day"] == "Fri"

def test_focus_and_goals_sync(client):
    token = get_auth_token(client, "focus_tester@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    # Create daily hours goal
    goal_res = client.post(
        "/api/goals",
        json={"title": "Daily study hours", "goal_type": "daily", "category": "hours", "target": 4.0, "current": 0.0},
        headers=headers
    )
    goal_id = goal_res.json()["id"]

    # Log 30 min focus sprint
    focus_res = client.post(
        "/api/focus-logs",
        json={"timestamp": "2026-11-13T10:00:00Z", "subject": "Math", "topic": "Calculus", "duration_minutes": 30},
        headers=headers
    )
    assert focus_res.status_code == 201

    # Check that goal was automatically incremented by 0.5h
    goals_list = client.get("/api/goals", headers=headers)
    assert goals_list.json()[0]["current"] == 0.5

