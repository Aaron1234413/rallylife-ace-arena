import React from 'react';
import {
  Home,
  Activity,
  Search,
  MessageCircle,
  MapPin,
  ShoppingBag,
  Users,
  Calendar,
  GraduationCap
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Academy', href: '/academy', icon: GraduationCap },
  { name: 'Pulse', href: '/pulse', icon: Activity },
  { name: 'Search', href: '/search', icon: Search },
  { name: 'Messages', href: '/messages', icon: MessageCircle },
  { name: 'Maps', href: '/maps', icon: MapPin },
  { name: 'Store', href: '/store', icon: ShoppingBag },
  { name: 'Feed', href: '/feed', icon: Users },
  { name: 'Schedule', href: '/scheduling', icon: Calendar },
];

export const AppNavigation: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <nav className="bg-tennis-green-bg-alt border-r border-tennis-green-medium w-64 flex-shrink-0 h-full overflow-y-auto">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-tennis-green-dark">
          RAKO
        </h1>
        <p className="text-sm text-tennis-green-medium">
          Your Tennis Companion
        </p>
      </div>
      <ul className="space-y-2 p-4">
        {navigationItems.map((item) => (
          <li key={item.name}>
            <NavLink
              to={item.href}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-lg transition-colors
                ${isActive
                  ? 'bg-tennis-green-light text-tennis-green-dark font-semibold'
                  : 'text-gray-600 hover:bg-tennis-green-bg'}`
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </NavLink>
          </li>
        ))}
      </ul>
      {isMobile && (
        <div className="p-4 text-center text-gray-500">
          Mobile Navigation
        </div>
      )}
    </nav>
  );
};
