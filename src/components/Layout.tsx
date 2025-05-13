import React, { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, Bell, Settings } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md hidden md:block">
        <div className="p-4">
          <nav className="mt-8 space-y-1">
            <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
            <NavItem to="/users" icon={<Users size={20} />} label="Users" />
            <NavItem to="/events" icon={<Calendar size={20} />} label="Events" />
            <NavItem to="/notifications" icon={<Bell size={20} />} label="Notifications" />
            <div className="border-t border-gray-200 my-4"></div>
            <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" />
          </nav>
        </div>
      </aside>

      {/* Mobile navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg md:hidden z-10">
        <div className="grid grid-cols-4 p-2">
          <MobileNavItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <MobileNavItem to="/users" icon={<Users size={20} />} label="Users" />
          <MobileNavItem to="/events" icon={<Calendar size={20} />} label="Events" />
          <MobileNavItem to="/notifications" icon={<Bell size={20} />} label="Notifications" />
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

interface NavItemProps {
  to: string;
  icon: ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${
          isActive
            ? 'bg-primary-50 text-primary-600'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`
      }
    >
      {icon}
      <span className="font-medium">{label}</span>
    </NavLink>
  );
};

const MobileNavItem: React.FC<NavItemProps> = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center py-2 text-xs ${
          isActive ? 'text-primary-600' : 'text-gray-500'
        }`
      }
    >
      {icon}
      <span className="mt-1">{label}</span>
    </NavLink>
  );
};

export default Layout;