"""
Tests for admin session, database reset, and reset log endpoints.

Endpoints covered:
  GET  /api/admin/session
  POST /api/admin/reset-database
  GET  /api/admin/reset-logs
"""


# ─────────────────────────────────────────────────────────────
#  Session info
# ─────────────────────────────────────────────────────────────

def test_get_session_as_admin(client, admin_headers):
    # Arrange — admin token ready

    # Act
    response = client.get("/api/admin/session", headers=admin_headers)

    # Assert
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["data"]["role"] == "admin"
    assert body["data"]["username"] == "admin"


def test_get_session_as_cashier(client, cashier_headers):
    # Arrange — cashier token ready

    # Act
    response = client.get("/api/admin/session", headers=cashier_headers)

    # Assert
    assert response.status_code == 200
    body = response.json()
    assert body["data"]["role"] == "cashier"


def test_get_session_without_auth(client):
    # Arrange — no headers

    # Act
    response = client.get("/api/admin/session")

    # Assert
    assert response.status_code == 401


def test_get_session_invalid_token(client):
    # Arrange
    headers = {"Authorization": "Bearer wrong-token-xyz"}

    # Act
    response = client.get("/api/admin/session", headers=headers)

    # Assert
    assert response.status_code == 401


# ─────────────────────────────────────────────────────────────
#  Reset database
# ─────────────────────────────────────────────────────────────

def test_reset_database_success(client, admin_headers, sample_product):
    # Arrange — DB has at least one product (via sample_product fixture)
    payload = {"confirmation": "RESET_CONFIRMED"}

    # Act
    response = client.post("/api/admin/reset-database", json=payload, headers=admin_headers)

    # Assert
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert "deleted" in body["data"]
    assert body["data"]["deleted"]["products"] >= 1


def test_reset_database_creates_reset_log(client, admin_headers):
    # Arrange
    payload = {"confirmation": "RESET_CONFIRMED"}

    # Act
    client.post("/api/admin/reset-database", json=payload, headers=admin_headers)
    logs_response = client.get("/api/admin/reset-logs", headers=admin_headers)

    # Assert
    assert logs_response.status_code == 200
    logs = logs_response.json()["data"]
    assert len(logs) >= 1
    assert logs[0]["performed_by"] == "admin"
    assert logs[0]["performed_role"] == "admin"


def test_reset_database_wrong_confirmation(client, admin_headers):
    # Arrange
    payload = {"confirmation": "WRONG_TOKEN"}

    # Act
    response = client.post("/api/admin/reset-database", json=payload, headers=admin_headers)

    # Assert
    assert response.status_code == 400
    assert response.json()["success"] is False


def test_reset_database_cashier_forbidden(client, cashier_headers):
    # Arrange
    payload = {"confirmation": "RESET_CONFIRMED"}

    # Act
    response = client.post("/api/admin/reset-database", json=payload, headers=cashier_headers)

    # Assert
    assert response.status_code == 403
    assert response.json()["success"] is False


def test_reset_database_no_auth(client):
    # Arrange
    payload = {"confirmation": "RESET_CONFIRMED"}

    # Act
    response = client.post("/api/admin/reset-database", json=payload)

    # Assert
    assert response.status_code == 401


# ─────────────────────────────────────────────────────────────
#  Reset logs
# ─────────────────────────────────────────────────────────────

def test_get_reset_logs_as_admin(client, admin_headers):
    # Arrange — no resets needed; empty list is valid

    # Act
    response = client.get("/api/admin/reset-logs", headers=admin_headers)

    # Assert
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert isinstance(body["data"], list)


def test_get_reset_logs_cashier_forbidden(client, cashier_headers):
    # Arrange — cashier should not access reset logs

    # Act
    response = client.get("/api/admin/reset-logs", headers=cashier_headers)

    # Assert
    assert response.status_code == 403


def test_reset_logs_contain_deleted_counts(client, admin_headers, sample_product):
    # Arrange — seed a product and perform a reset
    client.post(
        "/api/admin/reset-database",
        json={"confirmation": "RESET_CONFIRMED"},
        headers=admin_headers,
    )

    # Act
    response = client.get("/api/admin/reset-logs", headers=admin_headers)

    # Assert
    logs = response.json()["data"]
    assert len(logs) >= 1
    deleted = logs[0]["deleted_counts"]
    assert "products" in deleted
    assert "transactions" in deleted
    assert "transaction_items" in deleted
