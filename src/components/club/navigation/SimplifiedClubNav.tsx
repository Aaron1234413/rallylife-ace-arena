import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Home,
  Users, 
  GraduationCap,
  Calendar,
  MapPin
} from 'lucide-react';

interface SimplifiedClubNavProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  isMember: boolean;
  canManageMembers: boolean;
  canEditClub: boolean;
  isCoach: boolean;
}

export function SimplifiedClubNav({ 
  activeTab, 
  onTabChange, 
  isMember, 
  canManageMembers,
  canEditClub,
  isCoach 
}: SimplifiedClubNavProps) {
  const tabs = [
    {
      value: 'play',
      label: 'Dashboard',
      icon: Home,
      show: true
    },
    {
      value: 'members',
      label: 'Members',
      icon: Users,
      show: true
    },
    {
      value: 'coaches',
      label: 'Coaches',
      icon: GraduationCap,
      show: true
    },
    {
      value: 'sessions',
      label: 'Sessions',
      icon: Calendar,
      show: isMember
    },
    {
      value: 'courts',
      label: 'Courts',
      icon: MapPin,
      show: isMember
    }
  ];

  const visibleTabs = tabs.filter(tab => tab.show);

  return (
    <div className="w-full overflow-x-auto">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid w-full bg-white border shadow-sm" style={{ gridTemplateColumns: `repeat(${visibleTabs.length}, 1fr)` }}>
          {visibleTabs.map((tab) => (
            <TabsTrigger 
              key={tab.value}
              value={tab.value} 
              className="flex items-center gap-2 data-[state=active]:bg-tennis-green-primary data-[state=active]:text-white"
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}