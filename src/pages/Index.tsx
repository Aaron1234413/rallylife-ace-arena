
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { usePlayerHP } from '@/hooks/usePlayerHP';
import { usePlayerXP } from '@/hooks/usePlayerXP';
import { usePlayerTokens } from '@/hooks/usePlayerTokens';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function DashboardPage() {
  const { user } = useAuth();
  
  // Fetch real user profile data
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

  // Use real player data hooks
  const { hpData, loading: hpLoading, restoreHP } = usePlayerHP();
  const { xpData, loading: xpLoading, addXP } = usePlayerXP();
  const { tokenData, loading: tokensLoading, addTokens } = usePlayerTokens();

  // Determine if user is a player
  const isPlayer = profile?.role === 'player';

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
      onRestoreHP={restoreHP}
      onAddXP={addXP}
      onAddTokens={addTokens}
    />
  );
}
