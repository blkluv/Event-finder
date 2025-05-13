import React from 'react';
import { Link } from 'react-router-dom';
import { User, MessageCircle, Calendar } from 'lucide-react';
import type { User as UserType } from '../types';

interface UserCardProps {
  user: UserType;
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
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

  return (
    <div className="card hover:shadow-md group">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-primary-100 text-primary-700 p-3 rounded-full">
            <User size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-gray-500 text-sm">@{user.username || 'unknown'}</p>
          </div>
        </div>
        <Link 
          to={`/users/${user.id}`}
          className="text-sm text-primary-600 hover:text-primary-800 font-medium"
        >
          View Details
        </Link>
      </div>
      
      <div className="mt-4 border-t border-gray-100 pt-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <MessageCircle size={16} className="text-secondary-500" />
            <span>Preferences: {user.preferences.eventTypes.join(', ') || 'None'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar size={16} className="text-secondary-500" />
            <span>Updates: {user.preferences.frequency}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500 flex justify-between">
        <span>Joined: {formatDate(user.createdAt)}</span>
        <span>Last active: {formatDate(user.lastActive)}</span>
      </div>
    </div>
  );
};

export default UserCard;