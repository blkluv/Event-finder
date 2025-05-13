from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict
from datetime import datetime
import uuid


class UserPreferences(BaseModel):
    """User preferences for event matching"""
    eventTypes: List[str] = Field(default_factory=list)
    location: Optional[str] = None
    maxDistance: Optional[int] = None
    budget: Optional[Dict[str, float]] = None
    keywords: Optional[List[str]] = None
    frequency: str = "daily"  # "daily", "hourly", or "off"

    @validator('frequency')
    def validate_frequency(cls, v):
        if v not in ["daily", "hourly", "off"]:
            raise ValueError('frequency must be "daily", "hourly", or "off"')
        return v


class User(BaseModel):
    """User model for MongoDB"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    telegramId: int
    username: Optional[str] = None
    firstName: str
    lastName: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    preferences: UserPreferences = Field(default_factory=UserPreferences)
    lastActive: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        schema_extra = {
            "example": {
                "telegramId": 12345678,
                "username": "johndoe",
                "firstName": "John",
                "lastName": "Doe",
                "preferences": {
                    "eventTypes": ["concert", "festival"],
                    "location": "New York",
                    "maxDistance": 10,
                    "budget": {
                        "min": 0,
                        "max": 100
                    },
                    "keywords": ["jazz", "rock"],
                    "frequency": "daily"
                }
            }
        }


class UserPreferencesUpdate(BaseModel):
    """Model for updating user preferences"""
    eventTypes: Optional[List[str]] = None
    location: Optional[str] = None
    maxDistance: Optional[int] = None
    budget: Optional[Dict[str, float]] = None
    keywords: Optional[List[str]] = None
    frequency: Optional[str] = None

    @validator('frequency')
    def validate_frequency(cls, v):
        if v is not None and v not in ["daily", "hourly", "off"]:
            raise ValueError('frequency must be "daily", "hourly", or "off"')
        return v