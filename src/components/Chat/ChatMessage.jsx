import { useState } from 'react';
import { motion } from 'framer-motion';

// Animation variants for messages
const messageVariants = {
  hidden: { 
    opacity: 0,
    y: 20
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: 'spring',
      stiffness: 500,
      damping: 30,
      mass: 1
    }
  }
};

const ChatMessage = ({ message }) => {
  const [expanded, setExpanded] = useState(false);
  const isUser = message.sender === 'user';
  
  // Format message text (handle markdown-style formatting)
  const formatText = (text) => {
    // Handle bold text with **text**
    const boldFormatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Split by newlines and join with <br> tags
    return boldFormatted.split('\n').map((line, i) => (
      <span key={i}>
        {i > 0 && <br />}
        <span dangerouslySetInnerHTML={{ __html: line }} />
      </span>
    ));
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };
  
  const isExpandable = message.text.length > 150;
  
  // Truncate text if it's long and not expanded
  const displayText = isExpandable && !expanded 
    ? message.text.substring(0, 150) + '...'
    : message.text;

  return (
    <motion.div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      initial="hidden"
      animate="visible"
      variants={messageVariants}
    >
      <div className={`message-bubble ${isUser ? 'message-user' : 'message-bot'}`}>
        <div className="text-sm">{formatText(displayText)}</div>
        
        {isExpandable && (
          <button 
            onClick={() => setExpanded(!expanded)}
            className={`text-xs mt-1 ${isUser ? 'text-primary-200' : 'text-gray-500'} hover:underline focus:outline-none`}
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
        
        <div className={`text-xs mt-1 ${isUser ? 'text-primary-200' : 'text-gray-500'}`}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;