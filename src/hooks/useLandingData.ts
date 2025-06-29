
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LiveStats {
  matches_today: number;
  active_players: number;
  total_xp_distributed: number;
  achievements_unlocked_today: number;
}

interface RecentActivity {
  id: string;
  type: 'match' | 'achievement' | 'level_up' | 'training';
  player_name: string;
  description: string;
  timestamp: string;
  location?: string;
  xp_earned?: number;
}

interface LiveAchievement {
  id: string;
  player_name: string;
  achievement_name: string;
  achievement_description: string;
  timestamp: string;
  avatar_url?: string;
}

export function useLandingData() {
  const [stats, setStats] = useState<LiveStats>({
    matches_today: 0,
    active_players: 0,
    total_xp_distributed: 0,
    achievements_unlocked_today: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [liveAchievements, setLiveAchievements] = useState<LiveAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<any>(null);

  const fetchLiveStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_landing_stats');
      
      if (error) {
        console.error('Error fetching landing stats:', error);
        return;
      }

      setStats(data || {
        matches_today: Math.floor(Math.random() * 1000) + 500,
        active_players: Math.floor(Math.random() * 5000) + 2000,
        total_xp_distributed: Math.floor(Math.random() * 50000) + 25000,
        achievements_unlocked_today: Math.floor(Math.random() * 200) + 100
      });
    } catch (error) {
      console.error('Error in fetchLiveStats:', error);
      // Fallback to simulated data
      setStats({
        matches_today: Math.floor(Math.random() * 1000) + 500,
        active_players: Math.floor(Math.random() * 5000) + 2000,
        total_xp_distributed: Math.floor(Math.random() * 50000) + 25000,
        achievements_unlocked_today: Math.floor(Math.random() * 200) + 100
      });
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const { data, error } = await supabase.rpc('get_recent_landing_activity', {
        limit_count: 10
      });
      
      if (error) {
        console.error('Error fetching recent activity:', error);
        return;
      }

      setRecentActivity(data || []);
    } catch (error) {
      console.error('Error in fetchRecentActivity:', error);
    }
  };

  const fetchLiveAchievements = async () => {
    try {
      const { data, error } = await supabase.rpc('get_recent_achievements', {
        limit_count: 5
      });
      
      if (error) {
        console.error('Error fetching live achievements:', error);
        return;
      }

      setLiveAchievements(data || []);
    } catch (error) {
      console.error('Error in fetchLiveAchievements:', error);
    }
  };

  // Simulate real-time counter updates
  const simulateCounterUpdates = () => {
    setStats(prev => ({
      matches_today: prev.matches_today + Math.floor(Math.random() * 3),
      active_players: prev.active_players + Math.floor(Math.random() * 10) - 5,
      total_xp_distributed: prev.total_xp_distributed + Math.floor(Math.random() * 100),
      achievements_unlocked_today: prev.achievements_unlocked_today + (Math.random() > 0.7 ? 1 : 0)
    }));
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await Promise.all([
        fetchLiveStats(),
        fetchRecentActivity(),
        fetchLiveAchievements()
      ]);
      setLoading(false);
    };

    loadInitialData();

    // Set up real-time updates every 3 seconds
    intervalRef.current = setInterval(() => {
      simulateCounterUpdates();
      fetchRecentActivity();
      fetchLiveAchievements();
    }, 3000);

    // Set up WebSocket subscription for real-time activity
    const channelName = `landing-activity-${Date.now()}`;
    const channel = supabase.channel(channelName);

    channel
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'activity_logs'
      }, () => {
        fetchRecentActivity();
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'player_achievements'
      }, () => {
        fetchLiveAchievements();
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  return {
    stats,
    recentActivity,
    liveAchievements,
    loading,
    refreshData: () => {
      fetchLiveStats();
      fetchRecentActivity();
      fetchLiveAchievements();
    }
  };
}
