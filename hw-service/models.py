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

class HomeworkCreate(BaseModel):
    user_id: int
    assignment_name: str
    course: Optional[str] = None
    due_date: datetime
    
class HomeworkUpdate(BaseModel):
    assignment_name: Optional[str] = None
    course: Optional[str] = None
    due_date: Optional[datetime] = None

class HomeworkResponse(BaseModel):
    id: int
    user_id: int
    assignment_name: str
    course: Optional[str] = None
    due_date: datetime
    created_at: datetime
    file_original_name: Optional[str] = None
    file_content_type: Optional[str] = None
    file_size_bytes: Optional[int] = None
    model_config = ConfigDict(from_attributes=True)
