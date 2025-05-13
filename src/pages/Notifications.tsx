import React, { useEffect, useState } from 'react';
import { getNotifications, getUsers, getEvents, sendManualNotification } from '../services/api';
import { Search, Send, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { Notification, User, Event } from '../types';

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filter, setFilter] = useState<string>('all');
  
  // For sending new notifications
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [sendingNotification, setSendingNotification] = useState<boolean>(false);
  const [showNewNotification, setShowNewNotification] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [notificationsData, usersData, eventsData] = await Promise.all([
          getNotifications(),
          getUsers(),
          getEvents()
        ]);
        
        setNotifications(notificationsData);
        setUsers(usersData);
        setEvents(eventsData);
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
        // If API is unavailable, use mock data for development
        setNotifications(mockNotifications);
        setUsers(mockUsers);
        setEvents(mockEvents);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to get user data by ID
  const getUserById = (id: string): User | undefined => {
    return users.find(user => user.id === id);
  };

  // Function to get event data by ID
  const getEventById = (id: string): Event | undefined => {
    return events.find(event => event.id === id);
  };

  // Handle sending a new notification
  const handleSendNotification = async () => {
    if (!selectedUser || !selectedEvent) {
      return;
    }

    try {
      setSendingNotification(true);
      const newNotification = await sendManualNotification(selectedUser, selectedEvent);
      
      // Add the new notification to the list
      setNotifications(prev => [newNotification, ...prev]);
      
      // Reset the form
      setSelectedUser('');
      setSelectedEvent('');
      setShowNewNotification(false);
    } catch (err) {
      console.error('Failed to send notification:', err);
      // Mock the response for development
      const mockNewNotification: Notification = {
        id: `mock-${Date.now()}`,
        userId: selectedUser,
        eventId: selectedEvent,
        sentAt: new Date().toISOString(),
        status: 'sent',
        type: 'manual'
      };
      setNotifications(prev => [mockNewNotification, ...prev]);
      setSelectedUser('');
      setSelectedEvent('');
      setShowNewNotification(false);
    } finally {
      setSendingNotification(false);
    }
  };

  // Filter notifications based on search term and filter selection
  const filteredNotifications = notifications.filter(notification => {
    const user = getUserById(notification.userId);
    const event = getEventById(notification.eventId);
    
    if (!user || !event) return false;
    
    const matchesSearch = 
      searchTerm === '' || 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      event.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'auto' && notification.type === 'auto') ||
      (filter === 'manual' && notification.type === 'manual') ||
      (filter === 'pending' && notification.status === 'pending') ||
      (filter === 'sent' && notification.status === 'sent') ||
      (filter === 'failed' && notification.status === 'failed');
    
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

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'failed':
        return <XCircle size={16} className="text-red-500" />;
      case 'pending':
        return <Clock size={16} className="text-amber-500" />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">View and manage event notifications</p>
        </div>
        <button 
          className="btn btn-primary flex items-center space-x-2"
          onClick={() => setShowNewNotification(!showNewNotification)}
        >
          <Send size={16} />
          <span>New Notification</span>
        </button>
      </div>

      {/* New Notification Form */}
      {showNewNotification && (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Send Manual Notification</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select User
              </label>
              <select
                className="input"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">Choose a user</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} (@{user.username})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Event
              </label>
              <select
                className="input"
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
              >
                <option value="">Choose an event</option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button 
              className="btn btn-outline mr-2"
              onClick={() => setShowNewNotification(false)}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary flex items-center space-x-2"
              onClick={handleSendNotification}
              disabled={!selectedUser || !selectedEvent || sendingNotification}
            >
              {sendingNotification ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send size={16} />
              )}
              <span>Send Notification</span>
            </button>
          </div>
        </div>
      )}

      {/* Search and filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="input pl-10"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center">
          <select
            className="input max-w-[200px]"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Notifications</option>
            <option value="auto">Automatic</option>
            <option value="manual">Manual</option>
            <option value="pending">Pending</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Notifications table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 card">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Event
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map(notification => {
                const user = getUserById(notification.userId);
                const event = getEventById(notification.eventId);
                
                if (!user || !event) return null;
                
                return (
                  <tr key={notification.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(notification.status)}
                        <span className="ml-2 text-sm capitalize">
                          {notification.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            @{user.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{event.title}</div>
                      <div className="text-xs text-gray-500">{event.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(notification.sentAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        notification.type === 'auto' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {notification.type}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No notifications found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
  }
];

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Tech Innovation Summit 2025',
    description: 'Join industry leaders for a two-day conference on the latest tech innovations and future trends.',
    type: 'conference',
    location: 'San Francisco',
    venue: 'Moscone Center',
    startDate: '2025-02-15T09:00:00Z',
    endDate: '2025-02-16T18:00:00Z',
    price: 299,
    url: 'https://example.com/tech-summit',
    tags: ['tech', 'innovation', 'ai', 'conference'],
    source: 'mock'
  },
  {
    id: '2',
    title: 'Summer Jazz Festival',
    description: 'An outdoor jazz festival featuring world-renowned artists and local talents.',
    type: 'festival',
    location: 'New York',
    venue: 'Central Park',
    startDate: '2025-06-20T16:00:00Z',
    endDate: '2025-06-22T23:00:00Z',
    price: 45,
    url: 'https://example.com/jazz-festival',
    tags: ['music', 'jazz', 'festival', 'outdoor', 'family'],
    source: 'mock'
  }
];

const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '1',
    eventId: '2',
    sentAt: '2025-01-06T09:15:00Z',
    status: 'sent',
    type: 'auto'
  },
  {
    id: '2',
    userId: '2',
    eventId: '1',
    sentAt: '2025-01-06T10:30:00Z',
    status: 'sent',
    type: 'auto'
  },
  {
    id: '3',
    userId: '1',
    eventId: '1',
    sentAt: '2025-01-07T08:45:00Z',
    status: 'failed',
    type: 'manual'
  },
  {
    id: '4',
    userId: '2',
    eventId: '2',
    sentAt: '2025-01-07T14:20:00Z',
    status: 'pending',
    type: 'auto'
  }
];

export default Notifications;