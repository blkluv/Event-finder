import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Calendar, Tag } from 'lucide-react';

function UserDetails() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    telegramId: '',
    preferences: {
      eventTypes: [],
      location: '',
      maxDistance: '',
      budget: {
        min: '',
        max: ''
      },
      keywords: [],
      frequency: 'daily'
    }
  });

  const eventTypeOptions = [
    'concert', 'conference', 'festival', 'workshop', 
    'sports', 'art', 'food', 'theater'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleEventTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        eventTypes: prev.preferences.eventTypes.includes(type)
          ? prev.preferences.eventTypes.filter(t => t !== type)
          : [...prev.preferences.eventTypes, type]
      }
    }));
  };

  const handleKeywordsChange = (e) => {
    const keywords = e.target.value.split(',').map(k => k.trim()).filter(Boolean);
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        keywords
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Form submitted:', formData);
    navigate('/users'); // Redirect to users page after submission
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
        <p className="text-gray-600">Enter your information to get started</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <User className="mr-2" /> Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telegram ID
              </label>
              <input
                type="text"
                name="telegramId"
                value={formData.telegramId}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Calendar className="mr-2" /> Event Preferences
          </h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Types
            </label>
            <div className="flex flex-wrap gap-2">
              {eventTypeOptions.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleEventTypeChange(type)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    formData.preferences.eventTypes.includes(type)
                      ? 'bg-primary-100 text-primary-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center">
                  <MapPin size={16} className="mr-1" /> Location
                </div>
              </label>
              <input
                type="text"
                name="preferences.location"
                value={formData.preferences.location}
                onChange={handleChange}
                className="input"
                placeholder="Enter city"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Distance (km)
              </label>
              <input
                type="number"
                name="preferences.maxDistance"
                value={formData.preferences.maxDistance}
                onChange={handleChange}
                className="input"
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center">
                  <Tag size={16} className="mr-1" /> Min Budget ($)
                </div>
              </label>
              <input
                type="number"
                name="preferences.budget.min"
                value={formData.preferences.budget.min}
                onChange={handleChange}
                className="input"
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center">
                  <Tag size={16} className="mr-1" /> Max Budget ($)
                </div>
              </label>
              <input
                type="number"
                name="preferences.budget.max"
                value={formData.preferences.budget.max}
                onChange={handleChange}
                className="input"
                min="0"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Keywords (comma-separated)
              </label>
              <input
                type="text"
                value={formData.preferences.keywords.join(', ')}
                onChange={handleKeywordsChange}
                className="input"
                placeholder="e.g., jazz, rock, tech, family"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notification Frequency
              </label>
              <select
                name="preferences.frequency"
                value={formData.preferences.frequency}
                onChange={handleChange}
                className="input"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="off">Off</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/users')}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Save User Details
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserDetails;