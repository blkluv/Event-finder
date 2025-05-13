from fastapi import APIRouter, HTTPException, Body, Query, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from app.models.notification import Notification, NotificationCreate

router = APIRouter()

@router.get("/", response_model=List[Notification])
async def get_notifications(
    userId: Optional[str] = None,
    eventId: Optional[str] = None,
    status: Optional[str] = None,
    type: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    app = Depends(lambda: None)
):
    """Get notifications with optional filters"""
    # Build the query
    query = {}
    
    if userId:
        query["userId"] = userId
    
    if eventId:
        query["eventId"] = eventId
    
    if status:
        if status not in ["pending", "sent", "failed"]:
            raise HTTPException(status_code=400, detail="Invalid status value")
        query["status"] = status
    
    if type:
        if type not in ["auto", "manual"]:
            raise HTTPException(status_code=400, detail="Invalid type value")
        query["type"] = type
    
    # Execute the query
    notifications = []
    cursor = app.mongodb["notifications"].find(query).sort("sentAt", -1).skip(skip).limit(limit)
    
    async for document in cursor:
        document["id"] = str(document.pop("_id"))
        notifications.append(Notification(**document))
    
    return notifications


@router.get("/{notification_id}", response_model=Notification)
async def get_notification(
    notification_id: str,
    app = Depends(lambda: None)
):
    """Get a specific notification by ID"""
    if not ObjectId.is_valid(notification_id):
        raise HTTPException(status_code=400, detail="Invalid notification ID format")
    
    notification = await app.mongodb["notifications"].find_one({"_id": ObjectId(notification_id)})
    
    if notification is None:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification["id"] = str(notification.pop("_id"))
    return Notification(**notification)


@router.post("/manual", response_model=Notification)
async def create_manual_notification(
    notification: NotificationCreate = Body(...),
    app = Depends(lambda: None)
):
    """Create a manual notification to be sent to a user"""
    # Check if user exists
    if ObjectId.is_valid(notification.userId):
        user = await app.mongodb["users"].find_one({"_id": ObjectId(notification.userId)})
    else:
        # Try with telegramId
        try:
            user = await app.mongodb["users"].find_one({"telegramId": int(notification.userId)})
            if user:
                notification.userId = str(user["_id"])
        except ValueError:
            user = None
    
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if event exists
    if ObjectId.is_valid(notification.eventId):
        event = await app.mongodb["events"].find_one({"_id": ObjectId(notification.eventId)})
    else:
        event = None
    
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Create notification object
    new_notification = Notification(
        userId=notification.userId,
        eventId=notification.eventId,
        sentAt=datetime.utcnow(),
        status="pending",
        type="manual"
    )
    
    # Convert to dict for MongoDB
    notification_dict = new_notification.dict()
    notification_dict.pop("id")  # Remove id field
    
    # Insert notification
    result = await app.mongodb["notifications"].insert_one(notification_dict)
    
    # Simulate sending notification (in a real app, this would call the Telegram API)
    # Here we'll just mark it as sent after a brief delay
    await app.mongodb["notifications"].update_one(
        {"_id": result.inserted_id},
        {"$set": {"status": "sent"}}
    )
    
    # Return the created notification
    created_notification = await app.mongodb["notifications"].find_one({"_id": result.inserted_id})
    created_notification["id"] = str(created_notification.pop("_id"))
    
    return Notification(**created_notification)


@router.delete("/{notification_id}", response_model=dict)
async def delete_notification(
    notification_id: str,
    app = Depends(lambda: None)
):
    """Delete a notification"""
    if not ObjectId.is_valid(notification_id):
        raise HTTPException(status_code=400, detail="Invalid notification ID format")
    
    # Delete the notification
    result = await app.mongodb["notifications"].delete_one({"_id": ObjectId(notification_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {"message": "Notification deleted successfully"}