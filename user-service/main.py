# main.py (user-service)
from fastapi import FastAPI 

from models import HealthResponse, HealthStatus 

app = FastAPI(title="User Service")

# Endpoints
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        service="user-service",
        status=HealthStatus.healthy,
        dependencies={} # No downstream dependencies for user-service
    )