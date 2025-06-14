
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Trophy, 
  Activity, 
  MessageSquare, 
  Target,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const playerNavItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/activities', icon: Activity, label: 'Activities' },
  { to: '/achievements', icon: Trophy, label: 'Achievements' },
  { to: '/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/scheduling', icon: Calendar, label: 'Lessons' },
  { to: '/leaderboards', icon: BarChart3, label: 'Leaderboards' }
];

const coachNavItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/activities', icon: Activity, label: 'Activities' },
  { to: '/achievements', icon: Trophy, label: 'Achievements' },
  { to: '/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/scheduling', icon: Calendar, label: 'Schedule' },
  { to: '/leaderboards', icon: BarChart3, label: 'Leaderboards' }
];

export function AppNavigation() {
  const location = useLocation();
  const { user } = useAuth();
  
  const isCoach = user?.user_metadata?.role === 'coach';
  const navItems = isCoach ? coachNavItems : playerNavItems;

  return (
    <nav className="bg-white border-r border-gray-200 w-64 min-h-screen p-4">
      <div className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                isActive 
                  ? "bg-tennis-green-light text-tennis-green-dark" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
