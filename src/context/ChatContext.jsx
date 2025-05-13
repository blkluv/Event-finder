import { createContext, useContext, useState, useEffect, useRef } from 'react';
import events from '../data/events';
import { extractPreferences, filterEventsByPreferences, generateResponse } from '../utils/preferenceParser';

// Create context
const ChatContext = createContext();

// Default welcome messages
const WELCOME_MESSAGES = [
  { id: 'welcome-1', text: "Hi there! I'm your event assistant. I can help you find events you might be interested in.", sender: 'bot', timestamp: new Date() },
  { id: 'welcome-2', text: "What kind of events are you looking for? For example, you could say 'I'm interested in live music in Sydney on weekends'", sender: 'bot', timestamp: new Date(Date.now() + 1000) }
];

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState(WELCOME_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const [userPreferences, setUserPreferences] = useState(null);
  const [matchingEvents, setMatchingEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Simulate bot typing and response
  const botReply = (message, delay = 1500) => {
    setIsTyping(true);
    
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: `bot-${Date.now()}`,
        text: message,
        sender: 'bot',
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, delay);
  };

  // Process user message
  const sendMessage = (text) => {
    if (!text.trim()) return;
    
    // Add user message
    const userMessage = {
      id: `user-${Date.now()}`,
      text,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Extract preferences
    const preferences = extractPreferences(text);
    setUserPreferences(prev => ({
      city: preferences.city || prev?.city || null,
      eventTypes: preferences.eventTypes.length > 0 ? preferences.eventTypes : prev?.eventTypes || [],
      days: preferences.days.length > 0 ? preferences.days : prev?.days || []
    }));
    
    // Show typing indicator
    setIsTyping(true);
    
    // Process the message after a delay to simulate thinking
    setTimeout(() => {
      // Find matching events
      const filtered = filterEventsByPreferences(events, preferences);
      setMatchingEvents(filtered);
      
      // Generate response
      const response = generateResponse(preferences, filtered);
      botReply(response);
      
      // If we found events, show them after the text response
      if (filtered.length > 0) {
        setTimeout(() => {
          botReply("Here are some events you might enjoy:", 1000);
        }, 2000);
      }
    }, 1500);
  };

  // Simulate receiving a new event notification
  const simulateNewEventNotification = () => {
    if (!userPreferences) return;
    
    // Pick a random event that matches user preferences
    const relevantEvents = filterEventsByPreferences(events, userPreferences);
    
    if (relevantEvents.length > 0) {
      const randomEvent = relevantEvents[Math.floor(Math.random() * relevantEvents.length)];
      
      const notification = {
        id: `notification-${Date.now()}`,
        event: randomEvent,
        read: false,
        timestamp: new Date()
      };
      
      setNotifications(prev => [...prev, notification]);
      
      // Add a bot message about the new event
      botReply(`🔔 I just found a new event that matches your interests! "${randomEvent.title}" is happening at ${randomEvent.venue} on ${new Date(randomEvent.date).toLocaleDateString()}.`);
    }
  };

  // Show event details
  const showEventDetails = (eventId) => {
    const event = events.find(e => e.id === eventId);
    
    if (event) {
      const eventDate = new Date(event.date);
      const formattedDate = eventDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      botReply(`📅 **${event.title}**
Location: ${event.venue}, ${event.location}
Date: ${formattedDate}
Category: ${event.category}

${event.description}`);
    }
  };

  // Clear chat history
  const clearChat = () => {
    setMessages(WELCOME_MESSAGES);
    setUserPreferences(null);
    setMatchingEvents([]);
  };

  // Mark notification as read
  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  return (
    <ChatContext.Provider value={{
      messages,
      isTyping,
      matchingEvents,
      notifications,
      userPreferences,
      sendMessage,
      showEventDetails,
      clearChat,
      simulateNewEventNotification,
      markNotificationAsRead,
      messagesEndRef
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);