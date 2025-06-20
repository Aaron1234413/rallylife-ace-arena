
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  MessageSquare, 
  Rss,
  LogOut,
  Calendar,
  MapPin,
  Search,
  User,
  Bolt,
  Users
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function AppNavigation() {
  const { signOut, user } = useAuth();
  const location = useLocation();

  // Basic navigation items available to all users
  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/pulse', label: 'Pulse', icon: Bolt },
    { path: '/start-social-play', label: 'Social Play', icon: Users },
    { path: '/search', label: 'Search', icon: Search },
    { path: '/messages', label: 'Messages', icon: MessageSquare },
    { path: '/scheduling', label: 'Scheduling', icon: Calendar },
    { path: '/maps', label: 'Maps', icon: MapPin },
    { path: '/feed', label: 'Feed', icon: Rss },
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
              🎾 RallyLife
            </Link>
          </div>

          {/* Navigation Links */}
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

          {/* Sign Out Button */}
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

        {/* Mobile Navigation */}
        <div className="md:hidden pb-3 pt-2">
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                    isActive(item.path)
                      ? 'bg-tennis-green-light text-white'
                      : 'text-gray-600 hover:text-tennis-green-dark hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
