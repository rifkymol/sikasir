from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, Query, status
from sqlmodel import Session, select
from ..database import get_session
from ..models import Product
from ..schemas import ProductCreate, ProductUpdate, ProductResponse

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("/", response_model=List[ProductResponse])
async def get_products(
  skip: int = Query(default=0, ge=0, description="Number of records to skip"), 
  limit: int = Query(default=100, le=200, description="Maximum number of records to return"), 
  category: Optional[str] = Query(default=None),
  search: Optional[str] = Query(default=None, description="Search by name or SKU"),
  session: Session = Depends(get_session)
):

    query = select(Product).where(Product.is_active == True)
    if category:
        query = query.where(Product.category == category)
    if search:
        search_pattern = f"%{search}%"
        query = query.where((Product.name.ilike(search_pattern)) | (Product.sku.ilike(search_pattern)))
    products = session.exec(query.offset(skip).limit(limit)).all()
    return products

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, session: Session = Depends(get_session)):
    product = session.get(Product, product_id)
    if not product or not product.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return product

@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(product_data: ProductCreate, session: Session = Depends(get_session)):
    existing = session.exec(select(Product).where(Product.sku == product_data.sku)).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="SKU already exists"
        )

    product = Product(**product_data.model_dump())
    session.add(product)
    session.commit()
    session.refresh(product)
    return product

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(product_id: int, product_data: ProductUpdate, session: Session = Depends(get_session)):
    product = session.get(Product, product_id)
    if not product or not product.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    update_data = product_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(product, key, value)

    product.updated_at = datetime.utcnow()

    session.add(product)
    session.commit()
    session.refresh(product)
    return product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: int, session: Session = Depends(get_session)):
    product = session.get(Product, product_id)
    if not product or not product.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    product.is_active = False
    session.add(product)
    session.commit()