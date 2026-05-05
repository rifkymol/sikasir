"""
Tests for product CRUD, toggle, and delete endpoints.

Endpoints covered:
  GET    /api/products/
  GET    /api/products/{id}
  POST   /api/products/
  PUT    /api/products/{id}
  PATCH  /api/products/{id}/toggle
  DELETE /api/products/{id}
"""


# ─────────────────────────────────────────────────────────────
#  Create product
# ─────────────────────────────────────────────────────────────

def test_create_product_success(client, admin_headers):
    # Arrange
    payload = {
        "name": "Teh Manis",
        "sku": "TEH-001",
        "price": 8000,
        "stock": 100,
        "category": "Minuman",
    }

    # Act
    response = client.post("/api/products/", json=payload, headers=admin_headers)

    # Assert
    assert response.status_code == 201
    body = response.json()
    assert body["success"] is True
    assert body["data"]["sku"] == "TEH-001"
    assert body["data"]["price"] == 8000.0
    assert body["data"]["is_active"] is True


def test_create_product_no_auth_still_works(client):
    # Arrange — product CRUD does not require authentication
    payload = {"name": "Produk Publik", "sku": "PUB-001", "price": 5000, "stock": 10}

    # Act
    response = client.post("/api/products/", json=payload)

    # Assert
    assert response.status_code == 201
    assert response.json()["success"] is True


def test_create_product_duplicate_sku(client, admin_headers, sample_product):
    # Arrange
    payload = {
        "name": "Kopi Duplikat",
        "sku": sample_product.sku,  # already exists
        "price": 12000,
        "stock": 5,
    }

    # Act
    response = client.post("/api/products/", json=payload, headers=admin_headers)

    # Assert
    assert response.status_code in (400, 409, 422)
    body = response.json()
    assert body["success"] is False


def test_create_product_invalid_price(client, admin_headers):
    # Arrange
    payload = {"name": "Invalid", "sku": "INV-001", "price": -100, "stock": 5}

    # Act
    response = client.post("/api/products/", json=payload, headers=admin_headers)

    # Assert
    assert response.status_code == 422


def test_create_product_negative_stock(client, admin_headers):
    # Arrange
    payload = {"name": "Invalid", "sku": "INV-002", "price": 5000, "stock": -1}

    # Act
    response = client.post("/api/products/", json=payload, headers=admin_headers)

    # Assert
    assert response.status_code == 422


# ─────────────────────────────────────────────────────────────
#  Get products
# ─────────────────────────────────────────────────────────────

def test_get_products_empty(client, admin_headers):
    # Arrange — no products seeded

    # Act
    response = client.get("/api/products/", headers=admin_headers)

    # Assert
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert isinstance(body["data"], list)
    assert len(body["data"]) == 0


def test_get_products_with_data(client, admin_headers, sample_product):
    # Arrange — sample_product is already in DB

    # Act
    response = client.get("/api/products/", headers=admin_headers)

    # Assert
    assert response.status_code == 200
    body = response.json()
    assert len(body["data"]) == 1
    assert body["data"][0]["sku"] == sample_product.sku


def test_get_product_by_id(client, admin_headers, sample_product):
    # Arrange
    product_id = sample_product.id

    # Act
    response = client.get(f"/api/products/{product_id}", headers=admin_headers)

    # Assert
    assert response.status_code == 200
    body = response.json()
    assert body["data"]["id"] == product_id
    assert body["data"]["name"] == sample_product.name


def test_get_product_not_found(client, admin_headers):
    # Arrange
    nonexistent_id = 99999

    # Act
    response = client.get(f"/api/products/{nonexistent_id}", headers=admin_headers)

    # Assert
    assert response.status_code == 404
    assert response.json()["success"] is False


# ─────────────────────────────────────────────────────────────
#  Update product
# ─────────────────────────────────────────────────────────────

def test_update_product_success(client, admin_headers, sample_product):
    # Arrange
    update_payload = {"name": "Kopi Susu Updated", "price": 20000}

    # Act
    response = client.put(
        f"/api/products/{sample_product.id}",
        json=update_payload,
        headers=admin_headers,
    )

    # Assert
    assert response.status_code == 200
    body = response.json()
    assert body["data"]["name"] == "Kopi Susu Updated"
    assert body["data"]["price"] == 20000.0


def test_update_product_not_found(client, admin_headers):
    # Arrange
    update_payload = {"name": "Ghost Product"}

    # Act
    response = client.put("/api/products/99999", json=update_payload, headers=admin_headers)

    # Assert
    assert response.status_code == 404


# ─────────────────────────────────────────────────────────────
#  Toggle product status
# ─────────────────────────────────────────────────────────────

def test_toggle_product_deactivates(client, admin_headers, sample_product):
    # Arrange — product starts as is_active=True

    # Act
    response = client.patch(
        f"/api/products/{sample_product.id}/toggle",
        headers=admin_headers,
    )

    # Assert
    assert response.status_code == 200
    body = response.json()
    assert body["data"]["is_active"] is False


def test_toggle_product_reactivates(client, admin_headers, sample_product, session):
    # Arrange — deactivate first
    sample_product.is_active = False
    session.add(sample_product)
    session.commit()

    # Act
    response = client.patch(
        f"/api/products/{sample_product.id}/toggle",
        headers=admin_headers,
    )

    # Assert
    assert response.status_code == 200
    assert response.json()["data"]["is_active"] is True


# ─────────────────────────────────────────────────────────────
#  Delete product
# ─────────────────────────────────────────────────────────────

def test_delete_product_success(client, admin_headers, sample_product):
    # Arrange
    product_id = sample_product.id

    # Act
    response = client.delete(f"/api/products/{product_id}", headers=admin_headers)

    # Assert
    assert response.status_code == 200
    assert response.json()["success"] is True

    # Verify it's gone
    get_response = client.get(f"/api/products/{product_id}", headers=admin_headers)
    assert get_response.status_code == 404


def test_delete_product_not_found(client, admin_headers):
    # Arrange
    nonexistent_id = 99999

    # Act
    response = client.delete(f"/api/products/{nonexistent_id}", headers=admin_headers)

    # Assert
    assert response.status_code == 404
