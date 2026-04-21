from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, field_validator


# ─────────────────────────────────────────────────────────────
#  PRODUCT SCHEMAS
# ─────────────────────────────────────────────────────────────
class ProductCreate(BaseModel):
  name: str
  despcription: Optional[str] = None
  price: float
  stock: int
  sku: str
  category: Optional[str] = "General"
  image_url: Optional[str] = None

  @field_validator("price")
  @classmethod
  def price_must_be_positive(cls, v):
    if v <= 0:
      raise ValueError("Price must be greater than 0")
    return round(v, 2)
  
class ProductUpdate(BaseModel):
  name: Optional[str] = None
  description: Optional[str] = None
  price: Optional[float] = None
  stock: Optional[int] = None
  category: Optional[str] = None
  image_url: Optional[str] = None
  is_active: Optional[bool] = None

class ProductResponse(BaseModel):
  id: int
  name: str
  description: Optional[str] = None
  price: float
  stock: int
  sku: str
  category: Optional[str] = "General"
  image_url: Optional[str] = None
  is_active: bool
  created_at: datetime
  updated_at: datetime

  class Config:
    from_attributes = True


# ─────────────────────────────────────────────────────────────
#  CART / CHECKOUT SCHEMAS
# ─────────────────────────────────────────────────────────────
class CartItemRequest(BaseModel):
  product_id: int
  quantity: int

  @field_validator("quantity")
  @classmethod
  def quantity_must_be_positive(cls, v):
    if v <= 0:
      raise ValueError("Quantity must be greater than 0")
    return v
  
class CheckoutRequest(BaseModel):
  items: List[CartItemRequest]
  amount_paid: float
  payment_method: str = "cash"
  notes: Optional[str] = None


# ─────────────────────────────────────────────────────────────
#  TRANSACTION SCHEMAS
# ─────────────────────────────────────────────────────────────

class OrderItemResponse(BaseModel):
  product_id: int
  quantity: int
  unit_price: float
  subtotal: float
  product: Optional[ProductResponse] = None

  class Config:
    from_attributes = True

class TransactionResponse(BaseModel):
  id: int
  transaction_code: str
  total_amount: float
  amount_paid: float
  change_amount: float
  payment_method: str
  status: str
  created_at: datetime
  order_items: List[OrderItemResponse]

  class Config:
    from_attributes = True