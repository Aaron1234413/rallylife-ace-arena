import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Play, 
  Trophy, 
  ShoppingBag,
  MessageSquare,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: Play, label: 'Play', path: '/play' },
  { icon: Trophy, label: 'Leaderboards', path: '/leaderboards' },
  { icon: ShoppingBag, label: 'Store', path: '/store' },
  { icon: User, label: 'Profile', path: '/profile' }
];

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-tennis-green-bg/20 md:hidden z-40">
      <div className="grid grid-cols-5 py-3">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                "flex flex-col items-center py-1 px-1 transition-colors relative",
                isActive 
                  ? "text-tennis-green-primary" 
                  : "text-tennis-green-medium hover:text-tennis-green-primary"
              )}
            >
              <Icon className={cn(
                "h-6 w-6",
                isActive && "text-tennis-green-primary"
              )} />
              {isActive && (
                <div className="w-1 h-1 bg-tennis-green-primary rounded-full mt-1" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}