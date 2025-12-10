# main.py (hw-service)
from fastapi import FastAPI, HTTPException, Depends
import os
import time
import httpx
from fastapi.responses import JSONResponse
from db import Homework, db_create_assignment, get_session, init_db
from sqlmodel import Session
from datetime import datetime

from models import HealthResponse, DependencyHealth, HealthStatus, HomeworkCreate, HomeworkResponse, HomeworkUpdate

app = FastAPI(title="HW Service")

@app.on_event("startup")
def on_startup():
    init_db()

DEPENDENCIES = {
   "user-service": os.getenv("USER_HEALTH_URL", "http://user-service:8000/health"),
   "notification-service": os.getenv("NOTIF_HEALTH_URL", "http://notification-service:8000/health"),
} 

USER_SERVICE_URL = "http://user-service:8000/users"
NOTIFICATION_SERVICE_URL = "http://notification-service:8000/notifications"

# Helper function
async def verify_user_exists(user_id: int):
    """Call user-service to ensure the user exists before creating homework."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{USER_SERVICE_URL}/{user_id}")
            # user-service returns 200 if found, 404 if not
            if response.status_code == 404:
                raise HTTPException(status_code=404, detail="User not found")
            elif response.status_code != 200:
                raise HTTPException(
                    status_code=500, detail="Error checking user existence")

    except httpx.RequestError as e:
        # This catches network errors, DNS issues, timeouts, etc.
        raise HTTPException(
            status_code=500, detail=f"Could not reach User Service: {e}")
    
    return response.json()

# Helper function
async def create_notification(hw: Homework):
    """Make a POST to notification-service so it can create the notification"""
    # Build the JSON payload expected by notification-service
    payload = {
        "user_id": hw.user_id,
        "homework_id": hw.id,
        "message": f"Reminder: {hw.assignment_name} is due on {hw.due_date.isoformat()}",
        "due_date": hw.due_date,  
    }
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(NOTIFICATION_SERVICE_URL, json=payload)
            # notification-service returns 201 if created
            if response.status_code != 201:
                raise HTTPException(
                    status_code=500, 
                    detail=f"Failed to create notification (status {response.status_code})"
                )
    except httpx.RequestError as e:
        # This catches network errors, DNS issues, timeouts, etc.
        raise HTTPException(
            status_code=500, detail=f"Could not reach Notification Service: {e}")


# Endpoints
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    # Dictionary of dependent services and their health status
    deps: dict[str, DependencyHealth] = {}

    # --- Check health of each dependent microservice ---
    async with httpx.AsyncClient(timeout=2.0) as client:
        for name, url in DEPENDENCIES.items():
            start = time.perf_counter()
            try:
                response = await client.get(url)
                elapsed_ms = int((time.perf_counter() - start) * 1000)
                status = HealthStatus.healthy if response.status_code == 200 else HealthStatus.unhealthy
                deps[name] = DependencyHealth(status=status, response_time_ms=elapsed_ms)
            except Exception:
                # Couldn't reach dependency; mark unhealthy and omit timing
                deps[name] = DependencyHealth(status=HealthStatus.unhealthy, response_time_ms=None)

    # --- Determine overall health status ---
    overall_status = (
        HealthStatus.healthy
        if all(d.status == HealthStatus.healthy for d in deps.values())
        else HealthStatus.unhealthy
    )

    body = HealthResponse(service="hw-service", status=overall_status, dependencies=deps)


    return JSONResponse(
        status_code=200 if overall_status == HealthStatus.healthy else 503,
        content=body.model_dump(),
    )


# POST /homework
@app.post("/homework/", response_model=HomeworkResponse, status_code=201)
async def create_homework(hw: HomeworkCreate, session: Session = Depends(get_session)):
    # 1. Ensure user exists
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
@app.get("/homework/{hw_id}", response_model=HomeworkResponse)
async def get_homework(hw_id: int, session: Session = Depends(get_session)):
    # Look up the hw in Postgres database
    homework = session.get(Homework, hw_id)
    if not homework:
        raise HTTPException(status_code=404, detail="Homework not found")
    return homework

# GET /homework?user_id=...
# Get and return a specified user's list of homework
# @app.get("/homework/")
# async def list_homework(user_id: int, session: Session = Depends(get_session)):
#     query = select(Homework).where(Homework.user_id == user_id)
#     return session.exec(query).all()

# PUT/PATCH /homework/{id}
@app.put("/homework/{hw_id}", response_model=HomeworkResponse)
async def update_homework(hw_id: int, hw_update: HomeworkUpdate, session: Session = Depends(get_session)):
    # Retrieve hw from database
    hw = session.get(Homework, hw_id)
    if not hw:
        raise HTTPException(status_code=404, detail="Homework not found")
    
    # Apply partial updates
    hw_data = hw_update.model_dump(exclude_unset=True)
    for key, value in hw_data.items():
        setattr(hw, key, value)

    session.add(hw)
    session.commit()
    session.refresh(hw)

    return hw

# DELETE /homework/{id}
@app.delete("/homework/{hw_id}")
def delete_homework(hw_id: int, session: Session = Depends(get_session)):
    hw = session.get(Homework, hw_id)
    if not hw:
        raise HTTPException(status_code=404, detail="Homework not found")

    session.delete(hw)
    session.commit()
    return {"message": "HW Deleted"}