"""
Shared pytest fixtures for the Sikasir FastAPI backend test suite.

All tests use an isolated in-memory SQLite database so the real
`sikasir.db` file is never touched.
"""

import pytest
from sqlalchemy.pool import StaticPool
from sqlmodel import SQLModel, Session, create_engine
from starlette.testclient import TestClient

from app.main import app
from app.database import get_session
from app.models import Product


# ─────────────────────────────────────────────────────────────
#  Database / Session fixtures
# ─────────────────────────────────────────────────────────────

@pytest.fixture(scope="function")
def engine():
    """
    Create a fresh in-memory SQLite engine for every test function.

    StaticPool is required so that every connection within the same engine
    reuses the exact same SQLite in-memory connection — otherwise each new
    Session would see an empty database with no tables.
    """
    test_engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(test_engine)
    yield test_engine
    SQLModel.metadata.drop_all(test_engine)
    test_engine.dispose()


@pytest.fixture(scope="function")
def session(engine):
    """Provide a SQLModel Session for fixture-level DB setup in tests."""
    s = Session(engine)
    yield s
    s.close()


# ─────────────────────────────────────────────────────────────
#  HTTP client fixture
# ─────────────────────────────────────────────────────────────

@pytest.fixture(scope="function")
def client(engine):
    """
    FastAPI TestClient where every HTTP request receives its own fresh
    Session from the in-memory engine.  This prevents 'transaction already
    begun' conflicts that arise when the fixture session and the request
    handler share the same Session object.
    """
    def _override_get_session():
        with Session(engine) as req_session:
            yield req_session

    app.dependency_overrides[get_session] = _override_get_session
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c
    app.dependency_overrides.clear()


# ─────────────────────────────────────────────────────────────
#  Auth header fixtures
# ─────────────────────────────────────────────────────────────

@pytest.fixture
def admin_headers():
    """Authorization headers using the default admin token."""
    return {"Authorization": "Bearer sikasir-admin-123"}


@pytest.fixture
def cashier_headers():
    """Authorization headers using the default cashier token."""
    return {"Authorization": "Bearer sikasir-cashier-123"}


# ─────────────────────────────────────────────────────────────
#  Shared data fixtures
# ─────────────────────────────────────────────────────────────

@pytest.fixture
def sample_product(session) -> Product:
    """Insert and return a single active product into the test DB."""
    product = Product.model_validate({
        "name": "Test Kopi",
        "sku": "SKU-TEST-001",
        "price": 15000.0,
        "stock": 50,
        "category": "Minuman",
        "description": "Kopi untuk testing",
        "is_active": True,
    })
    session.add(product)
    session.commit()
    session.refresh(product)
    return product
