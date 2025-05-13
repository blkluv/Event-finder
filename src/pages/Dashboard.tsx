import React, { useEffect, useState } from 'react';
import { getStats } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatsCard from '../components/StatsCard';
import { Users, Calendar, Bell, MessageCircle } from 'lucide-react';
import type { Stats } from '../types';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getStats();
        setStats(data);
      } catch (err) {
        setError('Failed to load dashboard stats');
        console.error(err);
        // If API is unavailable, use mock data for development
        setStats(mockStats);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your AI Event Assistant</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard 
          title="Total Users" 
          value={stats?.totalUsers || 0} 
          change={{ value: 8.2, type: 'increase' }}
          icon={<Users size={20} />}
          color="primary"
        />
        <StatsCard 
          title="Active Users" 
          value={stats?.activeUsers || 0} 
          change={{ value: 5.1, type: 'increase' }}
          icon={<MessageCircle size={20} />}
          color="secondary"
        />
        <StatsCard 
          title="Total Events" 
          value={stats?.totalEvents || 0} 
          change={{ value: 12.5, type: 'increase' }}
          icon={<Calendar size={20} />}
          color="accent"
        />
        <StatsCard 
          title="Notifications Sent" 
          value={stats?.totalNotifications || 0} 
          change={{ value: 3.2, type: 'increase' }}
          icon={<Bell size={20} />}
          color="success"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-medium mb-4">User Growth</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={stats?.usersPerDay || []}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#6d28d9" 
                  activeDot={{ r: 8 }} 
                  name="Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-medium mb-4">Notification Activity</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={stats?.notificationsPerDay || []}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#0d9488" 
                  activeDot={{ r: 8 }}
                  name="Notifications"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mock data for development when API is not available
const mockStats: Stats = {
  totalUsers: 127,
  activeUsers: 84,
  totalEvents: 352,
  totalNotifications: 942,
  usersPerDay: [
    { date: '2025-01-01', count: 85 },
    { date: '2025-01-02', count: 93 },
    { date: '2025-01-03', count: 98 },
    { date: '2025-01-04', count: 105 },
    { date: '2025-01-05', count: 112 },
    { date: '2025-01-06', count: 120 },
    { date: '2025-01-07', count: 127 },
  ],
  notificationsPerDay: [
    { date: '2025-01-01', count: 120 },
    { date: '2025-01-02', count: 132 },
    { date: '2025-01-03', count: 145 },
    { date: '2025-01-04', count: 162 },
    { date: '2025-01-05', count: 180 },
    { date: '2025-01-06', count: 210 },
    { date: '2025-01-07', count: 234 },
  ],
};

export default Dashboard;