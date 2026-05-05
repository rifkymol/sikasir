"""
Tests for the product import and template download endpoints.

Endpoints covered:
  GET  /api/products/import/template
  POST /api/products/import
"""

import csv
import io


# ─────────────────────────────────────────────────────────────
#  Helpers — build in-memory file objects
# ─────────────────────────────────────────────────────────────

def _make_csv(rows: list[dict]) -> bytes:
    """Build a UTF-8 CSV with the expected import header columns."""
    output = io.StringIO()
    fieldnames = ["SKU", "Nama Produk", "Harga", "Stok", "Kategori", "Deskripsi"]
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    for row in rows:
        writer.writerow(row)
    return output.getvalue().encode("utf-8")


# ─────────────────────────────────────────────────────────────
#  Template download
# ─────────────────────────────────────────────────────────────

def test_download_template_as_admin(client, admin_headers):
    # Arrange — admin token available

    # Act
    response = client.get("/api/products/import/template", headers=admin_headers)

    # Assert
    assert response.status_code == 200
    content_type = response.headers.get("content-type", "")
    assert "spreadsheetml" in content_type or "openxmlformats" in content_type
    assert len(response.content) > 0


def test_download_template_cashier_forbidden(client, cashier_headers):
    # Arrange — cashier should not download template

    # Act
    response = client.get("/api/products/import/template", headers=cashier_headers)

    # Assert
    assert response.status_code == 403


def test_download_template_no_auth(client):
    # Arrange — no token

    # Act
    response = client.get("/api/products/import/template")

    # Assert
    assert response.status_code == 401


# ─────────────────────────────────────────────────────────────
#  Import — preview mode
# ─────────────────────────────────────────────────────────────

def test_import_preview_all_valid(client, admin_headers):
    # Arrange
    csv_bytes = _make_csv([
        {"SKU": "PRD-A01", "Nama Produk": "Kopi Hitam", "Harga": 10000, "Stok": 20, "Kategori": "Minuman", "Deskripsi": ""},
        {"SKU": "PRD-A02", "Nama Produk": "Teh Manis", "Harga": 8000, "Stok": 30, "Kategori": "Minuman", "Deskripsi": ""},
    ])

    # Act
    response = client.post(
        "/api/products/import",
        data={"mode": "preview"},
        files={"file": ("products.csv", csv_bytes, "text/csv")},
        headers=admin_headers,
    )

    # Assert
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["preview"] is True
    assert body["valid_rows"] == 2
    assert body["error_rows"] == []


def test_import_preview_with_error_rows(client, admin_headers):
    # Arrange — row 2 has empty SKU, row 3 has invalid price
    csv_bytes = _make_csv([
        {"SKU": "", "Nama Produk": "No SKU Product", "Harga": 5000, "Stok": 10, "Kategori": "", "Deskripsi": ""},
        {"SKU": "PRD-B01", "Nama Produk": "Bad Price", "Harga": "tidak_valid", "Stok": 10, "Kategori": "", "Deskripsi": ""},
    ])

    # Act
    response = client.post(
        "/api/products/import",
        data={"mode": "preview"},
        files={"file": ("products.csv", csv_bytes, "text/csv")},
        headers=admin_headers,
    )

    # Assert
    assert response.status_code == 200
    body = response.json()
    assert body["preview"] is True
    assert body["valid_rows"] == 0
    assert len(body["error_rows"]) == 2


def test_import_preview_duplicate_sku_in_file(client, admin_headers):
    # Arrange — same SKU appears twice in the upload file
    csv_bytes = _make_csv([
        {"SKU": "DUP-001", "Nama Produk": "First", "Harga": 5000, "Stok": 10, "Kategori": "", "Deskripsi": ""},
        {"SKU": "DUP-001", "Nama Produk": "Second", "Harga": 7000, "Stok": 5, "Kategori": "", "Deskripsi": ""},
    ])

    # Act
    response = client.post(
        "/api/products/import",
        data={"mode": "preview"},
        files={"file": ("products.csv", csv_bytes, "text/csv")},
        headers=admin_headers,
    )

    # Assert
    body = response.json()
    assert body["valid_rows"] < 2  # second row should be an error


def test_import_preview_sku_exists_in_db(client, admin_headers, sample_product):
    # Arrange — sample_product.sku already in DB
    csv_bytes = _make_csv([
        {
            "SKU": sample_product.sku,
            "Nama Produk": "Duplicate From DB",
            "Harga": 9000,
            "Stok": 5,
            "Kategori": "",
            "Deskripsi": "",
        }
    ])

    # Act
    response = client.post(
        "/api/products/import",
        data={"mode": "preview"},
        files={"file": ("products.csv", csv_bytes, "text/csv")},
        headers=admin_headers,
    )

    # Assert
    body = response.json()
    assert body["valid_rows"] == 0
    assert len(body["error_rows"]) == 1


# ─────────────────────────────────────────────────────────────
#  Import — actual mode
# ─────────────────────────────────────────────────────────────

def test_import_actual_creates_products(client, admin_headers):
    # Arrange
    csv_bytes = _make_csv([
        {"SKU": "IMP-001", "Nama Produk": "Imported Produk", "Harga": 12000, "Stok": 15, "Kategori": "Makanan", "Deskripsi": ""},
    ])

    # Act
    response = client.post(
        "/api/products/import",
        files={"file": ("products.csv", csv_bytes, "text/csv")},
        headers=admin_headers,
    )

    # Assert
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["imported"] == 1

    # Verify the product is now in DB
    list_resp = client.get("/api/products/", headers=admin_headers)
    skus = [p["sku"] for p in list_resp.json()["data"]]
    assert "IMP-001" in skus


def test_import_actual_no_valid_rows(client, admin_headers):
    # Arrange — all rows are invalid (no SKU)
    csv_bytes = _make_csv([
        {"SKU": "", "Nama Produk": "No SKU", "Harga": 5000, "Stok": 10, "Kategori": "", "Deskripsi": ""},
    ])

    # Act
    response = client.post(
        "/api/products/import",
        files={"file": ("products.csv", csv_bytes, "text/csv")},
        headers=admin_headers,
    )

    # Assert
    assert response.status_code == 400
    assert response.json()["success"] is False


# ─────────────────────────────────────────────────────────────
#  Import — validation errors
# ─────────────────────────────────────────────────────────────

def test_import_invalid_file_format(client, admin_headers):
    # Arrange — .txt file should be rejected
    content = b"this is not a spreadsheet"

    # Act
    response = client.post(
        "/api/products/import",
        files={"file": ("data.txt", content, "text/plain")},
        headers=admin_headers,
    )

    # Assert
    assert response.status_code == 400
    assert response.json()["success"] is False


def test_import_missing_required_columns(client, admin_headers):
    # Arrange — CSV with wrong column names (missing "Harga", "Stok")
    bad_csv = b"Product Name,Code\nKopi,K001\n"

    # Act
    response = client.post(
        "/api/products/import",
        files={"file": ("products.csv", bad_csv, "text/csv")},
        headers=admin_headers,
    )

    # Assert
    assert response.status_code == 400
    body = response.json()
    assert body["success"] is False
    assert "kolom" in body["message"].lower() or "column" in body["message"].lower()


def test_import_requires_admin(client, cashier_headers):
    # Arrange
    csv_bytes = _make_csv([
        {"SKU": "PRD-Z01", "Nama Produk": "Kopi", "Harga": 5000, "Stok": 10, "Kategori": "", "Deskripsi": ""},
    ])

    # Act
    response = client.post(
        "/api/products/import",
        files={"file": ("products.csv", csv_bytes, "text/csv")},
        headers=cashier_headers,
    )

    # Assert
    assert response.status_code == 403


def test_import_no_auth(client):
    # Arrange
    csv_bytes = _make_csv([
        {"SKU": "PRD-Z02", "Nama Produk": "Kopi", "Harga": 5000, "Stok": 10, "Kategori": "", "Deskripsi": ""},
    ])

    # Act
    response = client.post(
        "/api/products/import",
        files={"file": ("products.csv", csv_bytes, "text/csv")},
    )

    # Assert
    assert response.status_code == 401
