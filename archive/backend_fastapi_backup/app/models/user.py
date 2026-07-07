from sqlalchemy import Column, String, DateTime, Enum, Integer
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
from app.database import Base
from app.models.enums import UserRole

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.CLIENT)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    orders_as_client = relationship("Order", foreign_keys="[Order.client_id]", back_populates="client")
    orders_as_staff = relationship("Order", foreign_keys="[Order.assigned_staff_id]", back_populates="assigned_staff")
