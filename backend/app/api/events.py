from fastapi import APIRouter, HTTPException, Body, Query, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from app.models.event import Event, EventFilter
from app.services.event_service import generate_mock_events

router = APIRouter()

@router.get("/", response_model=List[Event])
async def get_events(
    type: Optional[str] = None,
    location: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    skip: int = 0,
    limit: int = 100,
    app = Depends(lambda: None)
):
    """Get events with optional filters"""
    # Build the query
    query = {}
    
    if type:
        query["type"] = type
    
    if location:
        # Case-insensitive partial matching
        query["location"] = {"$regex": location, "$options": "i"}
    
    # Price filter
    if min_price is not None or max_price is not None:
        price_query = {}
        if min_price is not None:
            price_query["$gte"] = min_price
        if max_price is not None:
            price_query["$lte"] = max_price
        query["price"] = price_query
    
    # Execute the query
    events = []
    cursor = app.mongodb["events"].find(query).sort("startDate", 1).skip(skip).limit(limit)
    
    async for document in cursor:
        document["id"] = str(document.pop("_id"))
        events.append(Event(**document))
    
    # If no events found, generate mock events for development
    if not events:
        event_count = await app.mongodb["events"].count_documents({})
        if event_count == 0:
            await generate_mock_events(app.mongodb)
            return await get_events(type, location, min_price, max_price, skip, limit, app)
    
    return events


@router.get("/{event_id}", response_model=Event)
async def get_event(
    event_id: str,
    app = Depends(lambda: None)
):
    """Get a specific event by ID"""
    if not ObjectId.is_valid(event_id):
        raise HTTPException(status_code=400, detail="Invalid event ID format")
    
    event = await app.mongodb["events"].find_one({"_id": ObjectId(event_id)})
    
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    
    event["id"] = str(event.pop("_id"))
    return Event(**event)


@router.post("/", response_model=Event)
async def create_event(
    event: Event = Body(...),
    app = Depends(lambda: None)
):
    """Create a new event"""
    # Convert event model to dict for MongoDB
    event_dict = event.dict()
    
    # Use provided id or remove it to let MongoDB generate one
    if "id" in event_dict and event_dict["id"]:
        event_dict["_id"] = ObjectId(event_dict["id"])
        del event_dict["id"]
    else:
        del event_dict["id"]
    
    # Insert event
    result = await app.mongodb["events"].insert_one(event_dict)
    
    # Return the created event
    created_event = await app.mongodb["events"].find_one({"_id": result.inserted_id})
    created_event["id"] = str(created_event.pop("_id"))
    
    return Event(**created_event)


@router.put("/{event_id}", response_model=Event)
async def update_event(
    event_id: str,
    event: Event = Body(...),
    app = Depends(lambda: None)
):
    """Update an event"""
    if not ObjectId.is_valid(event_id):
        raise HTTPException(status_code=400, detail="Invalid event ID format")
    
    # Check if event exists
    existing_event = await app.mongodb["events"].find_one({"_id": ObjectId(event_id)})
    if existing_event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Convert event model to dict for MongoDB
    event_dict = event.dict(exclude={"id"})
    
    # Update the event
    result = await app.mongodb["events"].update_one(
        {"_id": ObjectId(event_id)},
        {"$set": event_dict}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=304, detail="Event not modified")
    
    # Return the updated event
    updated_event = await app.mongodb["events"].find_one({"_id": ObjectId(event_id)})
    updated_event["id"] = str(updated_event.pop("_id"))
    
    return Event(**updated_event)


@router.delete("/{event_id}", response_model=dict)
async def delete_event(
    event_id: str,
    app = Depends(lambda: None)
):
    """Delete an event"""
    if not ObjectId.is_valid(event_id):
        raise HTTPException(status_code=400, detail="Invalid event ID format")
    
    # Delete the event
    result = await app.mongodb["events"].delete_one({"_id": ObjectId(event_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Also delete associated notifications
    await app.mongodb["notifications"].delete_many({"eventId": event_id})
    
    return {"message": "Event deleted successfully"}