from enum import Enum
from pydantic import BaseModel, EmailStr, Field, field_validator, constr

# Extra imports for pydantic validation
from typing import Annotated, Dict, List, Literal, Optional
from datetime import datetime

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
    