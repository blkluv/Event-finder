from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid


class Event(BaseModel):
    """Event model for MongoDB"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    type: str
    location: str
    venue: Optional[str] = None
    startDate: datetime
    endDate: Optional[datetime] = None
    price: Optional[float] = None
    imageUrl: Optional[str] = None
    url: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    source: str = "mock"  # "mock" or "eventbrite"

    class Config:
        schema_extra = {
            "example": {
                "title": "Tech Conference 2025",
                "description": "A conference about the latest tech innovations",
                "type": "conference",
                "location": "San Francisco",
                "venue": "Moscone Center",
                "startDate": "2025-06-15T09:00:00Z",
                "endDate": "2025-06-17T18:00:00Z",
                "price": 299.99,
                "imageUrl": "https://example.com/image.jpg",
                "url": "https://example.com/event",
                "tags": ["tech", "innovation", "conference"],
                "source": "mock"
            }
        }


class EventFilter(BaseModel):
    """Filter for querying events"""
    type: Optional[str] = None
    location: Optional[str] = None
    minPrice: Optional[float] = None
    maxPrice: Optional[float] = None
    startAfter: Optional[datetime] = None
    startBefore: Optional[datetime] = None
    tags: Optional[List[str]] = None