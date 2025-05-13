from typing import Dict, List, Optional, Any
import os
from dotenv import load_dotenv
import json
from langchain.llms import HuggingFaceHub
from langchain.schema import HumanMessage, SystemMessage
from langchain.prompts import ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate

# Load environment variables
load_dotenv()

# Setup LLM
def get_llm():
    """Get LLM model for preference extraction"""
    try:
        # Using HuggingFaceHub as an example
        # You can replace this with another open-source LLM implementation
        model_id = "mistralai/Mistral-7B-Instruct-v0.2"
        
        llm = HuggingFaceHub(
            repo_id=model_id,
            huggingfacehub_api_token=os.getenv("HUGGINGFACE_API_TOKEN"),
            model_kwargs={"temperature": 0.5, "max_new_tokens": 512}
        )
        return llm
    except Exception as e:
        print(f"Failed to load LLM: {e}")
        return None


# Define system prompt for preference extraction
SYSTEM_PROMPT = """
You are an AI assistant that helps extract event preferences from user messages.
Your task is to identify the following information from the user's message:
1. Event types they're interested in (e.g., concerts, workshops, sports events)
2. Location preference
3. Budget constraints (minimum and maximum)
4. Keywords or specific interests
5. Other relevant preferences

Output the extracted information in JSON format with the following structure:
{
  "eventTypes": ["type1", "type2", ...],
  "location": "location name",
  "maxDistance": distance in kilometers or miles (numeric value only),
  "budget": {"min": minimum amount, "max": maximum amount},
  "keywords": ["keyword1", "keyword2", ...]
}

If any information is not provided, omit that field from the JSON.
"""

async def extract_preferences(user_message: str) -> Dict[str, Any]:
    """Extract user preferences from a message using LLM"""
    try:
        llm = get_llm()
        
        if not llm:
            # Fallback to rule-based extraction if LLM is not available
            return _fallback_preference_extraction(user_message)
        
        # Create prompt
        chat_prompt = ChatPromptTemplate.from_messages([
            SystemMessagePromptTemplate.from_template(SYSTEM_PROMPT),
            HumanMessagePromptTemplate.from_template("{input}")
        ])
        
        # Format prompt with user message
        formatted_prompt = chat_prompt.format_prompt(input=user_message)
        
        # Get LLM response
        response = llm(formatted_prompt.to_string())
        
        # Extract JSON from response
        json_str = response.strip()
        if json_str.startswith("```json"):
            json_str = json_str[7:]
        if json_str.endswith("```"):
            json_str = json_str[:-3]
        
        preferences = json.loads(json_str)
        return preferences
    
    except Exception as e:
        print(f"Error in preference extraction: {e}")
        # Fallback to rule-based extraction
        return _fallback_preference_extraction(user_message)


def _fallback_preference_extraction(user_message: str) -> Dict[str, Any]:
    """Rule-based fallback for preference extraction when LLM is unavailable"""
    # This is a simple implementation and would be more sophisticated in a real system
    message = user_message.lower()
    preferences = {}
    
    # Extract event types
    event_types = []
    if "concert" in message:
        event_types.append("concert")
    if "workshop" in message:
        event_types.append("workshop")
    if "conference" in message:
        event_types.append("conference")
    if "festival" in message:
        event_types.append("festival")
    if "sport" in message:
        event_types.append("sports")
    if "art" in message or "exhibition" in message:
        event_types.append("art")
    if "food" in message:
        event_types.append("food")
    
    if event_types:
        preferences["eventTypes"] = event_types
    
    # Extract location (very simplistic approach)
    cities = ["new york", "san francisco", "los angeles", "chicago", "austin", "miami"]
    for city in cities:
        if city in message:
            preferences["location"] = city.title()
            break
    
    # Extract price/budget information
    if "free" in message:
        preferences["budget"] = {"max": 0}
    elif "cheap" in message:
        preferences["budget"] = {"max": 50}
    
    # Extract keywords
    keywords = []
    potential_keywords = ["jazz", "rock", "tech", "ai", "food", "wine", "family", "art"]
    for keyword in potential_keywords:
        if keyword in message:
            keywords.append(keyword)
    
    if keywords:
        preferences["keywords"] = keywords
    
    return preferences