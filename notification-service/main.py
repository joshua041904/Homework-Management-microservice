# main.py (notification-service)
from fastapi import FastAPI, HTTPException, Depends
from sqlmodel import Session
from db import (
    init_db,
    get_session,
    db_create_notification,
    db_get_notification_by_homework_id,
    db_delete_notification_by_homework_id,
    Notifications,
)

from models import (
    HealthResponse,
    HealthStatus,
    NotificationCreate,
    NotificationByHomeworkUpdate,
    NotificationResponse,
)

app = FastAPI(title="Notification Service")

@app.on_event("startup")
def on_startup():
    init_db()

# ---------- Health endpoint ----------
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        service="notification-service",
        status=HealthStatus.healthy,
        dependencies={} # No downstream dependencies for notification-service
    )

# ---------- CRUD endpoints ----------

# POST /notifications
@app.post("/", response_model=NotificationResponse, status_code=201)
async def create_notification(notification: NotificationCreate, session: Session = Depends(get_session)):
    """Create a new notification"""
    notification_row = db_create_notification(
        session=session,
        user_id = notification.user_id,
        homework_id = notification.homework_id,
        message = notification.message,
        due_date = notification.due_date,
    )
    return notification_row

# PUT /notifications/by-homework/{homework_id}
@app.put("/by-homework/{homework_id}", response_model=NotificationResponse)
async def update_notification_by_homework(
    homework_id: int,
    update: NotificationByHomeworkUpdate,
    session: Session = Depends(get_session),
):
    notification = db_get_notification_by_homework_id(session, homework_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    notification.message = update.message
    notification.due_date = update.due_date
    session.add(notification)
    session.commit()
    session.refresh(notification)
    return notification

# DELETE /notifications/by-homework/{homework_id}
@app.delete("/by-homework/{homework_id}")
async def delete_notification_by_homework(
    homework_id: int,
    session: Session = Depends(get_session),
):
    deleted = db_delete_notification_by_homework_id(session, homework_id)
    if not deleted:
        return {"message": "No notification to delete"}
    return {"message": "Notification deleted"}

# GET /notifications/{notifications_id}
@app.get("/{notification_id}", response_model=NotificationResponse)
async def get_notification(notification_id: int, session: Session = Depends(get_session)):
    # Look up notification in Postgres database
    notification = session.get(Notifications, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification

# DELETE /notifications/{notification_id}
@app.delete("/{notification_id}")
async def delete_notification(notification_id: int, session: Session = Depends(get_session)):
    notification = session.get(Notifications, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    session.delete(notification)
    session.commit()
    return {"message": "Notification Deleted"}