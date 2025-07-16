
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  MessageSquare, 
  Trophy,
  LogOut,
  ShoppingBag,
  Play,
  User
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { MessageCenter } from '@/components/messages/MessageCenter';


export function AppNavigation() {
  const { signOut, user } = useAuth();
  const location = useLocation();

  // MVP navigation items only
  const mvpNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/play', label: 'Play', icon: Play },
    { path: '/leaderboards', label: 'Leaderboards', icon: Trophy },
    { path: '/store', label: 'Store', icon: ShoppingBag },
    { path: '/profile', label: 'Profile', icon: User }
  ];

  const allNavItems = mvpNavItems;

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-white via-white/95 to-white backdrop-blur-md border-b border-tennis-green-light/30 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/dashboard" className="text-lg sm:text-xl font-bold text-tennis-green-dark hover:text-tennis-green-primary transition-all duration-300 hover:scale-105">
              🎾 <span className="font-orbitron">Rako</span>
            </Link>
          </div>

          {/* Desktop Navigation Links - Responsive Text */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {allNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-2 xl:px-3 py-2 rounded-xl text-xs xl:text-sm font-medium transition-all duration-300 flex items-center gap-1 xl:gap-2 transform hover:scale-105 ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-tennis-green-primary to-tennis-green-medium text-white shadow-lg shadow-tennis-green-primary/25'
                      : 'text-gray-600 hover:text-tennis-green-dark hover:bg-gradient-to-r hover:from-tennis-green-bg/30 hover:to-tennis-green-subtle/20 hover:shadow-md'
                  }`}
                >
                  <Icon className="h-3 w-3 xl:h-4 xl:w-4" />
                  <span className="hidden xl:inline">{item.label}</span>
                  <span className="xl:hidden">{item.label.substring(0, 4)}</span>
                </Link>
              );
            })}
          </div>

          {/* Medium Screen Navigation - Icons Only */}
          <div className="hidden md:flex lg:hidden items-center space-x-1">
            {allNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`p-2 rounded-xl transition-all duration-300 flex items-center justify-center transform hover:scale-105 ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-tennis-green-primary to-tennis-green-medium text-white shadow-lg shadow-tennis-green-primary/25'
                      : 'text-gray-600 hover:text-tennis-green-dark hover:bg-gradient-to-r hover:from-tennis-green-bg/30 hover:to-tennis-green-subtle/20 hover:shadow-md'
                  }`}
                  title={item.label}
                >
                  <Icon className="h-4 w-4" />
                </Link>
              );
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            <MessageCenter />
            <NotificationCenter />
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:shadow-md transition-all duration-300 hover:scale-105 px-2 lg:px-3"
            >
              <LogOut className="h-4 w-4 lg:mr-2" />
              <span className="hidden lg:inline">Sign Out</span>
            </Button>
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden flex items-center gap-1 flex-shrink-0">
            <MessageCenter />
            <NotificationCenter />
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 hover:shadow-md transition-all duration-300"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation - Improved Grid */}
        <div className="md:hidden pb-3 pt-2">
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {allNavItems.slice(0, 6).map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center justify-center p-2 sm:p-3 rounded-xl text-xs font-medium transition-all duration-300 min-h-[55px] sm:min-h-[60px] transform hover:scale-105 ${
                    isActive(item.path)
                      ? 'bg-gradient-to-b from-tennis-green-primary to-tennis-green-medium text-white shadow-lg shadow-tennis-green-primary/25'
                      : 'text-gray-600 hover:text-tennis-green-dark hover:bg-gradient-to-b hover:from-tennis-green-bg/30 hover:to-tennis-green-subtle/20 hover:shadow-md'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mb-0.5 sm:mb-1" />
                  <span className="text-center leading-tight text-[10px] sm:text-xs">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
