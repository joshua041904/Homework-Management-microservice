from datetime import datetime
from enum import Enum
from pydantic import BaseModel, ConfigDict, Field

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
    
class NotificationCreate(BaseModel):
    user_id: int 
    homework_id: int
    message: str
    due_date: datetime
    
class NotificationUpdate(BaseModel):
    user_id: int 
    homework_id: int
    message: str
    due_date: datetime

class NotificationResponse(BaseModel):
    id: int
    user_id: int 
    homework_id: int
    message: str
    due_date: datetime
    created_at: datetime
    sent: bool = Field(default=False)
    model_config = ConfigDict(from_attributes=True)
