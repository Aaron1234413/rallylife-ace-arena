
import React from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ProfileCard } from '@/components/dashboard/ProfileCard';
import { PlayerStatsCards } from '@/components/dashboard/PlayerStatsCards';
import { PlayerActionCards } from '@/components/dashboard/PlayerActionCards';
import { TokenEconomy } from '@/components/dashboard/TokenEconomy';
import { PlayerActivityLogs } from '@/components/dashboard/PlayerActivityLogs';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePlayerHP } from '@/hooks/usePlayerHP';
import { usePlayerXP } from '@/hooks/usePlayerXP';
import { usePlayerTokens } from '@/hooks/usePlayerTokens';

export default function Index() {
  const { user } = useAuth();
  
  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Use player system hooks
  const {
    hpData,
    activities: hpActivities,
    loading: hpLoading,
    restoreHP
  } = usePlayerHP();

  const {
    xpData,
    activities: xpActivities,
    loading: xpLoading,
    addXP
  } = usePlayerXP();

  const {
    tokenData,
    transactions,
    loading: tokensLoading,
    addTokens,
    spendTokens,
    convertPremiumTokens
  } = usePlayerTokens();

  const isPlayer = profile?.role === 'player';

  return (
    <div className="p-3 sm:p-4 space-y-4 sm:space-y-6">
      <DashboardHeader />
      
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
        {/* Left Column - Profile & Stats */}
        <div className="xl:col-span-1 space-y-4 sm:space-y-6">
          <ProfileCard 
            profile={profile}
            user={user}
            profileLoading={profileLoading}
            isPlayer={isPlayer}
          />
          <PlayerStatsCards 
            hpData={hpData}
            xpData={xpData}
            tokenData={tokenData}
            hpLoading={hpLoading}
            xpLoading={xpLoading}
            tokensLoading={tokensLoading}
          />
        </div>
        
        {/* Middle Column - Actions & Token Economy */}
        <div className="xl:col-span-2 space-y-4 sm:space-y-6">
          <PlayerActionCards 
            hpData={hpData}
            xpData={xpData}
            tokenData={tokenData}
            onRestoreHP={restoreHP}
            onAddXP={addXP}
            onAddTokens={addTokens}
          />
          <TokenEconomy 
            tokenData={tokenData}
            onSpendTokens={spendTokens}
            onConvertTokens={convertPremiumTokens}
          />
        </div>
        
        {/* Right Column - Activity Logs */}
        <div className="xl:col-span-1">
          <PlayerActivityLogs 
            hpActivities={hpActivities}
            xpActivities={xpActivities}
            transactions={transactions}
            hpLoading={hpLoading}
            xpLoading={xpLoading}
            tokensLoading={tokensLoading}
          />
        </div>
      </div>
    </div>
  );
}
