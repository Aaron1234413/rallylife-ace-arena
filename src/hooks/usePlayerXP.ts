
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PlayerXP {
  id: string;
  current_xp: number;
  total_xp_earned: number;
  current_level: number;
  xp_to_next_level: number;
  created_at: string;
  updated_at: string;
}

interface XPActivity {
  id: string;
  activity_type: string;
  xp_earned: number;
  description: string;
  level_before: number;
  level_after: number;
  created_at: string;
}

interface XPGainResult {
  xp_earned: number;
  total_xp: number;
  current_level: number;
  level_up: boolean;
  levels_gained: number;
  current_xp_in_level: number;
  xp_to_next_level: number;
}

export function usePlayerXP(dashboardTrigger?: number) {
  const { user } = useAuth();
  const [xpData, setXpData] = useState<PlayerXP | null>(null);
  const [activities, setActivities] = useState<XPActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchXP = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('player_xp')
        .select('*')
        .eq('player_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching XP:', error);
        return;
      }

      setXpData(data);
    } catch (error) {
      console.error('Error in fetchXP:', error);
    }
  };

  const fetchActivities = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('xp_activities')
        .select('*')
        .eq('player_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching XP activities:', error);
        return;
      }

      setActivities(data || []);
    } catch (error) {
      console.error('Error in fetchActivities:', error);
    }
  };

  const addXP = async (
    amount: number,
    activityType: string,
    description?: string
  ): Promise<void> => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .rpc('add_xp', {
          user_id: user.id,
          xp_amount: amount,
          activity_type: activityType,
          description: description
        });

      if (error) {
        console.error('Error adding XP:', error);
        toast.error('Failed to add XP');
        return;
      }

      // Properly handle the RPC result - first cast to unknown, then to our interface
      const result = data as unknown as XPGainResult;
      
      // Show appropriate toast message
      if (result.level_up) {
        toast.success(`🎉 Level Up! You reached level ${result.current_level}! (+${amount} XP)`);
      } else {
        toast.success(`+${amount} XP earned!`);
      }

      await fetchXP();
      await fetchActivities();
    } catch (error) {
      console.error('Error in addXP:', error);
      toast.error('An error occurred while adding XP');
    }
  };

  const initializeXP = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .rpc('initialize_player_xp', { user_id: user.id });

      if (error) {
        console.error('Error initializing XP:', error);
        return;
      }

      await fetchXP();
    } catch (error) {
      console.error('Error in initializeXP:', error);
    }
  };

  useEffect(() => {
    if (user) {
      const loadData = async () => {
        setLoading(true);
        await fetchXP();
        await fetchActivities();
        setLoading(false);
      };

      loadData();
    } else {
      setXpData(null);
      setActivities([]);
      setLoading(false);
    }
  }, [user]);

  // React to dashboard subscription updates
  useEffect(() => {
    if (dashboardTrigger && user) {
      fetchXP();
      fetchActivities();
    }
  }, [dashboardTrigger, user]);

  return {
    xpData,
    activities,
    loading,
    addXP,
    initializeXP,
    refreshXP: fetchXP
  };
}
