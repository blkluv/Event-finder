import { useState } from 'react';
import { motion } from 'framer-motion';
import { useChat } from '../../context/ChatContext';

const ChatInput = () => {
  const [message, setMessage] = useState('');
  const { sendMessage } = useChat();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="flex items-center border-t border-gray-200 p-4 bg-white"
    >
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
      
      <motion.button
        type="submit"
        whileTap={{ scale: 0.95 }}
        className="ml-2 btn btn-primary rounded-full h-10 w-10 flex items-center justify-center"
        disabled={!message.trim()}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor" 
          className="w-5 h-5"
        >
          <path 
            d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" 
          />
        </svg>
      </motion.button>
    </form>
  );
};

export default ChatInput;