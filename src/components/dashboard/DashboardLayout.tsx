
import React from 'react';
import { StatusPod } from './StatusPod';
import { ActionsPod } from './ActionsPod';
import { ActivityFeedPod } from './ActivityFeedPod';
import { WelcomeBanner } from './WelcomeBanner';
import { ProfileCard } from './ProfileCard';

interface DashboardLayoutProps {
  // Player data
  hpData: any;
  xpData: any;
  tokenData: any;
  hpLoading: boolean;
  xpLoading: boolean;
  tokensLoading: boolean;
  
  // Profile data
  profile: any;
  user: any;
  profileLoading: boolean;
  isPlayer: boolean;
  
  // Action handlers
  onRestoreHP: (amount: number, activityType: string, description?: string) => Promise<void>;
  onAddXP: (amount: number, activityType: string, description?: string) => Promise<any>;
  onAddTokens: (amount: number, tokenType?: string, source?: string, description?: string) => Promise<void>;
}

export function DashboardLayout({
  hpData,
  xpData,
  tokenData,
  hpLoading,
  xpLoading,
  tokensLoading,
  profile,
  user,
  profileLoading,
  isPlayer,
  onRestoreHP,
  onAddXP,
  onAddTokens
}: DashboardLayoutProps) {
  return (
    <div className="p-3 sm:p-4 max-w-7xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <WelcomeBanner />

      {/* Profile Card */}
      <ProfileCard
        profile={profile}
        user={user}
        profileLoading={profileLoading}
        isPlayer={isPlayer}
      />

      {/* Player Dashboard Pods */}
      {isPlayer && (
        <div className="grid gap-6">
          {/* Top Row - Status Pod (Full Width) */}
          <div className="grid gap-6">
            <StatusPod
              hpData={hpData}
              xpData={xpData}
              tokenData={tokenData}
              hpLoading={hpLoading}
              xpLoading={xpLoading}
              tokensLoading={tokensLoading}
            />
          </div>

          {/* Bottom Row - Actions and Activity (Side by Side on Desktop) */}
          <div className="grid gap-6 lg:grid-cols-2">
            <ActionsPod
              hpData={hpData}
              xpData={xpData}
              tokenData={tokenData}
              onRestoreHP={onRestoreHP}
              onAddXP={onAddXP}
              onAddTokens={onAddTokens}
            />
            
            <ActivityFeedPod />
          </div>
        </div>
      )}
    </div>
  );
}
