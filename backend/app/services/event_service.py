async def generate_mock_events(db) -> List[str]:
    """Generate mock events focused on Atlanta and Atlantic City"""
    events = [
        # Atlanta Events
        {
            "title": "Atlanta Jazz Festival 2025",
            "description": "The largest free jazz festival in the country, featuring world-class musicians across multiple stages in Piedmont Park.",
            "type": "music",
            "location": "Atlanta",
            "venue": "Piedmont Park",
            "startDate": datetime.utcnow() + timedelta(days=45),
            "endDate": datetime.utcnow() + timedelta(days=47),
            "price": 0.0,
            "imageUrl": "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3",
            "url": "https://atljazzfest.com",
            "tags": ["jazz", "free", "outdoor", "music"],
            "source": "atlanta"
        },
        {
            "title": "Dragon Con 2025",
            "description": "The world's largest fantasy, sci-fi, and pop culture convention with celebrity guests, panels, and cosplay competitions.",
            "type": "convention",
            "location": "Atlanta",
            "venue": "Multiple Downtown Hotels",
            "startDate": datetime.utcnow() + timedelta(days=120),
            "endDate": datetime.utcnow() + timedelta(days=123),
            "price": 150.0,
            "imageUrl": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb",
            "url": "https://dragoncon.org",
            "tags": ["scifi", "fantasy", "cosplay", "comics"],
            "source": "atlanta"
        },
        {
            "title": "Peachtree Road Race",
            "description": "The world's largest 10K race through the heart of Atlanta on July 4th with 60,000 participants.",
            "type": "sports",
            "location": "Atlanta",
            "venue": "Peachtree Street",
            "startDate": datetime(datetime.utcnow().year + 1, 7, 4, 7, 0),
            "price": 50.0,
            "imageUrl": "https://images.unsplash.com/photo-1552674605-db6ffd4facb5",
            "url": "https://atlantatrackclub.org",
            "tags": ["running", "fitness", "4th of july"],
            "source": "atlanta"
        },

        # Atlantic City Events
        {
            "title": "Atlantic City Airshow",
            "description": "Thrilling aerial performances over the Atlantic City beach featuring military and civilian stunt pilots.",
            "type": "outdoor",
            "location": "Atlantic City",
            "venue": "Boardwalk Beaches",
            "startDate": datetime.utcnow() + timedelta(days=60),
            "price": 0.0,
            "imageUrl": "https://images.unsplash.com/photo-1556388158-158ea5ccacbd",
            "url": "https://www.atlanticcitynj.com",
            "tags": ["airshow", "free", "summer"],
            "source": "atlantic-city"
        },
        {
            "title": "Borgata Poker Open",
            "description": "World Series of Poker Circuit event featuring multi-million dollar prize pools at Borgata Hotel Casino.",
            "type": "casino",
            "location": "Atlantic City",
            "venue": "Borgata Hotel Casino",
            "startDate": datetime.utcnow() + timedelta(days=90),
            "endDate": datetime.utcnow() + timedelta(days=95),
            "price": 1000.0,
            "imageUrl": "https://images.unsplash.com/photo-1593510987185-1ec2256148a3",
            "url": "https://www.theborgata.com",
            "tags": ["poker", "casino", "gambling"],
            "source": "atlantic-city"
        },
        {
            "title": "BeachGlow Music Festival",
            "description": "EDM festival on the beach with top DJs, light shows, and oceanfront dancing under the stars.",
            "type": "music",
            "location": "Atlantic City",
            "venue": "Atlantic City Beach",
            "startDate": datetime.utcnow() + timedelta(days=75),
            "price": 129.0,
            "imageUrl": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745",
            "url": "https://beachglowconcert.com",
            "tags": ["edm", "dance", "beach"],
            "source": "atlantic-city"
        }
    ]
    
    # Insert events into database
    event_ids = []
    for event_data in events:
        result = await db.events.insert_one(event_data)
        event_ids.append(str(result.inserted_id))
    
    return event_ids
