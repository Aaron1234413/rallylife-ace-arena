import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Home,
  Users, 
  MapPin,
  DollarSign,
  Settings
} from 'lucide-react';

interface SimplifiedClubNavProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  isMember: boolean;
  canManageMembers: boolean;
  canEditClub: boolean;
  isCoach: boolean;
  isOwner: boolean;
}

export function SimplifiedClubNav({ 
  activeTab, 
  onTabChange, 
  isMember, 
  canManageMembers,
  canEditClub,
  isCoach,
  isOwner 
}: SimplifiedClubNavProps) {
  const tabs = [
    {
      value: 'play',
      label: 'Play',
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
      value: 'courts',
      label: 'Courts',
      icon: MapPin,
      show: isMember
    },
    {
      value: 'economics',
      label: 'Economics',
      icon: DollarSign,
      show: isOwner || canManageMembers || canEditClub
    },
    {
      value: 'settings',
      label: 'Settings',
      icon: Settings,
      show: isOwner || canEditClub
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