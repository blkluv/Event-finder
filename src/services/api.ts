import axios from 'axios';
import type { User, Event, Notification, Stats, UserPreferences } from '../types';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor if needed
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// Users
export const getUsers = async (): Promise<User[]> => {
  const response = await api.get('/users');
  return response.data;
};

export const getUser = async (id: string): Promise<User> => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const updateUserPreferences = async (
  id: string, 
  preferences: Partial<UserPreferences>
): Promise<User> => {
  const response = await api.patch(`/users/${id}/preferences`, preferences);
  return response.data;
};

// Events
export const getEvents = async (
  filters?: { type?: string; location?: string; minPrice?: number; maxPrice?: number }
): Promise<Event[]> => {
  const response = await api.get('/events', { params: filters });
  return response.data;
};

export const getEvent = async (id: string): Promise<Event> => {
  const response = await api.get(`/events/${id}`);
  return response.data;
};

// Notifications
export const getNotifications = async (userId?: string): Promise<Notification[]> => {
  const response = await api.get('/notifications', { 
    params: userId ? { userId } : undefined 
  });
  return response.data;
};

export const sendManualNotification = async (
  userId: string, 
  eventId: string
): Promise<Notification> => {
  const response = await api.post('/notifications/manual', { userId, eventId });
  return response.data;
};

// Dashboard Stats
export const getStats = async (): Promise<Stats> => {
  const response = await api.get('/stats');
  return response.data;
};

// Health Check
export const healthCheck = async (): Promise<{ status: string }> => {
  const response = await api.get('/health');
  return response.data;
};

export default api;