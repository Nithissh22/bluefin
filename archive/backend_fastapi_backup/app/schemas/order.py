from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from app.models.enums import OrderStatus
from app.schemas.product import ProductOut
from app.schemas.user import UserOut

class OrderItemBase(BaseModel):
    product_id: str
    quantity: int

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemOut(OrderItemBase):
    id: str
    price_at_order: float
    product: ProductOut
    
    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    pass

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]

class OrderStatusUpdate(BaseModel):
    status: OrderStatus

class OrderAssign(BaseModel):
    staff_id: str

class OrderStatusLogOut(BaseModel):
    id: str
    status: OrderStatus
    changed_at: datetime
    changer: UserOut
    
    class Config:
        from_attributes = True

class OrderOut(OrderBase):
    id: str
    client_id: str
    status: OrderStatus
    assigned_staff_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    items: List[OrderItemOut]
    status_logs: List[OrderStatusLogOut]
    
    class Config:
        from_attributes = True
