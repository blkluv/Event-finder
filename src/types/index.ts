export interface User {
  id: string;
  telegramId: number;
  username: string;
  firstName: string;
  lastName?: string;
  createdAt: string;
  preferences: UserPreferences;
  lastActive: string;
}

export interface UserPreferences {
  eventTypes: string[];
  location?: string;
  maxDistance?: number;
  budget?: {
    min?: number;
    max?: number;
  };
  keywords?: string[];
  frequency: "daily" | "hourly" | "off";
}

export interface Event {
  id: string;
  title: string;
  description: string;
  type: string;
  location: string;
  venue?: string;
  startDate: string;
  endDate?: string;
  price?: number;
  imageUrl?: string;
  url?: string;
  tags: string[];
  source: "mock" | "eventbrite";
}

export interface Notification {
  id: string;
  userId: string;
  eventId: string;
  sentAt: string;
  status: "pending" | "sent" | "failed";
  type: "auto" | "manual";
}

export interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalEvents: number;
  totalNotifications: number;
  usersPerDay: DailyCount[];
  notificationsPerDay: DailyCount[];
}

interface DailyCount {
  date: string;
  count: number;
}