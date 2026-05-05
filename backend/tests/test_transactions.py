"""
Tests for the checkout and transaction history endpoints.

Endpoints covered:
  POST /api/transactions/checkout
  GET  /api/transactions/
  GET  /api/transactions/{id}
"""


# ─────────────────────────────────────────────────────────────
#  Checkout
# ─────────────────────────────────────────────────────────────

def test_checkout_success(client, sample_product):
    # Arrange
    payload = {
        "items": [{"product_id": sample_product.id, "quantity": 3}],
        "amount_paid": 100000,
        "payment_method": "cash",
    }
    expected_total = sample_product.price * 3
    expected_change = 100000 - expected_total

    # Act
    response = client.post("/api/transactions/checkout", json=payload)

    # Assert
    assert response.status_code == 201
    body = response.json()
    assert body["success"] is True
    assert body["data"]["total_amount"] == expected_total
    assert body["data"]["change_amount"] == expected_change
    assert body["data"]["status"] == "completed"


def test_checkout_decrements_stock(client, sample_product, session):
    # Arrange
    initial_stock = sample_product.stock
    qty = 5
    payload = {
        "items": [{"product_id": sample_product.id, "quantity": qty}],
        "amount_paid": 999999,
    }

    # Act
    client.post("/api/transactions/checkout", json=payload)

    # Assert
    session.refresh(sample_product)
    assert sample_product.stock == initial_stock - qty


def test_checkout_empty_cart(client):
    # Arrange
    payload = {"items": [], "amount_paid": 50000}

    # Act
    response = client.post("/api/transactions/checkout", json=payload)

    # Assert
    assert response.status_code == 400
    assert response.json()["success"] is False


def test_checkout_insufficient_payment(client, sample_product):
    # Arrange
    total = sample_product.price * 2
    payload = {
        "items": [{"product_id": sample_product.id, "quantity": 2}],
        "amount_paid": total - 1,  # one rupiah short
    }

    # Act
    response = client.post("/api/transactions/checkout", json=payload)

    # Assert
    assert response.status_code == 400
    body = response.json()
    assert body["success"] is False
    assert "less than total" in body["message"].lower() or "kurang" in body["message"].lower()


def test_checkout_out_of_stock(client, sample_product):
    # Arrange — request more than available stock
    payload = {
        "items": [{"product_id": sample_product.id, "quantity": sample_product.stock + 1}],
        "amount_paid": 9999999,
    }

    # Act
    response = client.post("/api/transactions/checkout", json=payload)

    # Assert
    assert response.status_code == 400
    assert response.json()["success"] is False


def test_checkout_product_not_found(client):
    # Arrange
    payload = {
        "items": [{"product_id": 99999, "quantity": 1}],
        "amount_paid": 50000,
    }

    # Act
    response = client.post("/api/transactions/checkout", json=payload)

    # Assert
    assert response.status_code == 404


def test_checkout_zero_quantity_rejected(client, sample_product):
    # Arrange — quantity=0 should fail schema validation
    payload = {
        "items": [{"product_id": sample_product.id, "quantity": 0}],
        "amount_paid": 50000,
    }

    # Act
    response = client.post("/api/transactions/checkout", json=payload)

    # Assert
    assert response.status_code == 422


# ─────────────────────────────────────────────────────────────
#  Get transactions
# ─────────────────────────────────────────────────────────────

def test_get_transactions_empty(client):
    # Arrange — no transactions in DB

    # Act
    response = client.get("/api/transactions/")

    # Assert
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["data"] == []


def test_get_transactions_after_checkout(client, sample_product):
    # Arrange — perform a checkout first
    client.post(
        "/api/transactions/checkout",
        json={
            "items": [{"product_id": sample_product.id, "quantity": 1}],
            "amount_paid": 50000,
        },
    )

    # Act
    response = client.get("/api/transactions/")

    # Assert
    assert response.status_code == 200
    body = response.json()
    assert len(body["data"]) == 1
    assert body["data"][0]["status"] == "completed"


def test_get_transaction_by_id(client, sample_product):
    # Arrange — create a transaction
    checkout_resp = client.post(
        "/api/transactions/checkout",
        json={
            "items": [{"product_id": sample_product.id, "quantity": 2}],
            "amount_paid": 100000,
        },
    )
    transaction_id = checkout_resp.json()["data"]["id"]

    # Act
    response = client.get(f"/api/transactions/{transaction_id}")

    # Assert
    assert response.status_code == 200
    body = response.json()
    assert body["data"]["id"] == transaction_id
    assert body["data"]["transaction_code"].startswith("TXN-")


def test_get_transaction_not_found(client):
    # Arrange
    nonexistent_id = 99999

    # Act
    response = client.get(f"/api/transactions/{nonexistent_id}")

    # Assert
    assert response.status_code == 404
    assert response.json()["success"] is False
