from sqlalchemy.orm import Session
from app.models.enums import NotificationType, NotificationStatus
from app.models.log import Notification

def send_notification(db: Session, user_id: str, event: str):
    # Stub: Just log to console and save to DB
    print(f"[NOTIFICATION - EMAIL/WHATSAPP] To User {user_id}: {event}")
    
    notif = Notification(
        user_id=user_id,
        type=NotificationType.EMAIL, # default to email for now
        event=event,
        status=NotificationStatus.SENT
    )
    db.add(notif)
    db.commit()
