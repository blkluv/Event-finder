from typing import List, Dict, Any, Optional
from app.models.user import UserPreferences
from app.models.event import Event
from datetime import datetime, timedelta
import re


async def find_matching_events(
    db, user_id: str, preferences: UserPreferences, limit: int = 5
) -> List[Event]:
    """Find events matching the user's preferences"""
    query = {}
    
    # Match event types
    if preferences.eventTypes:
        query["type"] = {"$in": preferences.eventTypes}
    
    # Match location
    if preferences.location:
        # Use regex for case-insensitive partial matching
        location_pattern = re.compile(preferences.location, re.IGNORECASE)
        query["location"] = {"$regex": location_pattern}
    
    # Match price/budget
    if preferences.budget:
        price_query = {}
        if "min" in preferences.budget:
            price_query["$gte"] = preferences.budget["min"]
        if "max" in preferences.budget:
            price_query["$lte"] = preferences.budget["max"]
        if price_query:
            query["price"] = price_query
    
    # Filter for future events
    now = datetime.utcnow()
    query["startDate"] = {"$gte": now}
    
    # Match keywords in title, description or tags
    if preferences.keywords:
        keyword_conditions = []
        for keyword in preferences.keywords:
            pattern = re.compile(keyword, re.IGNORECASE)
            keyword_conditions.append({"title": {"$regex": pattern}})
            keyword_conditions.append({"description": {"$regex": pattern}})
            keyword_conditions.append({"tags": {"$in": [keyword]}})
        
        if keyword_conditions:
            query["$or"] = keyword_conditions
    
    # Query database
    cursor = db.events.find(query).sort("startDate", 1).limit(limit)
    matches = await cursor.to_list(length=limit)
    
    # Convert to Event objects
    events = []
    for match in matches:
        # Convert ObjectId to string for serialization
        match["id"] = str(match.pop("_id"))
        events.append(Event(**match))
    
    return events


async def generate_mock_events(db) -> List[str]:
    """Generate mock events for testing and development"""
    # Sample mock events
    events = [
        {
            "title": "Tech Innovation Summit 2025",
            "description": "Join industry leaders for a two-day conference on the latest tech innovations and future trends. Featuring keynotes, workshops, and networking opportunities.",
            "type": "conference",
            "location": "San Francisco",
            "venue": "Moscone Center",
            "startDate": datetime.utcnow() + timedelta(days=30),
            "endDate": datetime.utcnow() + timedelta(days=32),
            "price": 299.0,
            "imageUrl": "https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg",
            "url": "https://example.com/tech-summit",
            "tags": ["tech", "innovation", "ai", "conference"],
            "source": "mock"
        },
        {
            "title": "Summer Jazz Festival",
            "description": "An outdoor jazz festival featuring world-renowned artists and local talents. Food trucks, art installations, and family-friendly activities available.",
            "type": "festival",
            "location": "New York",
            "venue": "Central Park",
            "startDate": datetime.utcnow() + timedelta(days=45),
            "endDate": datetime.utcnow() + timedelta(days=47),
            "price": 45.0,
            "imageUrl": "https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg",
            "url": "https://example.com/jazz-festival",
            "tags": ["music", "jazz", "festival", "outdoor", "family"],
            "source": "mock"
        },
        {
            "title": "Intro to Python Programming Workshop",
            "description": "A beginner-friendly workshop to learn Python programming fundamentals. No prior coding experience required. Bring your laptop!",
            "type": "workshop",
            "location": "Chicago",
            "venue": "Public Library - Downtown Branch",
            "startDate": datetime.utcnow() + timedelta(days=15),
            "endDate": datetime.utcnow() + timedelta(days=15, hours=6),
            "price": 0.0,
            "imageUrl": "https://images.pexels.com/photos/1181359/pexels-photo-1181359.jpeg",
            "url": "https://example.com/python-workshop",
            "tags": ["programming", "python", "workshop", "beginners", "free"],
            "source": "mock"
        },
        {
            "title": "Urban Street Food Festival",
            "description": "Celebrate diverse cuisines from around the world at this urban street food festival. Over 50 food vendors, live music, and cooking demonstrations.",
            "type": "food",
            "location": "Austin",
            "venue": "Waterfront Park",
            "startDate": datetime.utcnow() + timedelta(days=20),
            "endDate": datetime.utcnow() + timedelta(days=22),
            "price": 15.0,
            "imageUrl": "https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg",
            "url": "https://example.com/food-festival",
            "tags": ["food", "festival", "culinary", "street food"],
            "source": "mock"
        },
        {
            "title": "NBA Finals Game 1",
            "description": "Watch the exciting NBA Finals Game 1 live at the arena. Don't miss this championship series opener!",
            "type": "sports",
            "location": "Los Angeles",
            "venue": "Staples Center",
            "startDate": datetime.utcnow() + timedelta(days=60),
            "price": 175.0,
            "imageUrl": "https://images.pexels.com/photos/1786706/pexels-photo-1786706.jpeg",
            "url": "https://example.com/nba-finals",
            "tags": ["sports", "basketball", "nba", "finals"],
            "source": "mock"
        },
        {
            "title": "Contemporary Art Exhibition",
            "description": "Explore groundbreaking works by emerging artists in this contemporary art exhibition featuring installations, paintings, and digital art.",
            "type": "art",
            "location": "Miami",
            "venue": "Modern Art Museum",
            "startDate": datetime.utcnow() + timedelta(days=10),
            "endDate": datetime.utcnow() + timedelta(days=90),
            "price": 22.0,
            "imageUrl": "https://images.pexels.com/photos/20967/pexels-photo.jpg",
            "url": "https://example.com/art-exhibition",
            "tags": ["art", "exhibition", "contemporary", "museum"],
            "source": "mock"
        }
    ]
    
    # Insert events into database
    event_ids = []
    for event_data in events:
        result = await db.events.insert_one(event_data)
        event_ids.append(str(result.inserted_id))
    
    return event_ids