
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


export function AppNavigation() {
  const { signOut, user } = useAuth();
  const location = useLocation();

  // MVP navigation items only
  const mvpNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/play', label: 'Play', icon: Play },
    { path: '/leaderboards', label: 'Leaderboards', icon: Trophy },
    { path: '/store', label: 'Store', icon: ShoppingBag },
    { path: '/messages', label: 'Messages', icon: MessageSquare },
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
            <Link 
              to="/dashboard" 
              className="text-lg sm:text-xl font-bold text-tennis-green-dark hover:text-tennis-green-primary transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-tennis-green-primary focus:ring-offset-2 rounded-lg px-2 py-1"
              aria-label="Go to Dashboard - Rako Tennis App"
            >
              🎾 <span className="font-orbitron">Rako</span>
            </Link>
          </div>

          {/* Desktop Navigation Links - Enhanced UX */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {allNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  aria-label={`Navigate to ${item.label}`}
                  className={`min-w-[44px] min-h-[44px] px-3 xl:px-4 py-2.5 rounded-xl text-xs xl:text-sm font-medium transition-all duration-300 flex items-center justify-center gap-1 xl:gap-2 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-tennis-green-primary focus:ring-offset-1 ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-tennis-green-primary to-tennis-green-medium text-white shadow-lg shadow-tennis-green-primary/25 scale-105'
                      : 'text-gray-600 hover:text-tennis-green-dark hover:bg-gradient-to-r hover:from-tennis-green-bg/40 hover:to-tennis-green-subtle/30 hover:shadow-lg active:shadow-sm'
                  }`}
                >
                  <Icon className="h-4 w-4 xl:h-5 xl:w-5 flex-shrink-0" />
                  <span className="hidden xl:inline whitespace-nowrap">{item.label}</span>
                  <span className="xl:hidden whitespace-nowrap">{item.label.substring(0, 4)}</span>
                </Link>
              );
            })}
          </div>

          {/* Medium Screen Navigation - Enhanced Touch Targets */}
          <div className="hidden md:flex lg:hidden items-center space-x-2">
            {allNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  aria-label={`Navigate to ${item.label}`}
                  className={`min-w-[48px] min-h-[48px] p-3 rounded-xl transition-all duration-300 flex items-center justify-center transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-tennis-green-primary focus:ring-offset-1 ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-tennis-green-primary to-tennis-green-medium text-white shadow-lg shadow-tennis-green-primary/25 scale-105'
                      : 'text-gray-600 hover:text-tennis-green-dark hover:bg-gradient-to-r hover:from-tennis-green-bg/40 hover:to-tennis-green-subtle/30 hover:shadow-lg active:shadow-sm'
                  }`}
                  title={item.label}
                >
                  <Icon className="h-5 w-5" />
                </Link>
              );
            })}
          </div>

          {/* Desktop Actions - Enhanced Interactions */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            <div className="transform hover:scale-105 transition-transform duration-200">
              <NotificationCenter />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              aria-label="Sign out of your account"
              className="min-w-[44px] min-h-[44px] text-red-600 hover:text-red-700 hover:bg-red-50 hover:shadow-lg active:shadow-sm transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 px-3 lg:px-4 rounded-xl"
            >
              <LogOut className="h-4 w-4 lg:mr-2 flex-shrink-0" />
              <span className="hidden lg:inline whitespace-nowrap">Sign Out</span>
            </Button>
          </div>

          {/* Mobile Actions - Enhanced Touch Experience */}
          <div className="md:hidden flex items-center gap-3 flex-shrink-0">
            <div className="transform hover:scale-105 active:scale-95 transition-transform duration-200">
              <NotificationCenter />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              aria-label="Sign out of your account"
              className="min-w-[44px] min-h-[44px] text-red-600 hover:text-red-700 hover:bg-red-50 active:bg-red-100 p-3 hover:shadow-lg active:shadow-sm transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 rounded-xl"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
