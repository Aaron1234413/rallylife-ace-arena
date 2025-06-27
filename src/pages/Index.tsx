
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
import { usePlayerHP } from '@/hooks/usePlayerHP';
import { usePlayerXP } from '@/hooks/usePlayerXP';
import { usePlayerTokens } from '@/hooks/usePlayerTokens';
import { useActivityLogs } from '@/hooks/useActivityLogs';

const Index = () => {
  const { data: hpData, loading: hpLoading, restoreHP } = usePlayerHP();
  const { data: xpData, loading: xpLoading, addXP } = usePlayerXP();
  const { data: tokenData, loading: tokensLoading, addTokens } = usePlayerTokens();
  const { data: activities, loading: activitiesLoading } = useActivityLogs();

  return (
    <AppLayout>
      <div className="space-y-6">
        <WelcomeBanner />
        
        {/* Match Invitations - appears at top for visibility */}
        <MatchInvitations />
        
        {/* Player Stats Cards */}
        <PlayerStatsCards
          hpData={hpData}
          xpData={xpData}
          tokenData={tokenData}
          hpLoading={hpLoading}
          xpLoading={xpLoading}
          tokensLoading={tokensLoading}
        />
        
        {/* Active Sessions */}
        <ActiveMatchWidget />
        <ActiveTrainingWidget />
        <ActiveSocialPlayWidget 
          onAddXP={addXP}
          onRestoreHP={restoreHP}
        />
        
        {/* Player Action Cards */}
        <PlayerActionCards
          hpData={hpData}
          xpData={xpData}
          tokenData={tokenData}
          onRestoreHP={restoreHP}
          onAddXP={addXP}
          onAddTokens={addTokens}
        />
        
        {/* Player Activity Logs */}
        <PlayerActivityLogs
          activities={activities || []}
          loading={activitiesLoading}
        />
        
        {/* Floating Action Buttons */}
        <FloatingCheckInButton />
        <FloatingCheckInTrigger />
      </div>
    </AppLayout>
  );
};

export default Index;
