import { useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';
import EventList from '../Events/EventList';

const ChatContainer = () => {
  const { 
    messages, 
    isTyping, 
    matchingEvents, 
    messagesEndRef,
    simulateNewEventNotification
  } = useChat();

  // Simulate receiving a new event notification after some time
  useEffect(() => {
    // Only run this once the user has received some messages
    if (messages.length > 5) {
      const timer = setTimeout(() => {
        simulateNewEventNotification();
      }, 30000); // After 30 seconds
      
      return () => clearTimeout(timer);
    }
  }, [messages.length, simulateNewEventNotification]);

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-lg shadow-lg overflow-hidden">
      {/* Chat header */}
      <div className="bg-primary-600 text-white p-4 shadow-md">
        <h2 className="text-xl font-semibold">Event Finder Assistant</h2>
        <p className="text-sm text-primary-100">Find events you'll love</p>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto hide-scrollbar">
        {messages.map((message, index) => (
          <ChatMessage 
            key={message.id} 
            message={message} 
          />
        ))}
        
        {/* Show matching events after the bot responds */}
        {matchingEvents.length > 0 && messages.some(m => 
          m.sender === 'bot' && m.text.includes("Here are some events")
        ) && (
          <div className="my-4">
            <EventList events={matchingEvents} />
          </div>
        )}
        
        {isTyping && <TypingIndicator />}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <ChatInput />
    </div>
  );
};

export default ChatContainer;