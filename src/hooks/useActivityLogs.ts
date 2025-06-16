import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ActivityLog {
  id: string;
  activity_type: string;
  activity_category: string;
  title: string;
  description?: string;
  duration_minutes?: number;
  intensity_level: string;
  location?: string;
  opponent_name?: string;
  coach_name?: string;
  score?: string;
  result?: string;
  hp_impact: number;
  xp_earned: number;
  enjoyment_rating?: number;
  is_competitive: boolean;
  logged_at: string;
  created_at: string;
}

interface ActivityStats {
  total_activities: number;
  total_duration_minutes: number;
  total_hp_impact: number;
  total_xp_earned: number;
  activities_by_type: Record<string, number>;
  avg_enjoyment_rating: number;
  competitive_activities: number;
  wins: number;
  losses: number;
}

interface LogActivityResult {
  success: boolean;
  activity_id: string;
  activity_title: string;
  hp_change: number;
  xp_earned: number;
  activity_type: string;
  logged_at: string;
}

interface LogActivityParams {
  activity_type: string;
  activity_category: string;
  title: string;
  description?: string;
  duration_minutes?: number;
  intensity_level?: string;
  location?: string;
  opponent_name?: string;
  coach_name?: string;
  score?: string;
  result?: string;
  notes?: string;
  weather_conditions?: string;
  court_surface?: string;
  equipment_used?: string[];
  skills_practiced?: string[];
  energy_before?: number;
  energy_after?: number;
  enjoyment_rating?: number;
  difficulty_rating?: number;
  tags?: string[];
  is_competitive?: boolean;
  is_official?: boolean;
  logged_at?: string;
  metadata?: any;
}

export function useActivityLogs() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<any>(null);
  const subscriptionStatusRef = useRef<string>('unsubscribed');

  const fetchActivities = async (
    limit = 20,
    offset = 0,
    activityTypeFilter?: string,
    dateFrom?: string,
    dateTo?: string
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('get_activity_feed', {
        user_id: user.id,
        limit_count: limit,
        offset_count: offset,
        activity_type_filter: activityTypeFilter,
        date_from: dateFrom,
        date_to: dateTo
      });

      if (error) {
        console.error('Error fetching activities:', error);
        return;
      }

      setActivities(data || []);
    } catch (error) {
      console.error('Error in fetchActivities:', error);
    }
  };

  const fetchStats = async (daysBack = 30) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('get_activity_stats', {
        user_id: user.id,
        days_back: daysBack
      });

      if (error) {
        console.error('Error fetching activity stats:', error);
        return;
      }

      // Type assertion since we know the structure from our SQL function
      setStats(data as unknown as ActivityStats);
    } catch (error) {
      console.error('Error in fetchStats:', error);
    }
  };

  const logActivity = async (params: LogActivityParams) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('log_comprehensive_activity', {
        user_id: user.id,
        ...params
      });

      if (error) {
        console.error('Error logging activity:', error);
        toast.error('Failed to log activity');
        return;
      }

      // Type assertion since we know the structure from our SQL function
      const result = data as unknown as LogActivityResult;
      
      if (result.success) {
        toast.success(`Activity logged! ${result.hp_change > 0 ? '+' : ''}${result.hp_change} HP, +${result.xp_earned} XP`);
        await fetchActivities();
        await fetchStats();
        return result;
      }
    } catch (error) {
      console.error('Error in logActivity:', error);
      toast.error('An error occurred while logging activity');
    }
  };

  const deleteActivity = async (activityId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('activity_logs')
        .delete()
        .eq('id', activityId);

      if (error) {
        console.error('Error deleting activity:', error);
        toast.error('Failed to delete activity');
        return;
      }

      toast.success('Activity deleted');
      await fetchActivities();
      await fetchStats();
    } catch (error) {
      console.error('Error in deleteActivity:', error);
      toast.error('An error occurred while deleting activity');
    }
  };

  useEffect(() => {
    const cleanupChannel = () => {
      if (channelRef.current && subscriptionStatusRef.current !== 'unsubscribed') {
        channelRef.current.unsubscribe();
        subscriptionStatusRef.current = 'unsubscribed';
        channelRef.current = null;
      }
    };

    if (user) {
      const loadData = async () => {
        setLoading(true);
        await fetchActivities();
        await fetchStats();
        setLoading(false);
      };

      loadData();

      // Clean up any existing channel
      cleanupChannel();

      // Set up real-time subscription for activity changes with unique channel name
      const channelName = `activities-${user.id}-${Date.now()}-${Math.random()}`;
      const channel = supabase.channel(channelName);
      
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activity_logs',
          filter: `player_id=eq.${user.id}`
        },
        () => {
          fetchActivities();
          fetchStats();
        }
      );

      // Only subscribe if not already subscribed
      if (subscriptionStatusRef.current === 'unsubscribed') {
        subscriptionStatusRef.current = 'subscribing';
        channel.subscribe((status) => {
          subscriptionStatusRef.current = status;
          console.log('Activity Channel subscription status:', status);
        });
        channelRef.current = channel;
      }

      return () => {
        cleanupChannel();
      };
    } else {
      // Clean up when no user
      cleanupChannel();
      setActivities([]);
      setStats(null);
      setLoading(false);
    }
  }, [user]);

  return {
    activities,
    stats,
    loading,
    logActivity,
    deleteActivity,
    fetchActivities,
    fetchStats,
    refreshData: async () => {
      await fetchActivities();
      await fetchStats();
    }
  };
}
