# main.py (hw-service)
import time
import httpx
from fastapi import FastAPI 
from fastapi.responses import JSONResponse

from models import HealthResponse, DependencyHealth, HealthStatus 

app = FastAPI(title="HW Service")

DEPENDENCIES = {
    "user-service": "http://user-service:8001/health",
    "notification-service": "http://notification-service:8003/health",
} 

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