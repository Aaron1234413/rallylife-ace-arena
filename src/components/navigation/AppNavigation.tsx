
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  MessageSquare, 
  Rss,
  LogOut,
  Search,
  User,
  Bolt,
  Store
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function AppNavigation() {
  const { signOut, user } = useAuth();
  const location = useLocation();

  // Basic navigation items available to all users
  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/pulse', label: 'Pulse', icon: Bolt },
    { path: '/search', label: 'Search', icon: Search },
    { path: '/messages', label: 'Messages', icon: MessageSquare },
    { path: '/feed', label: 'Feed', icon: Rss },
    { path: '/store', label: 'Store', icon: Store },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-tennis-green-dark">
              🎾 Rako
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                    isActive(item.path)
                      ? 'bg-tennis-green-light text-white'
                      : 'text-gray-600 hover:text-tennis-green-dark hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop Sign Out Button */}
          <div className="hidden md:block">
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>

          {/* Mobile Sign Out Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation - Grid Layout */}
        <div className="md:hidden pb-3 pt-2">
          <div className="grid grid-cols-4 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg text-xs font-medium transition-colors min-h-[60px] ${
                    isActive(item.path)
                      ? 'bg-tennis-green-light text-white'
                      : 'text-gray-600 hover:text-tennis-green-dark hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4 mb-1" />
                  <span className="text-center leading-tight">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
