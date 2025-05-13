/**
 * Extract user preferences from a message string
 * This is a simplified mock of what would normally be done with NLP or LLM
 * @param {string} message - The user message to parse
 * @returns {Object} - Extracted preferences
 */
export const extractPreferences = (message) => {
  const preferences = {
    city: null,
    eventTypes: [],
    days: []
  };
  
  // City extraction
  const cities = ['sydney', 'melbourne', 'brisbane', 'perth', 'adelaide', 'canberra', 'hobart', 'darwin'];
  for (const city of cities) {
    if (message.toLowerCase().includes(city)) {
      preferences.city = city.charAt(0).toUpperCase() + city.slice(1);
      break;
    }
  }
  
  // Event type extraction
  const eventTypeKeywords = {
    'live music': ['music', 'concert', 'band', 'gig', 'festival', 'jazz', 'rock', 'symphony'],
    'art': ['art', 'gallery', 'exhibition', 'museum'],
    'comedy': ['comedy', 'stand-up', 'funny'],
    'food': ['food', 'culinary', 'dining', 'restaurant', 'taste'],
    'market': ['market', 'fair', 'farmers'],
    'networking': ['networking', 'meetup', 'conference', 'tech', 'startup']
  };
  
  for (const [type, keywords] of Object.entries(eventTypeKeywords)) {
    for (const keyword of keywords) {
      if (message.toLowerCase().includes(keyword)) {
        if (!preferences.eventTypes.includes(type)) {
          preferences.eventTypes.push(type);
        }
        break;
      }
    }
  }
  
  // Day extraction
  const daysKeywords = {
    'Monday': ['monday', 'mon'],
    'Tuesday': ['tuesday', 'tue', 'tues'],
    'Wednesday': ['wednesday', 'wed'],
    'Thursday': ['thursday', 'thu', 'thurs'],
    'Friday': ['friday', 'fri'],
    'Saturday': ['saturday', 'sat'],
    'Sunday': ['sunday', 'sun']
  };
  
  // Special case for weekend
  if (message.toLowerCase().includes('weekend')) {
    preferences.days.push('Saturday', 'Sunday');
  } else {
    for (const [day, keywords] of Object.entries(daysKeywords)) {
      for (const keyword of keywords) {
        if (message.toLowerCase().includes(keyword)) {
          if (!preferences.days.includes(day)) {
            preferences.days.push(day);
          }
          break;
        }
      }
    }
  }
  
  return preferences;
};

/**
 * Filter events based on user preferences
 * @param {Array} events - List of events
 * @param {Object} preferences - User preferences
 * @returns {Array} - Filtered events
 */
export const filterEventsByPreferences = (events, preferences) => {
  if (!preferences) return events;
  
  return events.filter(event => {
    // Filter by city if preference is set
    if (preferences.city && event.location !== preferences.city) {
      return false;
    }
    
    // Filter by event type if preferences are set
    if (preferences.eventTypes.length > 0) {
      const matchesEventType = preferences.eventTypes.some(type => 
        event.category.toLowerCase() === type.toLowerCase()
      );
      
      if (!matchesEventType) return false;
    }
    
    // Filter by day if preferences are set
    if (preferences.days.length > 0) {
      const eventDate = new Date(event.date);
      const eventDay = [
        'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
      ][eventDate.getDay()];
      
      if (!preferences.days.includes(eventDay)) return false;
    }
    
    return true;
  });
};

/**
 * Generate a response based on user preferences and matching events
 * @param {Object} preferences - User preferences
 * @param {Array} matchingEvents - Events matching preferences
 * @returns {string} - Response message
 */
export const generateResponse = (preferences, matchingEvents) => {
  if (!preferences.city && preferences.eventTypes.length === 0 && preferences.days.length === 0) {
    return "I'd be happy to help you find events! Could you tell me what kind of events you're interested in, where, and when?";
  }
  
  let response = "Based on what you've told me, ";
  
  // Add preferences to response
  const prefParts = [];
  if (preferences.eventTypes.length > 0) {
    prefParts.push(`you're interested in ${preferences.eventTypes.join(', ')}`);
  }
  
  if (preferences.city) {
    prefParts.push(`in ${preferences.city}`);
  }
  
  if (preferences.days.length > 0) {
    prefParts.push(`on ${preferences.days.join(', ')}`);
  }
  
  response += prefParts.join(' ') + '.';
  
  // Add matching events information
  if (matchingEvents.length === 0) {
    response += " I couldn't find any events matching those preferences right now. Would you like to try different preferences?";
  } else {
    response += ` I found ${matchingEvents.length} event${matchingEvents.length > 1 ? 's' : ''} you might like!`;
  }
  
  return response;
};