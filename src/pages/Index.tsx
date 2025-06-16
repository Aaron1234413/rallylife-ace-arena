
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { usePlayerHP } from '@/hooks/usePlayerHP';
import { usePlayerXP } from '@/hooks/usePlayerXP';
import { usePlayerTokens } from '@/hooks/usePlayerTokens';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function DashboardPage() {
  const { user } = useAuth();
  const { hpData, loading: hpLoading, restoreHP } = usePlayerHP();
  const { xpData, loading: xpLoading, addXP } = usePlayerXP();
  const { tokenData, loading: tokensLoading, addTokens } = usePlayerTokens();

  // Fetch user profile data
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user?.id
  });

  // Create user object for DashboardLayout
  const userData = user ? { email: user.email || '' } : null;

  return (
    <DashboardLayout
      hpData={hpData}
      xpData={xpData}
      tokenData={tokenData}
      hpLoading={hpLoading}
      xpLoading={xpLoading}
      tokensLoading={tokensLoading}
      profile={profile}
      user={userData}
      profileLoading={profileLoading}
      isPlayer={profile?.role === 'player' || !profile}
      onRestoreHP={restoreHP}
      onAddXP={addXP}
      onAddTokens={addTokens}
    />
  );
}
