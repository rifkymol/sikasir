from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import delete, insert
from sqlmodel import Session, select

from ..auth import get_current_actor, require_admin_actor, AuthActor
from ..database import get_session
from ..models import OrderItem, Product, ResetLog, Transaction
from ..schemas import AdminSessionResponse, ResetDatabaseRequest


router = APIRouter(prefix="/admin", tags=["Admin"])

RESET_CONFIRMATION_TOKEN = "RESET_CONFIRMED"


@router.get("/session")
async def get_session_info(actor: AuthActor = Depends(get_current_actor)):
    data = AdminSessionResponse(username=actor.username, role=actor.role)
    return {"success": True, "message": "Sesi valid", "data": data}


@router.get("/reset-logs")
async def get_reset_logs(
    limit: int = 20,
    actor: AuthActor = Depends(require_admin_actor),
    session: Session = Depends(get_session),
):
    logs = session.exec(select(ResetLog).order_by(ResetLog.performed_at.desc()).limit(limit)).all()
    return {
        "success": True,
        "message": f"{len(logs)} log reset ditemukan.",
        "data": logs,
    }


@router.post("/reset-database")
async def reset_database(
    payload: ResetDatabaseRequest,
    actor: AuthActor = Depends(require_admin_actor),
    session: Session = Depends(get_session),
):
    if payload.confirmation != RESET_CONFIRMATION_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Konfirmasi tidak valid.",
        )

    try:
        with session.begin():
            deleted_order_items = session.exec(delete(OrderItem)).rowcount or 0
            deleted_transactions = session.exec(delete(Transaction)).rowcount or 0
            deleted_products = session.exec(delete(Product)).rowcount or 0

            deleted_counts = {
                "transaction_items": deleted_order_items,
                "transactions": deleted_transactions,
                "products": deleted_products,
            }

            session.exec(
                insert(ResetLog).values(
                    performed_by=actor.username,
                    performed_role=actor.role,
                    performed_at=datetime.utcnow(),
                    deleted_counts=deleted_counts,
                )
            )

        return {
            "success": True,
            "message": "Database berhasil direset.",
            "data": {"deleted": deleted_counts},
        }
    except HTTPException:
        raise
    except Exception as exc:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Reset gagal: {str(exc)}",
        )
