from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import FastAPI
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection string
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "event_assistant")


async def init_db(app: FastAPI):
    """Initialize MongoDB connection"""
    # Connect to MongoDB
    app.mongodb_client = AsyncIOMotorClient(MONGODB_URI)
    app.mongodb = app.mongodb_client[DATABASE_NAME]
    
    # Create indexes
    await app.mongodb["users"].create_index("telegramId", unique=True)
    await app.mongodb["events"].create_index("title")
    await app.mongodb["events"].create_index("location")
    await app.mongodb["events"].create_index("type")
    await app.mongodb["events"].create_index("startDate")
    await app.mongodb["notifications"].create_index("userId")
    await app.mongodb["notifications"].create_index("eventId")
    await app.mongodb["notifications"].create_index("sentAt")
    
    print("Connected to MongoDB!")


async def get_db():
    """Get MongoDB database"""
    # This function would be used with FastAPI Depends
    # but for simplicity, we'll access the DB directly from the app
    pass