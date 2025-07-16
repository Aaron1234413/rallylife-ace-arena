import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HPData {
  hp: number;
  max_hp: number;
  last_hp_update: string;
}

export function useHPSystem() {
  const [hpData, setHPData] = useState<HPData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchHP = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First apply regeneration
      const { data: regenData, error: regenError } = await supabase.rpc('calculate_hp_regen', {
        user_id: user.id
      });

      if (regenError) {
        console.error('Error calculating HP regen:', regenError);
      }

      // Fetch updated profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('hp, max_hp, last_hp_update')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setHPData(profile);
    } catch (error) {
      console.error('Error fetching HP:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const deductHP = useCallback(async (hoursPlayed: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: newHP, error } = await supabase.rpc('deduct_hp', {
        user_id: user.id,
        hours_played: hoursPlayed
      });

      if (error) throw error;

      // Refresh HP data
      await fetchHP();

      toast({
        title: "Activity Complete",
        description: `HP reduced by ${Math.min(5 * hoursPlayed, 10)}. Current HP: ${newHP}`,
      });

    } catch (error) {
      console.error('Error deducting HP:', error);
      toast({
        title: "Error",
        description: "Failed to update HP",
        variant: "destructive",
      });
    }
  }, [fetchHP, toast]);

  const claimDailyBonus = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: newHP, error } = await supabase.rpc('daily_login_bonus', {
        user_id: user.id
      });

      if (error) throw error;

      // Check if bonus was actually given (HP increased)
      if (hpData && newHP > hpData.hp) {
        toast({
          title: "Daily Bonus!",
          description: "+5 HP for logging in today!",
        });
      }

      // Refresh HP data
      await fetchHP();

    } catch (error) {
      console.error('Error claiming daily bonus:', error);
    }
  }, [fetchHP, hpData, toast]);

  const regenerateHP = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: newHP, error } = await supabase.rpc('calculate_hp_regen', {
        user_id: user.id
      });

      if (error) throw error;

      // Refresh HP data
      await fetchHP();

    } catch (error) {
      console.error('Error regenerating HP:', error);
    }
  }, [fetchHP]);

  useEffect(() => {
    fetchHP();
    
    // Set up real-time subscription for profile changes
    const channel = supabase
      .channel('hp-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${supabase.auth.getUser().then(({ data }) => data.user?.id)}`
        },
        () => {
          fetchHP();
        }
      )
      .subscribe();

    // Apply daily bonus on load
    claimDailyBonus();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchHP, claimDailyBonus]);

  return {
    hpData,
    loading,
    deductHP,
    claimDailyBonus,
    regenerateHP,
    refreshHP: fetchHP
  };
}