import React, { useEffect, useState } from 'react';
import { getEvents } from '../services/api';
import EventCard from '../components/EventCard';
import { Search, Filter, MapPin, Tag } from 'lucide-react';
import type { Event } from '../types';

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filters, setFilters] = useState({
    type: '',
    location: '',
    minPrice: '',
    maxPrice: ''
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await getEvents();
        setEvents(data);
      } catch (err) {
        setError('Failed to load events');
        console.error(err);
        // If API is unavailable, use mock data for development
        setEvents(mockEvents);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const filterParams = {
        type: filters.type || undefined,
        location: filters.location || undefined,
        minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined
      };
      
      // In a real implementation, we would use these filters in the API call
      // For now, we'll just filter the mock data
      const data = await getEvents(filterParams);
      setEvents(data);
    } catch (err) {
      console.error(err);
      // Filter mock data for development
      const filtered = mockEvents.filter(event => {
        const matchesType = !filters.type || event.type === filters.type;
        const matchesLocation = !filters.location || event.location.toLowerCase().includes(filters.location.toLowerCase());
        const matchesMinPrice = !filters.minPrice || (event.price !== undefined && event.price >= Number(filters.minPrice));
        const matchesMaxPrice = !filters.maxPrice || (event.price !== undefined && event.price <= Number(filters.maxPrice));
        
        return matchesType && matchesLocation && matchesMinPrice && matchesMaxPrice;
      });
      setEvents(filtered);
    } finally {
      setLoading(false);
    }
  };

  // Filter events based on search term
  const filteredEvents = events.filter(event => 
    searchTerm === '' || 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>{error}</p>
        <button 
          className="mt-2 btn btn-primary"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Events</h1>
        <p className="text-gray-600">Browse and manage events</p>
      </div>

      {/* Search and filters */}
      <div className="card mb-6">
        <form onSubmit={handleSearch}>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="input pl-10"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button type="submit" className="btn btn-primary">
              Apply Filters
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
              <select
                name="type"
                className="input"
                value={filters.type}
                onChange={handleFilterChange}
              >
                <option value="">All Types</option>
                <option value="concert">Concert</option>
                <option value="conference">Conference</option>
                <option value="festival">Festival</option>
                <option value="workshop">Workshop</option>
                <option value="sports">Sports</option>
                <option value="art">Art & Culture</option>
                <option value="food">Food & Drink</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center">
                  <MapPin size={16} className="mr-1" />
                  Location
                </div>
              </label>
              <input
                type="text"
                name="location"
                className="input"
                placeholder="Enter city"
                value={filters.location}
                onChange={handleFilterChange}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center">
                  <Tag size={16} className="mr-1" />
                  Min Price
                </div>
              </label>
              <input
                type="number"
                name="minPrice"
                min="0"
                className="input"
                placeholder="$ Min"
                value={filters.minPrice}
                onChange={handleFilterChange}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center">
                  <Tag size={16} className="mr-1" />
                  Max Price
                </div>
              </label>
              <input
                type="number"
                name="maxPrice"
                min="0"
                className="input"
                placeholder="$ Max"
                value={filters.maxPrice}
                onChange={handleFilterChange}
              />
            </div>
          </div>
        </form>
      </div>

      {/* Events grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-gray-500">
            No events found matching your criteria
          </div>
        )}
      </div>
    </div>
  );
};

// Mock data for development when API is not available
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Tech Innovation Summit 2025',
    description: 'Join industry leaders for a two-day conference on the latest tech innovations and future trends. Featuring keynotes, workshops, and networking opportunities.',
    type: 'conference',
    location: 'San Francisco',
    venue: 'Moscone Center',
    startDate: '2025-02-15T09:00:00Z',
    endDate: '2025-02-16T18:00:00Z',
    price: 299,
    imageUrl: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    url: 'https://example.com/tech-summit',
    tags: ['tech', 'innovation', 'ai', 'conference'],
    source: 'mock'
  },
  {
    id: '2',
    title: 'Summer Jazz Festival',
    description: 'An outdoor jazz festival featuring world-renowned artists and local talents. Food trucks, art installations, and family-friendly activities available.',
    type: 'festival',
    location: 'New York',
    venue: 'Central Park',
    startDate: '2025-06-20T16:00:00Z',
    endDate: '2025-06-22T23:00:00Z',
    price: 45,
    imageUrl: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    url: 'https://example.com/jazz-festival',
    tags: ['music', 'jazz', 'festival', 'outdoor', 'family'],
    source: 'mock'
  },
  {
    id: '3',
    title: 'Intro to Python Programming Workshop',
    description: 'A beginner-friendly workshop to learn Python programming fundamentals. No prior coding experience required. Bring your laptop!',
    type: 'workshop',
    location: 'Chicago',
    venue: 'Public Library - Downtown Branch',
    startDate: '2025-03-10T10:00:00Z',
    endDate: '2025-03-10T16:00:00Z',
    price: 0,
    imageUrl: 'https://images.pexels.com/photos/1181359/pexels-photo-1181359.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    url: 'https://example.com/python-workshop',
    tags: ['programming', 'python', 'workshop', 'beginners', 'free'],
    source: 'mock'
  },
  {
    id: '4',
    title: 'Urban Street Food Festival',
    description: 'Celebrate diverse cuisines from around the world at this urban street food festival. Over 50 food vendors, live music, and cooking demonstrations.',
    type: 'food',
    location: 'Austin',
    venue: 'Waterfront Park',
    startDate: '2025-04-05T11:00:00Z',
    endDate: '2025-04-07T22:00:00Z',
    price: 15,
    imageUrl: 'https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    url: 'https://example.com/food-festival',
    tags: ['food', 'festival', 'culinary', 'street food'],
    source: 'mock'
  },
  {
    id: '5',
    title: 'NBA Finals Game 1',
    description: 'Watch the exciting NBA Finals Game 1 live at the arena. Don\'t miss this championship series opener!',
    type: 'sports',
    location: 'Los Angeles',
    venue: 'Staples Center',
    startDate: '2025-06-03T19:30:00Z',
    price: 175,
    imageUrl: 'https://images.pexels.com/photos/1786706/pexels-photo-1786706.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    url: 'https://example.com/nba-finals',
    tags: ['sports', 'basketball', 'nba', 'finals'],
    source: 'mock'
  },
  {
    id: '6',
    title: 'Contemporary Art Exhibition',
    description: 'Explore groundbreaking works by emerging artists in this contemporary art exhibition featuring installations, paintings, and digital art.',
    type: 'art',
    location: 'Miami',
    venue: 'Modern Art Museum',
    startDate: '2025-03-15T10:00:00Z',
    endDate: '2025-05-30T18:00:00Z',
    price: 22,
    imageUrl: 'https://images.pexels.com/photos/20967/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    url: 'https://example.com/art-exhibition',
    tags: ['art', 'exhibition', 'contemporary', 'museum'],
    source: 'mock'
  }
];

export default Events;