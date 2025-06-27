
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner';
import { PlayerStatsCards } from '@/components/dashboard/PlayerStatsCards';
import { ActiveMatchWidget } from '@/components/match/ActiveMatchWidget';
import { MatchInvitations } from '@/components/match/MatchInvitations';
import { ActiveTrainingWidget } from '@/components/training/ActiveTrainingWidget';
import { ActiveSocialPlayWidget } from '@/components/social-play/ActiveSocialPlayWidget';
import { PlayerActionCards } from '@/components/dashboard/PlayerActionCards';
import { PlayerActivityLogs } from '@/components/dashboard/PlayerActivityLogs';
import { FloatingCheckInButton } from '@/components/match/FloatingCheckInButton';
import { FloatingCheckInTrigger } from '@/components/training/FloatingCheckInTrigger';

const Index = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <WelcomeBanner />
        
        {/* Match Invitations - appears at top for visibility */}
        <MatchInvitations />
        
        {/* Active Sessions */}
        <ActiveMatchWidget />
        <ActiveTrainingWidget />
        <ActiveSocialPlayWidget />
        
        {/* Floating Action Buttons */}
        <FloatingCheckInButton />
        <FloatingCheckInTrigger />
      </div>
    </AppLayout>
  );
};

export default Index;
