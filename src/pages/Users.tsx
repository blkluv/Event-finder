import React, { useEffect, useState } from 'react';
import { getUsers } from '../services/api';
import UserCard from '../components/UserCard';
import { Search, Filter } from 'lucide-react';
import type { User } from '../types';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await getUsers();
        setUsers(data);
      } catch (err) {
        setError('Failed to load users');
        console.error(err);
        // If API is unavailable, use mock data for development
        setUsers(mockUsers);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search term and filter selection
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      searchTerm === '' || 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'daily' && user.preferences.frequency === 'daily') ||
      (filter === 'hourly' && user.preferences.frequency === 'hourly') ||
      (filter === 'off' && user.preferences.frequency === 'off');
    
    return matchesSearch && matchesFilter;
  });

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
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-600">Manage users and their preferences</p>
      </div>

      {/* Search and filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="input pl-10"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center">
          <Filter size={18} className="text-gray-400 mr-2" />
          <select
            className="input max-w-[200px]"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Users</option>
            <option value="daily">Daily Updates</option>
            <option value="hourly">Hourly Updates</option>
            <option value="off">Updates Off</option>
          </select>
        </div>
      </div>

      {/* User cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.length > 0 ? (
          filteredUsers.map(user => (
            <UserCard key={user.id} user={user} />
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-gray-500">
            No users found matching your criteria
          </div>
        )}
      </div>
    </div>
  );
};

// Mock data for development when API is not available
const mockUsers: User[] = [
  {
    id: '1',
    telegramId: 12345678,
    username: 'johndoe',
    firstName: 'John',
    lastName: 'Doe',
    createdAt: '2025-01-01T12:00:00Z',
    lastActive: '2025-01-07T14:35:00Z',
    preferences: {
      eventTypes: ['concert', 'theater'],
      location: 'New York',
      maxDistance: 25,
      budget: {
        max: 100
      },
      keywords: ['jazz', 'broadway'],
      frequency: 'daily'
    }
  },
  {
    id: '2',
    telegramId: 87654321,
    username: 'janesmith',
    firstName: 'Jane',
    lastName: 'Smith',
    createdAt: '2025-01-02T15:20:00Z',
    lastActive: '2025-01-07T10:15:00Z',
    preferences: {
      eventTypes: ['workshop', 'conference'],
      location: 'San Francisco',
      maxDistance: 15,
      budget: {
        max: 200
      },
      keywords: ['tech', 'ai', 'startup'],
      frequency: 'hourly'
    }
  },
  {
    id: '3',
    telegramId: 23456789,
    username: 'michaelj',
    firstName: 'Michael',
    lastName: 'Johnson',
    createdAt: '2025-01-03T09:45:00Z',
    lastActive: '2025-01-06T21:30:00Z',
    preferences: {
      eventTypes: ['sports', 'outdoor'],
      location: 'Chicago',
      maxDistance: 30,
      budget: {
        max: 75
      },
      keywords: ['basketball', 'football', 'baseball'],
      frequency: 'daily'
    }
  },
  {
    id: '4',
    telegramId: 34567890,
    username: 'sarahw',
    firstName: 'Sarah',
    lastName: 'Williams',
    createdAt: '2025-01-03T14:20:00Z',
    lastActive: '2025-01-07T09:10:00Z',
    preferences: {
      eventTypes: ['art', 'exhibition'],
      location: 'Los Angeles',
      maxDistance: 20,
      budget: {
        max: 150
      },
      keywords: ['gallery', 'contemporary', 'photography'],
      frequency: 'off'
    }
  },
  {
    id: '5',
    telegramId: 45678901,
    username: 'davidb',
    firstName: 'David',
    lastName: 'Brown',
    createdAt: '2025-01-04T10:30:00Z',
    lastActive: '2025-01-07T13:45:00Z',
    preferences: {
      eventTypes: ['food', 'festival'],
      location: 'Austin',
      maxDistance: 35,
      budget: {
        min: 25,
        max: 120
      },
      keywords: ['bbq', 'craft beer', 'tasting'],
      frequency: 'hourly'
    }
  }
];

export default Users;