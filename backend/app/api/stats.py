from fastapi import APIRouter, HTTPException, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Dict, Any
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/")
async def get_stats(
    days: int = 7,
    app = Depends(lambda: None)
):
    """Get dashboard statistics"""
    # Get total users
    total_users = await app.mongodb["users"].count_documents({})
    
    # Get active users (active in the last 7 days)
    week_ago = datetime.utcnow() - timedelta(days=7)
    active_users = await app.mongodb["users"].count_documents({"lastActive": {"$gte": week_ago}})
    
    # Get total events
    total_events = await app.mongodb["events"].count_documents({})
    
    # Get total notifications
    total_notifications = await app.mongodb["notifications"].count_documents({})
    
    # Get daily user counts for the past N days
    users_per_day = await _get_daily_counts(app.mongodb, "users", "createdAt", days)
    
    # Get daily notification counts for the past N days
    notifications_per_day = await _get_daily_counts(app.mongodb, "notifications", "sentAt", days)
    
    return {
        "totalUsers": total_users,
        "activeUsers": active_users,
        "totalEvents": total_events,
        "totalNotifications": total_notifications,
        "usersPerDay": users_per_day,
        "notificationsPerDay": notifications_per_day
    }


async def _get_daily_counts(db, collection_name: str, date_field: str, days: int) -> List[Dict[str, Any]]:
    """Get daily counts for a collection based on a date field"""
    daily_counts = []
    
    for day in range(days):
        date = datetime.utcnow() - timedelta(days=days-day-1)
        start_of_day = datetime(date.year, date.month, date.day, 0, 0, 0)
        end_of_day = start_of_day + timedelta(days=1)
        
        count = await db[collection_name].count_documents({
            date_field: {
                "$gte": start_of_day,
                "$lt": end_of_day
            }
        })
        
        daily_counts.append({
            "date": start_of_day.strftime("%Y-%m-%d"),
            "count": count
        })
    
    return daily_counts