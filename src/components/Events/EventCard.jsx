import { motion } from 'framer-motion';
import { useChat } from '../../context/ChatContext';

const EventCard = ({ event }) => {
  const { showEventDetails } = useChat();
  
  // Format date
  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Format time
  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString('en-US', options);
  };

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      {/* Event image */}
      <div className="h-32 w-full overflow-hidden">
        <img 
          src={event.image} 
          alt={event.title} 
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Event content */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-gray-900 mb-1 text-md line-clamp-1">{event.title}</h3>
            <p className="text-gray-500 text-xs mb-2">{event.venue}, {event.location}</p>
          </div>
          
          <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
            {event.category}
          </span>
        </div>
        
        <div className="flex justify-between items-center mt-3">
          <div className="text-xs">
            <p className="font-semibold">{formatDate(event.date)}</p>
            <p>{formatTime(event.date)}</p>
          </div>
          
          <motion.button
            onClick={() => showEventDetails(event.id)}
            className="text-xs text-primary-600 hover:text-primary-800 font-medium"
            whileTap={{ scale: 0.95 }}
          >
            View details
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default EventCard;