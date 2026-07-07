from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.order import Order
from app.models.enums import OrderStatus, UserRole
from app.models.user import User
from app.models.log import OrderStatusLog
from app.services.notification_service import send_notification

VALID_TRANSITIONS = {
    OrderStatus.PENDING: [OrderStatus.CONFIRMED],
    OrderStatus.CONFIRMED: [OrderStatus.PROCESSING],
    OrderStatus.PROCESSING: [OrderStatus.PACKING],
    OrderStatus.PACKING: [OrderStatus.READY_TO_SHIP],
    OrderStatus.READY_TO_SHIP: [OrderStatus.SHIPPED],
    OrderStatus.SHIPPED: [OrderStatus.DELIVERED],
    OrderStatus.DELIVERED: []
}

def update_order_status(db: Session, order: Order, new_status: OrderStatus, current_user: User):
    if current_user.role != UserRole.ADMIN:
        # Check if valid forward transition
        if new_status not in VALID_TRANSITIONS.get(order.status, []):
            raise HTTPException(status_code=400, detail=f"Invalid status transition from {order.status} to {new_status}")
        
        # Staff can only update assigned orders
        if current_user.role == UserRole.STAFF and order.assigned_staff_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not assigned to this order")
            
    old_status = order.status
    order.status = new_status
    
    # Log the status change
    status_log = OrderStatusLog(
        order_id=order.id,
        status=new_status,
        changed_by=current_user.id
    )
    db.add(status_log)
    db.commit()
    db.refresh(order)
    
    # Trigger notification
    send_notification(
        db=db,
        user_id=order.client_id,
        event=f"Order status updated to {new_status}"
    )
    return order
