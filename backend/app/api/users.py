from fastapi import APIRouter, HTTPException, Body, Query, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from app.models.user import User, UserPreferences, UserPreferencesUpdate

router = APIRouter()

@router.get("/", response_model=List[User])
async def get_users(
    skip: int = 0, 
    limit: int = 100,
    app = Depends(lambda: None)
):
    """Get all users"""
    users = []
    cursor = app.mongodb["users"].find().skip(skip).limit(limit)
    
    async for document in cursor:
        # Convert the ObjectId to string for the id field
        document["id"] = str(document.pop("_id"))
        users.append(User(**document))
    
    return users


@router.get("/{user_id}", response_model=User)
async def get_user(
    user_id: str,
    app = Depends(lambda: None)
):
    """Get a specific user by ID"""
    if not ObjectId.is_valid(user_id):
        try:
            # Try to find by telegramId if not a valid ObjectId
            user = await app.mongodb["users"].find_one({"telegramId": int(user_id)})
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid user ID format")
    else:
        user = await app.mongodb["users"].find_one({"_id": ObjectId(user_id)})
        
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Convert the ObjectId to string for the id field
    user["id"] = str(user.pop("_id"))
    return User(**user)


@router.post("/", response_model=User)
async def create_user(
    user: User = Body(...),
    app = Depends(lambda: None)
):
    """Create a new user"""
    # Check if user with this telegramId already exists
    existing_user = await app.mongodb["users"].find_one({"telegramId": user.telegramId})
    if existing_user:
        raise HTTPException(
            status_code=400, 
            detail=f"User with telegramId {user.telegramId} already exists"
        )
    
    # Convert user model to dict for MongoDB
    user_dict = user.dict()
    user_dict.pop("id")  # Remove the id field, MongoDB will generate _id
    
    # Insert user
    result = await app.mongodb["users"].insert_one(user_dict)
    
    # Return the created user
    created_user = await app.mongodb["users"].find_one({"_id": result.inserted_id})
    created_user["id"] = str(created_user.pop("_id"))
    
    return User(**created_user)


@router.patch("/{user_id}/preferences", response_model=User)
async def update_user_preferences(
    user_id: str,
    preferences: UserPreferencesUpdate = Body(...),
    app = Depends(lambda: None)
):
    """Update user preferences"""
    # Find the user
    if not ObjectId.is_valid(user_id):
        try:
            # Try to find by telegramId if not a valid ObjectId
            user = await app.mongodb["users"].find_one({"telegramId": int(user_id)})
            if user:
                user_id = str(user["_id"])
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid user ID format")
    else:
        user = await app.mongodb["users"].find_one({"_id": ObjectId(user_id)})
        
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update only the provided fields
    update_data = {
        f"preferences.{k}": v for k, v in preferences.dict(exclude_unset=True).items()
    }
    
    if update_data:
        # Add lastActive update
        update_data["lastActive"] = datetime.utcnow()
        
        # Update the user
        result = await app.mongodb["users"].update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=304, detail="User preferences not modified")
    
    # Return the updated user
    updated_user = await app.mongodb["users"].find_one({"_id": ObjectId(user_id)})
    updated_user["id"] = str(updated_user.pop("_id"))
    
    return User(**updated_user)


@router.delete("/{user_id}", response_model=dict)
async def delete_user(
    user_id: str,
    app = Depends(lambda: None)
):
    """Delete a user"""
    if not ObjectId.is_valid(user_id):
        try:
            # Try to find by telegramId if not a valid ObjectId
            user = await app.mongodb["users"].find_one({"telegramId": int(user_id)})
            if user:
                user_id = str(user["_id"])
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid user ID format")
    
    # Delete the user
    result = await app.mongodb["users"].delete_one({"_id": ObjectId(user_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Also delete associated notifications
    await app.mongodb["notifications"].delete_many({"userId": user_id})
    
    return {"message": "User deleted successfully"}