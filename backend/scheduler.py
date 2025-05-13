import asyncio
import logging
import os
import sys
from datetime import datetime, timedelta
from typing import List, Dict, Any

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from motor.motor_asyncio import AsyncIOMotorClient
from telegram import Bot
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from dotenv import load_dotenv

from app.models.user import User, UserPreferences
from app.models.event import Event
from app.models.notification import Notification
from app.services.event_service import find_matching_events

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Telegram Bot token
TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
if not TOKEN:
    logger.error("No Telegram bot token provided!")
    sys.exit(1)

# MongoDB connection
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "event_assistant")

# Initialize MongoDB client
mongodb_client = AsyncIOMotorClient(MONGODB_URI)
db = mongodb_client[DATABASE_NAME]

# Initialize Telegram Bot
bot = Bot(token=TOKEN)


async def send_event_notification(user_id: str, event: Event) -> None:
    """Send a notification about an event to a user."""
    try:
        # Get user from the database
        db_user = await db.users.find_one({"_id": user_id})
        
        if not db_user:
            logger.error(f"User {user_id} not found")
            return
        
        # Create notification record
        notification = Notification(
            userId=user_id,
            eventId=event.id,
            sentAt=datetime.utcnow(),
            status="pending",
            type="auto"
        )
        
        # Insert notification
        notification_dict = notification.dict()
        notification_dict.pop("id")  # Remove id field
        result = await db.notifications.insert_one(notification_dict)
        notification_id = result.inserted_id
        
        # Format event message
        event_message = (
            f"🎉 New Event Alert! 🎉\n\n"
            f"🎭 *{event.title}*\n"
            f"📝 {event.description[:100]}...\n"
            f"📍 {event.location}"
        )
        
        if event.venue:
            event_message += f" ({event.venue})"
        
        event_message += f"\n📅 {event.startDate.strftime('%Y-%m-%d %H:%M')}"
        
        if event.price is not None:
            event_message += f"\n💰 {'Free' if event.price == 0 else f'${event.price:.2f}'}"
        
        if event.url:
            event_message += f"\n🔗 [More Info]({event.url})"
        
        # Send message to user
        await bot.send_message(
            chat_id=db_user["telegramId"],
            text=event_message,
            parse_mode="Markdown"
        )
        
        # Update notification status to sent
        await db.notifications.update_one(
            {"_id": notification_id},
            {"$set": {"status": "sent"}}
        )
    
    except Exception as e:
        logger.error(f"Error sending notification: {e}")
        # Update notification status to failed
        if notification_id:
            await db.notifications.update_one(
                {"_id": notification_id},
                {"$set": {"status": "failed"}}
            )


async def check_hourly_notifications() -> None:
    """Check and send notifications to users with hourly frequency."""
    logger.info("Running hourly notification check")
    
    try:
        # Get users with hourly notification frequency
        cursor = db.users.find({"preferences.frequency": "hourly"})
        users = await cursor.to_list(length=None)
        
        for user_doc in users:
            user_id = str(user_doc["_id"])
            preferences = UserPreferences(**user_doc.get("preferences", {}))
            
            # Find matching events
            events = await find_matching_events(db, user_id, preferences, limit=1)
            
            if events:
                # Check if we've already notified this user about this event
                notification_exists = await db.notifications.find_one({
                    "userId": user_id,
                    "eventId": events[0].id
                })
                
                if not notification_exists:
                    await send_event_notification(user_id, events[0])
    
    except Exception as e:
        logger.error(f"Error in hourly notification check: {e}")


async def check_daily_notifications() -> None:
    """Check and send notifications to users with daily frequency."""
    logger.info("Running daily notification check")
    
    try:
        # Get users with daily notification frequency
        cursor = db.users.find({"preferences.frequency": "daily"})
        users = await cursor.to_list(length=None)
        
        for user_doc in users:
            user_id = str(user_doc["_id"])
            preferences = UserPreferences(**user_doc.get("preferences", {}))
            
            # Find matching events
            events = await find_matching_events(db, user_id, preferences, limit=3)
            
            for event in events:
                # Check if we've already notified this user about this event
                notification_exists = await db.notifications.find_one({
                    "userId": user_id,
                    "eventId": event.id
                })
                
                if not notification_exists:
                    await send_event_notification(user_id, event)
    
    except Exception as e:
        logger.error(f"Error in daily notification check: {e}")


async def cleanup_old_notifications() -> None:
    """Clean up old notifications (older than 30 days)."""
    logger.info("Running notification cleanup")
    
    try:
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        result = await db.notifications.delete_many({
            "sentAt": {"$lt": thirty_days_ago}
        })
        
        if result.deleted_count > 0:
            logger.info(f"Deleted {result.deleted_count} old notifications")
    
    except Exception as e:
        logger.error(f"Error in notification cleanup: {e}")


async def main() -> None:
    """Set up and run the scheduler."""
    # Create scheduler
    scheduler = AsyncIOScheduler()
    
    # Add jobs
    scheduler.add_job(check_hourly_notifications, 'interval', hours=1)
    scheduler.add_job(check_daily_notifications, 'cron', hour=9, minute=0)  # 9 AM daily
    scheduler.add_job(cleanup_old_notifications, 'cron', day=1)  # First day of each month
    
    # Start scheduler
    scheduler.start()
    logger.info("Scheduler started")
    
    try:
        # Keep the main task running
        while True:
            await asyncio.sleep(1)
    except (KeyboardInterrupt, SystemExit):
        # Shutdown
        scheduler.shutdown()
        mongodb_client.close()
        logger.info("Scheduler stopped")


if __name__ == "__main__":
    asyncio.run(main())