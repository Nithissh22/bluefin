from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.core.auth import get_current_client
from app.models.user import User
from app.models.product import Product
from app.models.order import Order, OrderItem
from app.schemas.product import ProductOut
from app.schemas.order import OrderCreate, OrderOut
from app.services.notification_service import send_notification
from app.models.enums import OrderStatus

router = APIRouter()

@router.get("/products", response_model=List[ProductOut])
def get_active_products(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    return db.query(Product).filter(Product.is_active == True).offset(skip).limit(limit).all()

@router.post("/orders", response_model=OrderOut)
def place_order(order_in: OrderCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_client)):
    db_order = Order(
        client_id=current_user.id,
        status=OrderStatus.PENDING
    )
    db.add(db_order)
    db.flush()
    
    for item_in in order_in.items:
        product = db.query(Product).filter(Product.id == item_in.product_id).first()
        if not product or not product.is_active or product.stock < item_in.quantity:
            db.rollback()
            raise HTTPException(status_code=400, detail=f"Product {item_in.product_id} not available in requested quantity")
        
        db_item = OrderItem(
            order_id=db_order.id,
            product_id=product.id,
            quantity=item_in.quantity,
            price_at_order=product.price
        )
        db.add(db_item)
        product.stock -= item_in.quantity
        
    db.commit()
    db.refresh(db_order)
    
    send_notification(db, current_user.id, f"Order {db_order.id} placed successfully!")
    
    return db_order

@router.get("/orders", response_model=List[OrderOut])
def get_my_orders(db: Session = Depends(get_db), current_user: User = Depends(get_current_client)):
    return db.query(Order).filter(Order.client_id == current_user.id).all()

from app.schemas.user import UserOut, UserUpdate
from app.core.security import get_password_hash

@router.get("/profile", response_model=UserOut)
def get_profile(current_user: User = Depends(get_current_client)):
    return current_user

@router.put("/profile", response_model=UserOut)
def update_profile(profile_in: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_client)):
    if profile_in.name:
        current_user.name = profile_in.name
    if profile_in.phone:
        current_user.phone = profile_in.phone
    if profile_in.password:
        current_user.password_hash = get_password_hash(profile_in.password)
    db.commit()
    db.refresh(current_user)
    return current_user
