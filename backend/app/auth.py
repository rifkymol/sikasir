import os
from typing import Literal

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel


security = HTTPBearer(auto_error=False)


class AuthActor(BaseModel):
    username: str
    role: Literal["admin", "cashier"]

    @property
    def is_admin(self) -> bool:
        return self.role == "admin"


def _build_token_registry() -> dict[str, AuthActor]:
    admin_token = os.getenv("SIKASIR_ADMIN_TOKEN", "sikasir-admin-123")
    cashier_token = os.getenv("SIKASIR_CASHIER_TOKEN", "sikasir-cashier-123")

    return {
        admin_token: AuthActor(username="admin", role="admin"),
        cashier_token: AuthActor(username="kasir", role="cashier"),
    }


def get_current_actor(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> AuthActor:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token autentikasi diperlukan.",
        )

    if credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Skema autentikasi tidak valid.",
        )

    actor = _build_token_registry().get(credentials.credentials)
    if not actor:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token tidak valid.",
        )

    return actor


def require_admin_actor(actor: AuthActor = Depends(get_current_actor)) -> AuthActor:
    if not actor.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akses ditolak. Hanya admin yang bisa melakukan reset.",
        )
    return actor


