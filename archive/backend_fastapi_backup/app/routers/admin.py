from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.core.auth import get_current_admin
from app.models.user import User
from app.models.product import Product
from app.models.order import Order
from app.schemas.user import UserOut, UserCreate
from app.schemas.product import ProductOut, ProductCreate
from app.schemas.order import OrderOut, OrderAssign, OrderStatusUpdate
from app.core.security import get_password_hash
from app.services.order_service import update_order_status

router = APIRouter()

@router.get("/users", response_model=List[UserOut])
def get_users(db: Session = Depends(get_db), skip: int = 0, limit: int = 100, current_user: User = Depends(get_current_admin)):
    return db.query(User).offset(skip).limit(limit).all()

@router.post("/users", response_model=UserOut)
def create_user(user_in: UserCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    db_user = User(
        email=user_in.email,
        name=user_in.name,
        phone=user_in.phone,
        password_hash=get_password_hash(user_in.password),
        role=user_in.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/products", response_model=List[ProductOut])
def get_products(db: Session = Depends(get_db), skip: int = 0, limit: int = 100, current_user: User = Depends(get_current_admin)):
    return db.query(Product).offset(skip).limit(limit).all()

@router.post("/products", response_model=ProductOut)
def create_product(product_in: ProductCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    db_product = Product(**product_in.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.get("/orders", response_model=List[OrderOut])
def get_orders(db: Session = Depends(get_db), skip: int = 0, limit: int = 100, current_user: User = Depends(get_current_admin)):
    return db.query(Order).offset(skip).limit(limit).all()

@router.post("/orders/{order_id}/assign")
def assign_order(order_id: str, assign_in: OrderAssign, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    staff = db.query(User).filter(User.id == assign_in.staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    
    order.assigned_staff_id = assign_in.staff_id
    db.commit()
    db.refresh(order)
    return {"status": "success", "order_id": order.id, "assigned_staff_id": staff.id}

@router.post("/orders/{order_id}/status", response_model=OrderOut)
def override_order_status(order_id: str, status_in: OrderStatusUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return update_order_status(db, order, status_in.status, current_user)
