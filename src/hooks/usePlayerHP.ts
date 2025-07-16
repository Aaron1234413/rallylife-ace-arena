
import { useState, useEffect, useRef } from 'react';
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
  const channelRef = useRef<any>(null);
  const subscriptionInitialized = useRef(false);
  const isSubscribed = useRef(false);

  const fetchHP = async () => {
    if (!user) return;

    try {
      console.log('Fetching HP data for user:', user.id);
      
      const { data, error } = await supabase
        .from('player_hp')
        .select('*')
        .eq('player_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching HP:', error);
        return;
      }

      console.log('HP data fetched:', data);
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
      console.log('Restoring HP:', { amount, activityType, description });
      
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

      console.log('HP restored successfully:', data);
      
      const changeText = amount > 0 ? `+${amount}` : `${amount}`;
      toast.success(`HP changed! ${changeText} HP`);
      
      // Immediately fetch fresh data
      await fetchHP();
      await fetchActivities();
    } catch (error) {
      console.error('Error in restoreHP:', error);
      toast.error('An error occurred while changing HP');
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

  const refreshHP = async () => {
    console.log('Refreshing HP data...');
    await fetchHP();
    await fetchActivities();
    console.log('HP data refresh completed');
  };

  const cleanupChannel = () => {
    if (channelRef.current) {
      console.log('Cleaning up HP channel subscription');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      subscriptionInitialized.current = false;
      isSubscribed.current = false;
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

      // Clean up any existing channel first
      cleanupChannel();

      // Set up new real-time subscription
      const channelName = `hp-updates-${user.id}-${Date.now()}`;
      const channel = supabase.channel(channelName);
      
      channel
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'player_hp',
            filter: `player_id=eq.${user.id}`
          },
          (payload) => {
            console.log('HP real-time update received:', payload);
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
          (payload) => {
            console.log('HP activity real-time update received:', payload);
            fetchActivities();
          }
        );

      channel.subscribe((status) => {
        console.log('HP Channel subscription status:', status);
        if (status === 'SUBSCRIBED') {
          subscriptionInitialized.current = true;
          isSubscribed.current = true;
        }
      });

      channelRef.current = channel;

      return () => {
        cleanupChannel();
      };
    } else {
      // Clean up when no user
      cleanupChannel();
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
    refreshHP
  };
}
