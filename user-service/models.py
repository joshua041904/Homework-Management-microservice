from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field, ConfigDict

# Extra imports for pydantic validation
from typing import Dict, Optional

# Response models
class HealthStatus(str, Enum):
    healthy = "healthy"
    unhealthy = "unhealthy"

class DependencyHealth(BaseModel):
    status: HealthStatus
    # Keep response_time_ms non-negative; allow None if a call failed before timing.
    response_time_ms: Optional[int] = Field(default=None, ge=0)

class HealthResponse(BaseModel):
    service: str
    status: HealthStatus
    # Map dependent-service-name -> health info
    dependencies: Dict[str, DependencyHealth] = Field(default_factory=dict)
    
class UserCreate(BaseModel):
    name: str
    email: str
    grade_level: Optional[str] = None
    
class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    grade_level: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    grade_level: Optional[str] = None
    created_at: datetime
    # We are returning the SQLModel User object from endpoints
    # Using config to let Pydantic convert ORM objects to UserResponse.
    model_config = ConfigDict(from_attributes=True)
