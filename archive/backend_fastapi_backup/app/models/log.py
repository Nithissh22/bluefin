from sqlalchemy import Column, String, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
from app.database import Base
from app.models.enums import OrderStatus, NotificationType, NotificationStatus

def generate_uuid():
    return str(uuid.uuid4())

class OrderStatusLog(Base):
    __tablename__ = "order_status_log"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    order_id = Column(String, ForeignKey("orders.id"), nullable=False)
    status = Column(Enum(OrderStatus), nullable=False)
    changed_by = Column(String, ForeignKey("users.id"), nullable=False)
    changed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    order = relationship("Order", back_populates="status_logs")
    changer = relationship("User")

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    type = Column(Enum(NotificationType), nullable=False)
    event = Column(String, nullable=False)
    status = Column(Enum(NotificationStatus), nullable=False)
    sent_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    user = relationship("User")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True) # Might be None for unauthenticated actions
    action = Column(String, nullable=False) # e.g. "CREATE", "UPDATE", "DELETE"
    entity = Column(String, nullable=False) # e.g. "users", "orders"
    entity_id = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
