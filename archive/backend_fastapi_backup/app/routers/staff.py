from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.core.auth import get_current_staff
from app.models.user import User
from app.models.order import Order
from app.models.product import Product
from app.schemas.order import OrderOut, OrderStatusUpdate
from app.schemas.product import ProductOut
from app.services.order_service import update_order_status

router = APIRouter()

@router.get("/orders", response_model=List[OrderOut])
def get_assigned_orders(db: Session = Depends(get_db), current_user: User = Depends(get_current_staff)):
    return db.query(Order).filter(Order.assigned_staff_id == current_user.id).all()

@router.post("/orders/{order_id}/status", response_model=OrderOut)
def update_status(order_id: str, status_in: OrderStatusUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_staff)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return update_order_status(db, order, status_in.status, current_user)

@router.get("/products", response_model=List[ProductOut])
def get_products_readonly(db: Session = Depends(get_db), skip: int = 0, limit: int = 100, current_user: User = Depends(get_current_staff)):
    return db.query(Product).filter(Product.is_active == True).offset(skip).limit(limit).all()
