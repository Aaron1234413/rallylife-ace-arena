
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { usePlayerHP } from '@/hooks/usePlayerHP';
import { usePlayerXP } from '@/hooks/usePlayerXP';
import { usePlayerTokens } from '@/hooks/usePlayerTokens';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function DashboardPage() {
  const { user } = useAuth();
  
  // Fetch real HP data
  const { hpData, loading: hpLoading, restoreHP } = usePlayerHP();
  
  // Fetch real XP data
  const { xpData, loading: xpLoading, addXP } = usePlayerXP();
  
  // Fetch real token data
  const { tokenData, loading: tokensLoading, addTokens } = usePlayerTokens();
  
  // Fetch real profile data
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

  // Determine if user is a player
  const isPlayer = profile?.role === 'player';

  // Action handlers
  const handleRestoreHP = async (amount: number, activityType: string, description?: string) => {
    await restoreHP(amount, activityType, description);
  };

  const handleAddXP = async (amount: number, activityType: string, description?: string) => {
    return await addXP(amount, activityType, description);
  };

  const handleAddTokens = async (amount: number, tokenType?: string, source?: string, description?: string) => {
    await addTokens(amount, tokenType, source, description);
  };

  return (
    <DashboardLayout
      hpData={hpData}
      xpData={xpData}
      tokenData={tokenData}
      hpLoading={hpLoading}
      xpLoading={xpLoading}
      tokensLoading={tokensLoading}
      profile={profile}
      user={user}
      profileLoading={profileLoading}
      isPlayer={isPlayer}
      onRestoreHP={handleRestoreHP}
      onAddXP={handleAddXP}
      onAddTokens={handleAddTokens}
    />
  );
}
