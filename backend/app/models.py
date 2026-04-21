from typing import Optional, List
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship

class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, min_length=1, max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)
    price: float = Field(gt=0)
    stock: int = Field(default=0, ge=0)
    sku: str = Field(unique=True, index=True)
    category: Optional[str] = Field(default="General", max_length=50)
    image_url: Optional[str] = Field(default=None)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.now())
    updated_at: datetime = Field(default_factory=datetime.now())

    order_items: List["OrderItem"] = Relationship(back_populates="product")

class Transaction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    transaction_code: str = Field(unique=True, index=True, max_length=20)
    total_amount: float = Field(ge=0)
    amount_paid: float = Field(ge=0)
    change_amount: float = Field(ge=0)
    payment_method: str = Field(default="cash", max_length=20)
    status: str = Field(default="completed", max_length=20)
    timestamp: datetime = Field(default_factory=datetime.now())
    notes: Optional[str] = Field(default=None, max_length=500)

    order_items: List["OrderItem"] = Relationship(back_populates="transaction")

class OrderItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    quantity: int = Field(ge=0)
    unit_price: float = Field(ge=0)
    subtotal: float = Field(ge=0)

    product_id: Optional[int] = Field(default=None, foreign_key="product.id")
    transaction_id: Optional[int] = Field(default=None, foreign_key="transaction.id")

    product: Optional[Product] = Relationship(back_populates="order_items")
    transaction: Optional[Transaction] = Relationship(back_populates="order_items")
