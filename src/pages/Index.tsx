
import React from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ProfileCard } from '@/components/dashboard/ProfileCard';
import { PlayerStatsCards } from '@/components/dashboard/PlayerStatsCards';
import { PlayerActionCards } from '@/components/dashboard/PlayerActionCards';
import { TokenEconomy } from '@/components/dashboard/TokenEconomy';
import { PlayerActivityLogs } from '@/components/dashboard/PlayerActivityLogs';

export default function Index() {
  return (
    <div className="p-3 sm:p-4 space-y-4 sm:space-y-6">
      <DashboardHeader />
      
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
        {/* Left Column - Profile & Stats */}
        <div className="xl:col-span-1 space-y-4 sm:space-y-6">
          <ProfileCard />
          <PlayerStatsCards />
        </div>
        
        {/* Middle Column - Actions & Token Economy */}
        <div className="xl:col-span-2 space-y-4 sm:space-y-6">
          <PlayerActionCards />
          <TokenEconomy />
        </div>
        
        {/* Right Column - Activity Logs */}
        <div className="xl:col-span-1">
          <PlayerActivityLogs />
        </div>
      </div>
    </div>
  );
}
