import uuid
from datetime import date, datetime, time
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select

from ..database import get_session
from ..models import Transaction, OrderItem, Product
from ..schemas import CheckoutRequest, TransactionResponse

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.post("/checkout", status_code=status.HTTP_201_CREATED)
async def checkout(checkout_data: CheckoutRequest, session: Session = Depends(get_session)):
    try:
        if not checkout_data.items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cart cannot be empty"
            )

        products_map = {}
        total_amount = 0.0

        for item in checkout_data.items:
            product = session.get(Product, item.product_id)
            if not product or not product.is_active:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product with ID {item.product_id} not found"
                )
            if item.quantity > product.stock:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock for product '{product.name}'"
                )
            products_map[item.product_id] = product
            total_amount += item.quantity * product.price

        total_amount = round(total_amount, 2)

        if checkout_data.amount_paid < total_amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Amount paid is less than total amount ({total_amount})"
            )
        change_amount = round(checkout_data.amount_paid - total_amount, 2)

        tx_code = f"TXN-{datetime.now().strftime('%Y%m%d%H%M%S')}-{str(uuid.uuid4().hex[:4].upper())}"

        transaction = Transaction.model_validate({
            "transaction_code": tx_code,
            "total_amount": total_amount,
            "amount_paid": checkout_data.amount_paid,
            "change_amount": change_amount,
            "payment_method": checkout_data.payment_method,
            "status": "completed",
            "notes": checkout_data.notes,
        })
        session.add(transaction)
        session.flush()

        for item in checkout_data.items:
            product = products_map[item.product_id]
            subtotal = round(product.price * item.quantity, 2)

            order_item = OrderItem.model_validate({
                "transaction_id": transaction.id,
                "product_id": product.id,
                "quantity": item.quantity,
                "unit_price": product.price,
                "subtotal": subtotal,
            })
            session.add(order_item)

            product.stock -= item.quantity
            if product.stock < 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Stock for '{product.name}' cannot go below zero"
                )
            session.add(product)

        session.commit()
        session.refresh(transaction)
        for item in transaction.order_items:
            session.refresh(item)
            if item.product:
                session.refresh(item.product)

        return {"success": True, "message": "Checkout completed successfully", "data": transaction}
    except Exception:
        session.rollback()
        raise

@router.get("/")
async def get_transactions(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=10, ge=1, le=1000),
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    session: Session = Depends(get_session)
):
    query = select(Transaction)

    if start_date:
        query = query.where(Transaction.created_at >= datetime.combine(start_date, time.min))
    if end_date:
        query = query.where(Transaction.created_at <= datetime.combine(end_date, time.max))

    transactions = session.exec(
        query.order_by(Transaction.created_at.desc())
        .offset(skip)
        .limit(limit)
    ).all()
    return {"success": True, "message": "Transactions fetched successfully", "data": transactions}

@router.get("/{transaction_id}")
async def get_transaction(transaction_id: int, session: Session = Depends(get_session)):
    transactions = session.get(Transaction, transaction_id)
    if not transactions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    return {"success": True, "message": "Transaction fetched successfully", "data": transactions}
