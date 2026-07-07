from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from app.database import SessionLocal
from app.models.log import AuditLog
from jose import jwt
from app.core.config import settings

class AuditLogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Only log mutating actions
        if request.method in ["POST", "PUT", "PATCH", "DELETE"]:
            # Try to get user_id from token if available
            user_id = None
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
                try:
                    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
                    user_id = payload.get("sub")
                except:
                    pass
            
            # Simple heuristic for entity based on path
            path_parts = request.url.path.strip("/").split("/")
            entity = path_parts[-1] if path_parts else "unknown"
            if len(path_parts) > 1 and path_parts[-1].isalnum() and len(path_parts[-1]) > 10:
                # likely an ID, use the previous part
                entity = path_parts[-2]
            
            entity_id = None
            if len(path_parts) > 0 and path_parts[-1].isalnum() and len(path_parts[-1]) > 10:
                entity_id = path_parts[-1]

            ip_address = request.client.host if request.client else None
            
            db = SessionLocal()
            try:
                audit_log = AuditLog(
                    user_id=user_id,
                    action=request.method,
                    entity=entity,
                    entity_id=entity_id,
                    ip_address=ip_address
                )
                db.add(audit_log)
                db.commit()
            except Exception as e:
                db.rollback()
                print(f"Failed to write audit log: {e}")
            finally:
                db.close()
                
        return response
