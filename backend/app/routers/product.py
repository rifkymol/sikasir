from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, Query, status
from sqlmodel import Session, select
from ..database import get_session
from ..models import Product
from ..schemas import ProductCreate, ProductUpdate, ProductResponse

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("/")
async def get_products(
        skip: int = Query(default=0, ge=0, description="Number of records to skip"),
        limit: int = Query(default=100, le=200, description="Maximum number of records to return"),
        category: Optional[str] = Query(default=None),
        search: Optional[str] = Query(default=None, description="Search by name or SKU"),
        show_inactive: bool = Query(default=False, description="Include inactive products"),
        session: Session = Depends(get_session)
):

    query = select(Product)
    if not show_inactive:
        query = query.where(Product.is_active == True)
    if category:
        query = query.where(Product.category == category)
    if search:
        search_pattern = f"%{search}%"
        query = query.where((Product.name.ilike(search_pattern)) | (Product.sku.ilike(search_pattern)))
    products = session.exec(query.offset(skip).limit(limit)).all()
    return {"success": True, "message": "Products fetched successfully", "data": products}

@router.get("/{product_id}")
async def get_product(product_id: int, session: Session = Depends(get_session)):
    product = session.get(Product, product_id)
    if not product or not product.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return {"success": True, "message": "Product fetched successfully", "data": product}

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_product(product_data: ProductCreate, session: Session = Depends(get_session)):
    existing = session.exec(select(Product).where(Product.sku == product_data.sku)).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="SKU already exists"
        )

    # SQLModel + Pydantic v2: use model_validate for table models with default_factory fields.
    product = Product.model_validate(product_data.model_dump())
    session.add(product)
    session.commit()
    session.refresh(product)
    return {"success": True, "message": "Product created successfully", "data": product}

@router.put("/{product_id}")
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
    return {"success": True, "message": "Product updated successfully", "data": product}

@router.patch("/{product_id}/toggle")
async def toggle_product_status(product_id: int, session: Session = Depends(get_session)):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    product.is_active = not product.is_active
    product.updated_at = datetime.utcnow()
    session.add(product)
    session.commit()
    session.refresh(product)
    label = "diaktifkan" if product.is_active else "dinonaktifkan"
    return {"success": True, "message": f"Produk berhasil {label}", "data": product}

@router.delete("/{product_id}")
async def delete_product(product_id: int, session: Session = Depends(get_session)):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    session.delete(product)
    session.commit()
    return {"success": True, "message": "Produk berhasil dihapus", "data": None}