import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Events from './pages/Events';
import Notifications from './pages/Notifications';
import UserDetail from './pages/UserDetail';
import EventDetail from './pages/EventDetail';
import Layout from './components/Layout';
import { Bot } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* App header - visible on all pages */}
        <header className="bg-primary-800 text-white shadow-md">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot size={32} className="text-accent-400" />
              <div>
                <h1 className="text-xl font-bold">AI Event Assistant</h1>
                <p className="text-xs text-primary-200">Admin Dashboard</p>
              </div>
            </div>
          </div>
        </header>

        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/users/:id" element={<UserDetail />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/notifications" element={<Notifications />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  );
}

export default App;