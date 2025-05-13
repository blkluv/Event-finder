import asyncio
import logging
import os
import sys
from datetime import datetime
from typing import Dict, Any, List

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    CallbackQueryHandler,
    ContextTypes,
    filters
)
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

from app.models.user import User, UserPreferences
from app.models.event import Event
from app.services.llm_service import extract_preferences
from app.services.event_service import find_matching_events, generate_mock_events

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


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a welcome message when the command /start is issued."""
    user = update.effective_user
    
    # Create or update user in the database
    db_user = await db.users.find_one({"telegramId": user.id})
    
    if not db_user:
        new_user = User(
            telegramId=user.id,
            username=user.username,
            firstName=user.first_name,
            lastName=user.last_name,
            preferences=UserPreferences(
                eventTypes=[],
                frequency="daily"
            )
        )
        await db.users.insert_one(new_user.dict(exclude={"id"}))
    
    welcome_message = (
        f"👋 Welcome to the AI Event Assistant, {user.first_name}!\n\n"
        "I can help you discover events based on your preferences. "
        "Just tell me what you're looking for, and I'll find matching events.\n\n"
        "Here are some examples:\n"
        "- 'I'm interested in jazz concerts in New York'\n"
        "- 'Find tech conferences under $100'\n"
        "- 'What's happening this weekend?'\n\n"
        "You can also use these commands:\n"
        "/preferences - View and update your preferences\n"
        "/events - Get your matching events\n"
        "/help - Show this help message"
    )
    
    await update.message.reply_text(welcome_message)


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a help message when the command /help is issued."""
    help_message = (
        "🤖 AI Event Assistant Help\n\n"
        "I can help you discover events based on your preferences. "
        "Just tell me what you're looking for in natural language.\n\n"
        "Available commands:\n"
        "/start - Start the bot and get a welcome message\n"
        "/preferences - View and update your preferences\n"
        "/events - Get your matching events\n"
        "/help - Show this help message\n\n"
        "Examples of queries:\n"
        "- 'I'm interested in jazz concerts in New York'\n"
        "- 'Find tech conferences under $100'\n"
        "- 'Any free workshops this month?'\n"
        "- 'What's happening this weekend?'\n"
    )
    
    await update.message.reply_text(help_message)


async def show_preferences(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Show the user's current preferences."""
    user = update.effective_user
    
    # Get user from the database
    db_user = await db.users.find_one({"telegramId": user.id})
    
    if not db_user:
        await update.message.reply_text(
            "You don't have any saved preferences yet. "
            "Tell me what kind of events you're interested in!"
        )
        return
    
    # Format preferences
    prefs = db_user.get("preferences", {})
    event_types = ", ".join(prefs.get("eventTypes", [])) or "Any"
    location = prefs.get("location", "Any")
    budget_min = prefs.get("budget", {}).get("min", 0) if prefs.get("budget") else 0
    budget_max = prefs.get("budget", {}).get("max", "No limit") if prefs.get("budget") else "No limit"
    keywords = ", ".join(prefs.get("keywords", [])) or "None"
    frequency = prefs.get("frequency", "daily")
    
    preferences_message = (
        "📋 Your Current Preferences\n\n"
        f"🎭 Event Types: {event_types}\n"
        f"📍 Location: {location}\n"
        f"💰 Budget: {'Free' if budget_max == 0 else f'${budget_min} - ${budget_max}'}\n"
        f"🔍 Keywords: {keywords}\n"
        f"🔔 Notification Frequency: {frequency.capitalize()}\n\n"
        "You can update your preferences by telling me what you're interested in, "
        "or use the buttons below to change your notification frequency."
    )
    
    # Create keyboard for updating notification frequency
    keyboard = [
        [
            InlineKeyboardButton("Hourly Updates", callback_data="freq_hourly"),
            InlineKeyboardButton("Daily Updates", callback_data="freq_daily"),
        ],
        [
            InlineKeyboardButton("Turn Off Updates", callback_data="freq_off"),
        ]
    ]
    
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(preferences_message, reply_markup=reply_markup)


async def update_frequency(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle button presses to update notification frequency."""
    query = update.callback_query
    await query.answer()
    
    user = query.from_user
    frequency = query.data.split("_")[1]  # freq_hourly -> hourly
    
    # Update user preferences in the database
    result = await db.users.update_one(
        {"telegramId": user.id},
        {"$set": {"preferences.frequency": frequency, "lastActive": datetime.utcnow()}}
    )
    
    if result.modified_count > 0:
        await query.edit_message_text(
            f"✅ Your notification frequency has been updated to {frequency}.\n\n"
            "You can view your current preferences with /preferences"
        )
    else:
        await query.edit_message_text(
            "⚠️ Failed to update your preferences. Please try again later."
        )


async def get_events(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Get events matching the user's preferences."""
    user = update.effective_user
    
    # Get user from the database
    db_user = await db.users.find_one({"telegramId": user.id})
    
    if not db_user:
        await update.message.reply_text(
            "You don't have any saved preferences yet. "
            "Tell me what kind of events you're interested in!"
        )
        return
    
    # Convert preferences to the right format
    user_id = str(db_user["_id"])
    preferences = UserPreferences(**db_user.get("preferences", {}))
    
    # Find matching events
    events = await find_matching_events(db, user_id, preferences, limit=5)
    
    if not events:
        # If no events found, generate mock events for demo purposes
        await generate_mock_events(db)
        events = await find_matching_events(db, user_id, preferences, limit=5)
    
    if not events:
        await update.message.reply_text(
            "I couldn't find any events matching your preferences. "
            "Try updating your preferences with more general criteria."
        )
        return
    
    # Send matching events
    await update.message.reply_text(f"🎉 Found {len(events)} events matching your preferences:")
    
    for event in events:
        # Format event message
        event_message = (
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
        
        # Create keyboard with link to event if URL is available
        if event.url:
            keyboard = [[InlineKeyboardButton("View Event", url=event.url)]]
            reply_markup = InlineKeyboardMarkup(keyboard)
        else:
            reply_markup = None
        
        await update.message.reply_text(
            event_message,
            parse_mode="Markdown",
            reply_markup=reply_markup
        )


async def process_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Process user messages to extract preferences and find matching events."""
    user = update.effective_user
    message_text = update.message.text
    
    # Send typing action
    await context.bot.send_chat_action(
        chat_id=update.effective_chat.id,
        action="typing"
    )
    
    # Extract preferences from message
    preferences = await extract_preferences(message_text)
    
    if not preferences:
        await update.message.reply_text(
            "I'm not sure what kind of events you're looking for. "
            "Could you provide more details? For example:\n"
            "- 'I'm interested in jazz concerts in New York'\n"
            "- 'Find tech conferences under $100'\n"
            "- 'Any free workshops this month?'"
        )
        return
    
    # Update user preferences in the database
    update_data = {f"preferences.{k}": v for k, v in preferences.items()}
    update_data["lastActive"] = datetime.utcnow()
    
    await db.users.update_one(
        {"telegramId": user.id},
        {"$set": update_data}
    )
    
    # Get updated user from the database
    db_user = await db.users.find_one({"telegramId": user.id})
    user_id = str(db_user["_id"])
    
    # Convert preferences to the right format
    user_preferences = UserPreferences(**db_user.get("preferences", {}))
    
    # Find matching events
    events = await find_matching_events(db, user_id, user_preferences, limit=3)
    
    if not events:
        # If no events found, generate mock events for demo purposes
        await generate_mock_events(db)
        events = await find_matching_events(db, user_id, user_preferences, limit=3)
    
    # Acknowledge the preference update
    pref_text = []
    if preferences.get("eventTypes"):
        pref_text.append(f"event types: {', '.join(preferences['eventTypes'])}")
    if preferences.get("location"):
        pref_text.append(f"location: {preferences['location']}")
    if preferences.get("budget"):
        budget = preferences["budget"]
        budget_text = ""
        if "min" in budget and "max" in budget:
            budget_text = f"${budget['min']} - ${budget['max']}"
        elif "min" in budget:
            budget_text = f"min: ${budget['min']}"
        elif "max" in budget:
            budget_text = f"max: ${budget['max']}"
        pref_text.append(f"budget: {budget_text}")
    if preferences.get("keywords"):
        pref_text.append(f"keywords: {', '.join(preferences['keywords'])}")
    
    prefs_str = ", ".join(pref_text)
    
    await update.message.reply_text(
        f"✅ I've updated your preferences ({prefs_str})."
    )
    
    # Send matching events
    if events:
        await update.message.reply_text(f"🎉 Found {len(events)} matching events:")
        
        for event in events:
            # Format event message
            event_message = (
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
            
            # Create keyboard with link to event if URL is available
            if event.url:
                keyboard = [[InlineKeyboardButton("View Event", url=event.url)]]
                reply_markup = InlineKeyboardMarkup(keyboard)
            else:
                reply_markup = None
            
            await update.message.reply_text(
                event_message,
                parse_mode="Markdown",
                reply_markup=reply_markup
            )
    else:
        await update.message.reply_text(
            "I couldn't find any events matching your preferences. "
            "Try updating your preferences with more general criteria."
        )


async def error_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Log errors caused by updates."""
    logger.error(f"Update {update} caused error {context.error}")
    
    if update.effective_message:
        await update.effective_message.reply_text(
            "Sorry, something went wrong. Please try again later."
        )


def main() -> None:
    """Start the bot."""
    # Create the Application
    application = Application.builder().token(TOKEN).build()
    
    # Add handlers
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("preferences", show_preferences))
    application.add_handler(CommandHandler("events", get_events))
    application.add_handler(CallbackQueryHandler(update_frequency, pattern=r"^freq_"))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, process_message))
    
    # Add error handler
    application.add_error_handler(error_handler)
    
    # Run the bot
    application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()