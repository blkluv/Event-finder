import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Tag, ExternalLink } from 'lucide-react';
import type { Event } from '../types';

interface EventCardProps {
  event: Event;
  onSelect?: (event: Event) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onSelect }) => {
  // Format date for better readability
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="card hover:shadow-md overflow-hidden group">
      {/* Event image */}
      <div className="h-40 -mx-6 -mt-6 mb-4 bg-gray-200 relative overflow-hidden">
        <img 
          src={event.imageUrl || 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940'} 
          alt={event.title} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-0 right-0 m-2 bg-white rounded-full px-2 py-1 text-xs font-medium text-primary-700">
          {event.source === 'eventbrite' ? 'Eventbrite' : 'Local Event'}
        </div>
      </div>
      
      {/* Event details */}
      <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
      <p className="text-gray-600 text-sm mb-4">{truncateText(event.description, 120)}</p>
      
      {/* Event metadata */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center text-gray-500">
          <Calendar size={16} className="mr-2 text-secondary-500" />
          <span>{formatDate(event.startDate)}</span>
        </div>
        <div className="flex items-center text-gray-500">
          <MapPin size={16} className="mr-2 text-secondary-500" />
          <span>{event.location} {event.venue ? `(${event.venue})` : ''}</span>
        </div>
        {event.price !== undefined && (
          <div className="flex items-center text-gray-500">
            <Tag size={16} className="mr-2 text-secondary-500" />
            <span>{event.price === 0 ? 'Free' : `$${event.price.toFixed(2)}`}</span>
          </div>
        )}
      </div>
      
      {/* Actions */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
        <Link to={`/events/${event.id}`} className="text-primary-600 hover:text-primary-800 text-sm font-medium">
          View Details
        </Link>
        {event.url && (
          <a 
            href={event.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-gray-500 hover:text-gray-700 flex items-center text-sm"
          >
            <ExternalLink size={14} className="mr-1" />
            Source
          </a>
        )}
        {onSelect && (
          <button 
            onClick={() => onSelect(event)} 
            className="btn-outline text-xs py-1 px-3 ml-2"
          >
            Select
          </button>
        )}
      </div>
    </div>
  );
};

export default EventCard;