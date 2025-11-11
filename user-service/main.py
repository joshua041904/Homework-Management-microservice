from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
import redis
import httpx
import os
import uuid
from datetime import datetime

app = FastAPI()

# Endpoints
@app.get("/health")
async def health_check():
    return {"status": "healthy"}