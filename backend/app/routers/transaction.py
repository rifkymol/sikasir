import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.database import get_session
from app.models import Transaction, OrderItem, Product
from app.schemas import CheckoutRequest, TransactionResponse, OrderItemResponse

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.post("/checkout", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def checkout(checkout_data: CheckoutRequest, session: Session = Depends(get_session)):
    if not checkout_data.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart cannot be empty"
        )
    
    # validate all item first
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

    # validate payment
    if checkout_data.amount_paid < total_amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Amount paid is less than total amount ({total_amount})"
        )
    change_amount = round(checkout_data.amount_paid - total_amount, 2)

    # create transaction
    tx_code = f"TXN-{datetime.now().strftime('%Y%m%d%H%M%S')}-{str(uuid.uuid4().hex[:4].upper())}"

    transaction = Transaction(
        transaction_code=tx_code,
        total_amount=total_amount,
        amount_paid=checkout_data.amount_paid,
        change_amount=change_amount,
        payment_method=checkout_data.payment_method,
        status="completed",
        notes=checkout_data.notes
    )
    session.add(transaction)
    session.flush()
    
    # create order items
    order_items = []
    for item in checkout_data.items:
        product = products_map[item.product_id]
        subtotal = round(product.price * item.quantity, 2)

        order_item = OrderItem(
            transaction_id=transaction.id,
            product_id=product.id,
            quantity=item.quantity,
            unit_price=product.price,
            subtotal=subtotal
        )
        session.add(order_item)

        order_items.append(order_item)
        product.stock -= item.quantity
        session.add(product)

    session.commit()
    session.refresh(transaction)

    return transaction

