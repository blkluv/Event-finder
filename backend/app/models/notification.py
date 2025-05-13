from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
import uuid


class Notification(BaseModel):
    """Notification model for MongoDB"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    userId: str
    eventId: str
    sentAt: datetime = Field(default_factory=datetime.utcnow)
    status: str = "pending"  # "pending", "sent", "failed"
    type: str = "auto"  # "auto" or "manual"

    @validator('status')
    def validate_status(cls, v):
        if v not in ["pending", "sent", "failed"]:
            raise ValueError('status must be "pending", "sent", or "failed"')
        return v

    @validator('type')
    def validate_type(cls, v):
        if v not in ["auto", "manual"]:
            raise ValueError('type must be "auto" or "manual"')
        return v

    class Config:
        schema_extra = {
            "example": {
                "userId": "user_id_here",
                "eventId": "event_id_here",
                "sentAt": "2025-01-01T12:00:00Z",
                "status": "sent",
                "type": "auto"
            }
        }


class NotificationCreate(BaseModel):
    """Model for creating a notification"""
    userId: str
    eventId: str
    type: str = "manual"  # "auto" or "manual"

    @validator('type')
    def validate_type(cls, v):
        if v not in ["auto", "manual"]:
            raise ValueError('type must be "auto" or "manual"')
        return v