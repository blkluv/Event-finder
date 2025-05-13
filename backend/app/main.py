from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional, List, Dict, Any
import os
from datetime import datetime, timedelta

from app.models.user import User, UserPreferences
from app.models.event import Event
from app.models.notification import Notification
from app.services.mongodb import get_db, init_db
from app.services.llm_service import extract_preferences
from app.services.event_service import find_matching_events
from app.api.users import router as users_router
from app.api.events import router as events_router
from app.api.notifications import router as notifications_router
from app.api.stats import router as stats_router

# Create FastAPI app
app = FastAPI(
    title="AI Event Assistant API",
    description="Backend API for the AI Event Assistant",
    version="0.1.0"
)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users_router, prefix="/users", tags=["users"])
app.include_router(events_router, prefix="/events", tags=["events"])
app.include_router(notifications_router, prefix="/notifications", tags=["notifications"])
app.include_router(stats_router, prefix="/stats", tags=["stats"])

@app.on_event("startup")
async def startup_db_client():
    await init_db(app)

@app.on_event("shutdown")
async def shutdown_db_client():
    app.mongodb_client.close()

@app.get("/")
async def root():
    return {"message": "Welcome to the AI Event Assistant API"}

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "version": app.version
    }

# Run with: uvicorn app.main:app --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)