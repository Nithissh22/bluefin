import enum

class UserRole(str, enum.Enum):
    CLIENT = "client"
    STAFF = "staff"
    ADMIN = "admin"

class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    PACKING = "packing"
    READY_TO_SHIP = "ready_to_ship"
    SHIPPED = "shipped"
    DELIVERED = "delivered"

class NotificationType(str, enum.Enum):
    EMAIL = "email"
    WHATSAPP = "whatsapp"

class NotificationStatus(str, enum.Enum):
    SENT = "sent"
    FAILED = "failed"
