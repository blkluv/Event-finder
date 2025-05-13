import EventCard from './EventCard';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const EventList = ({ events }) => {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full"
    >
      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </motion.div>
  );
};

export default EventList;