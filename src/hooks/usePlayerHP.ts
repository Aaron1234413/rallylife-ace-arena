
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PlayerHP {
  id: string;
  current_hp: number;
  max_hp: number;
  last_activity: string;
  decay_rate: number;
  decay_paused: boolean;
}

interface HPActivity {
  id: string;
  activity_type: string;
  hp_change: number;
  hp_before: number;
  hp_after: number;
  description: string;
  created_at: string;
}

export function usePlayerHP() {
  const { user } = useAuth();
  const [hpData, setHpData] = useState<PlayerHP | null>(null);
  const [activities, setActivities] = useState<HPActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHP = async () => {
    if (!user) return;

    try {
      // First calculate any decay
      const { data: decayResult, error: decayError } = await supabase
        .rpc('calculate_hp_decay', { user_id: user.id });

      if (decayError) {
        console.error('Error calculating HP decay:', decayError);
      }

      // Then fetch current HP status
      const { data, error } = await supabase
        .from('player_hp')
        .select('*')
        .eq('player_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching HP:', error);
        return;
      }

      setHpData(data);
    } catch (error) {
      console.error('Error in fetchHP:', error);
    }
  };

  const fetchActivities = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('hp_activities')
        .select('*')
        .eq('player_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching HP activities:', error);
        return;
      }

      setActivities(data || []);
    } catch (error) {
      console.error('Error in fetchActivities:', error);
    }
  };

  const restoreHP = async (
    amount: number, 
    activityType: string, 
    description?: string
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .rpc('restore_hp', {
          user_id: user.id,
          restoration_amount: amount,
          activity_type: activityType,
          description: description
        });

      if (error) {
        console.error('Error restoring HP:', error);
        toast.error('Failed to restore HP');
        return;
      }

      toast.success(`HP restored! +${amount} HP`);
      await fetchHP();
      await fetchActivities();
    } catch (error) {
      console.error('Error in restoreHP:', error);
      toast.error('An error occurred while restoring HP');
    }
  };

  const initializeHP = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .rpc('initialize_player_hp', { user_id: user.id });

      if (error) {
        console.error('Error initializing HP:', error);
        return;
      }

      await fetchHP();
    } catch (error) {
      console.error('Error in initializeHP:', error);
    }
  };

  useEffect(() => {
    if (user) {
      const loadData = async () => {
        setLoading(true);
        await fetchHP();
        await fetchActivities();
        setLoading(false);
      };

      loadData();

      // Set up real-time subscription for HP changes with unique channel name
      const channelName = `hp-${user.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'player_hp',
            filter: `player_id=eq.${user.id}`
          },
          () => {
            fetchHP();
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'hp_activities',
            filter: `player_id=eq.${user.id}`
          },
          () => {
            fetchActivities();
          }
        )
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    } else {
      setHpData(null);
      setActivities([]);
      setLoading(false);
    }
  }, [user]);

  return {
    hpData,
    activities,
    loading,
    restoreHP,
    initializeHP,
    refreshHP: fetchHP
  };
}
