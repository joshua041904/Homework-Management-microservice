# main.py (notification-service)
from fastapi import FastAPI 

from models import HealthResponse, HealthStatus 

app = FastAPI(title="Notification Service")

# Endpoints
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        service="notification-service",
        status=HealthStatus.healthy,
        dependencies={} # No downstream dependencies for notification-service
    )