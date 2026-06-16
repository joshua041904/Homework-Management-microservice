# main.py (hw-service)
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.responses import JSONResponse
from sqlmodel import Session
import os
import time
import httpx

from db import Homework, db_create_assignment, get_session, init_db, db_get_homework_for_user
from models import (
    HealthResponse,
    DependencyHealth,
    HealthStatus,
    HomeworkCreate,
    HomeworkResponse,
    HomeworkUpdate,
)

app = FastAPI(title="HW Service")

@app.on_event("startup")
def on_startup():
    init_db()

# Health dependencies (other microservices)
DEPENDENCIES = {
    "user-service": os.getenv("USER_HEALTH_URL", "http://user-service:8000/health"),
    "notification-service": os.getenv("NOTIF_HEALTH_URL", "http://notification-service:8000/health"),
}

# Base URLs for other services
USER_SERVICE_URL = "http://user-service:8000"
NOTIFICATION_SERVICE_URL = "http://notification-service:8000"


# ---------- Helper: check user-service ----------
async def verify_user_exists(user_id: int):
    """Call user-service to ensure the user exists before creating homework."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{USER_SERVICE_URL}/{user_id}")
    except httpx.RequestError as e:
        # Network/DNS/timeout issues
        raise HTTPException(
            status_code=500, detail=f"Could not reach User Service: {e}"
        )

    # user-service returns 200 if found, 404 if not
    if response.status_code == 404:
        raise HTTPException(status_code=404, detail="User not found")
    elif response.status_code != 200:
        raise HTTPException(
            status_code=500, detail="Error checking user existence"
        )

    return response.json()


# ---------- Helper: call notification-service ----------
async def create_notification(hw: Homework):
    """Make a POST to notification-service so it can create the notification."""
    # Build the JSON payload expected by notification-service
    payload = {
        "user_id": hw.user_id,
        "homework_id": hw.id,
        "message": f"Reminder: {hw.assignment_name} is due on {hw.due_date.isoformat()}",
        "due_date": hw.due_date.isoformat(),
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(NOTIFICATION_SERVICE_URL, json=payload)
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Could not reach Notification Service: {e}",
        )

    if response.status_code != 201:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create notification (status {response.status_code})",
        )

    return response.json()


async def update_notification_for_homework(hw: Homework):
    """Update the notification linked to this homework assignment."""
    payload = {
        "message": f"Reminder: {hw.assignment_name} is due on {hw.due_date.isoformat()}",
        "due_date": hw.due_date.isoformat(),
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.put(
                f"{NOTIFICATION_SERVICE_URL}/by-homework/{hw.id}",
                json=payload,
            )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Could not reach Notification Service: {e}",
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update notification (status {response.status_code})",
        )

    return response.json()


def delete_attachment_file(hw: Homework):
    """Remove stored attachment from disk. Stub for Task 4 file uploads."""
    pass


async def delete_notification_for_homework(homework_id: int):
    """Delete the notification linked to this homework assignment."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.delete(
                f"{NOTIFICATION_SERVICE_URL}/by-homework/{homework_id}",
            )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Could not reach Notification Service: {e}",
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete notification (status {response.status_code})",
        )


# ---------- Health endpoint ----------
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint that also probes other services."""
    # Dictionary of dependent services and their health status
    deps: dict[str, DependencyHealth] = {}

    # --- Check health of each dependent microservice ---
    async with httpx.AsyncClient(timeout=2.0) as client:
        for name, url in DEPENDENCIES.items():
            start = time.perf_counter()
            try:
                resp = await client.get(url)
                elapsed_ms = int((time.perf_counter() - start) * 1000)
                status = (
                    HealthStatus.healthy
                    if resp.status_code == 200
                    else HealthStatus.unhealthy
                )
                deps[name] = DependencyHealth(
                    status=status, response_time_ms=elapsed_ms
                )
            except Exception:
                # Couldn't reach dependency; mark unhealthy and omit timing
                deps[name] = DependencyHealth(
                    status=HealthStatus.unhealthy, response_time_ms=None
                )

    # --- Determine overall health status ---
    overall_status = (
        HealthStatus.healthy
        if all(d.status == HealthStatus.healthy for d in deps.values())
        else HealthStatus.unhealthy
    )

    body = HealthResponse(
        service="hw-service", status=overall_status, dependencies=deps
    )

    return JSONResponse(
        status_code=200 if overall_status == HealthStatus.healthy else 503,
        content=body.model_dump(),
    )


# ---------- CRUD endpoints ----------

# POST /homework
@app.post("/", response_model=HomeworkResponse, status_code=201)
async def create_homework(hw: HomeworkCreate, session: Session = Depends(get_session)):
    # 1. Ensure user exists via user-service
    await verify_user_exists(hw.user_id)

    # 2. Create/save homework in hw-service database
    hw_row = db_create_assignment(
        session=session,
        user_id=hw.user_id,
        assignment_name=hw.assignment_name,
        course=hw.course,
        due_date=hw.due_date, 
    )

    # 3. Notify the notification-service (schedule reminder)
    await create_notification(hw_row)

    return hw_row


# GET /homework/{id}
@app.get("/{hw_id}", response_model=HomeworkResponse)
async def get_homework(hw_id: int, session: Session = Depends(get_session)):
    # Look up the hw in Postgres database
    homework = session.get(Homework, hw_id)
    if not homework:
        raise HTTPException(status_code=404, detail="Homework not found")
    return homework


# PUT /homework/{id}
@app.put("/{hw_id}", response_model=HomeworkResponse)
async def update_homework(
    hw_id: int,
    hw_update: HomeworkUpdate,
    user_id: Optional[int] = Query(default=None),
    session: Session = Depends(get_session),
):
    hw = session.get(Homework, hw_id)
    if not hw:
        raise HTTPException(status_code=404, detail="Homework not found")

    if user_id is not None and hw.user_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Not allowed to edit this assignment",
        )

    hw_data = hw_update.model_dump(exclude_unset=True)
    old_name = hw.assignment_name
    old_due = hw.due_date

    for key, value in hw_data.items():
        setattr(hw, key, value)

    session.add(hw)
    session.commit()
    session.refresh(hw)

    name_changed = "assignment_name" in hw_data and hw.assignment_name != old_name
    due_changed = "due_date" in hw_data and hw.due_date != old_due
    if name_changed or due_changed:
        await update_notification_for_homework(hw)

    return hw


# DELETE /homework/{id}
@app.delete("/{hw_id}")
async def delete_homework(
    hw_id: int,
    user_id: Optional[int] = Query(default=None),
    session: Session = Depends(get_session),
):
    hw = session.get(Homework, hw_id)
    if not hw:
        raise HTTPException(status_code=404, detail="Homework not found")

    if user_id is not None and hw.user_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Not allowed to delete this assignment",
        )

    await delete_notification_for_homework(hw_id)
    delete_attachment_file(hw)

    session.delete(hw)
    session.commit()
    return {"message": "Homework deleted"}

# GET homework/users/{user_id}/homework
@app.get("/users/{user_id}/homework", response_model=List[HomeworkResponse])
async def list_homework_for_user(user_id: int, session: Session = Depends(get_session)):
    await verify_user_exists(user_id)
    return db_get_homework_for_user(session, user_id)