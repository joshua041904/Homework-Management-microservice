# main.py (user-service)
from sqlmodel import Session
from fastapi import FastAPI, HTTPException, Depends
from db import init_db, get_session, db_create_user, User

from models import HealthResponse, HealthStatus, UserCreate, UserResponse, UserUpdate

app = FastAPI(title="User Service")

"""
When container start, FastAPI runs the startup event
init_db creates the tables
"""
@app.on_event("startup")
async def on_startup():
    init_db()

# Endpoints
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        service="user-service",
        status=HealthStatus.healthy,
        dependencies={} # No downstream dependencies for user-service
    )

# POST /users
@app.post("/users/", response_model=UserResponse, status_code=201)
async def create_user(user: UserCreate, session: Session = Depends(get_session)):
    """Create a new user"""
    user_row = db_create_user(
        session=session,
        name=user.name,
        email=user.email,
        grade_level=user.grade_level,
    )
    return user_row

# GET /users/{id}
@app.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, session: Session = Depends(get_session)):
    # Look up user in Postgres database
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# PUT/PATCH /users/{id}
@app.put("/users/{user_id}", response_model=UserResponse)
async def update_user(user_id: int, user_update: UserUpdate, session: Session = Depends(get_session)):
    # Retrieve user from database
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Apply partial updates
    user_data = user_update.model_dump(exclude_unset=True)
    for key, value in user_data.items():
        setattr(user, key, value)

    session.add(user)
    session.commit()
    session.refresh(user)

    return user

# DELETE /users/{id}
@app.delete("/users/{user_id}")
async def delete_user(user_id: int, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    session.delete(user)
    session.commit()
    return {"message": "User Deleted"}