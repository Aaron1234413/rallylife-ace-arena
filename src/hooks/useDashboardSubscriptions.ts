import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PlayerHP {
  current_hp: number;
  max_hp: number;
  last_activity: string;
  decay_paused: boolean;
}

interface PlayerXP {
  current_xp: number;
  total_xp_earned: number;
  current_level: number;
  xp_to_next_level: number;
}

interface PlayerTokens {
  regular_tokens: number;
  personal_tokens: number;
  monthly_subscription_tokens: number;
  lifetime_earned: number;
}

interface RecentActivity {
  id: string;
  title: string;
  description?: string;
  activity_type: string;
  logged_at: string;
  xp_earned?: number;
  hp_impact?: number;
  duration_minutes?: number;
  score?: string;
  opponent_name?: string;
  location?: string;
}

interface Challenge {
  id: string;
  challenger_id: string;
  challenged_id: string;
  challenge_type: string;
  status: string;
  message?: string;
  stakes_tokens?: number;
  stakes_premium_tokens?: number;
  created_at: string;
}

interface Match {
  id: string;
  status: string;
  scheduled_time?: string;
  court_location?: string;
  stake_amount?: number;
  opponent_id?: string;
  challenger_id: string;
  challenged_id?: string;
  created_at: string;
  challenge_type?: string;
  message?: string;
}

interface MatchHistory {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  recentMatches: Array<{
    id: string;
    result: string;
    opponent_name: string;
    final_score: string;
    completed_at: string;
    match_type: string;
  }>;
}

interface DashboardData {
  playerHP: PlayerHP | null;
  playerXP: PlayerXP | null;
  playerTokens: PlayerTokens | null;
  recentActivities: RecentActivity[];
  pendingChallenges: Challenge[];
  activeMatches: Match[];
  matchHistory: MatchHistory | null;
}

interface LoadingStates {
  hp: boolean;
  xp: boolean;
  tokens: boolean;
  activities: boolean;
  challenges: boolean;
  matches: boolean;
  matchHistory: boolean;
}

interface UseDashboardSubscriptionsReturn {
  dashboardData: DashboardData;
  loading: LoadingStates;
  refreshAll: () => Promise<void>;
  error: string | null;
}

export const useDashboardSubscriptions = (): UseDashboardSubscriptionsReturn => {
  const { user } = useAuth();
  const mountRef = useRef(0);
  const subscriptionsRef = useRef<Set<string>>(new Set());
  const cleanupInProgressRef = useRef(false);

  const [dashboardData, setDashboardData] = useState<DashboardData>({
    playerHP: null,
    playerXP: null,
    playerTokens: null,
    recentActivities: [],
    pendingChallenges: [],
    activeMatches: [],
    matchHistory: null,
  });

  const [loading, setLoading] = useState<LoadingStates>({
    hp: true,
    xp: true,
    tokens: true,
    activities: true,
    challenges: true,
    matches: true,
    matchHistory: true,
  });

  const [error, setError] = useState<string | null>(null);

  // Channel deduplication helper
  const getOrCreateChannel = useCallback((channelName: string) => {
    const existingChannels = supabase.getChannels();
    const existing = existingChannels.find(ch => ch.topic === channelName);
    
    if (existing) {
      console.log(`[Dashboard] Reusing existing channel: ${channelName}`);
      return existing;
    }
    
    console.log(`[Dashboard] Creating new channel: ${channelName}`);
    return supabase.channel(channelName);
  }, []);

  // Fetch initial data
  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setError(null);
      
      // Fetch all data in parallel
      const [
        hpResponse,
        xpResponse,
        tokensResponse,
        activitiesResponse,
        challengesResponse,
        matchesResponse
      ] = await Promise.allSettled([
        supabase.from('player_hp').select('*').eq('player_id', user.id).single(),
        supabase.from('player_xp').select('*').eq('player_id', user.id).single(),
        supabase.from('token_balances').select('*').eq('player_id', user.id).single(),
        supabase.from('activity_logs').select('*').eq('player_id', user.id).order('logged_at', { ascending: false }).limit(10),
        supabase.from('challenges').select('*').or(`challenger_id.eq.${user.id},challenged_id.eq.${user.id}`).eq('status', 'pending').order('created_at', { ascending: false }),
        supabase.from('challenges').select('*').or(`challenger_id.eq.${user.id},challenged_id.eq.${user.id}`).in('status', ['accepted', 'active']).order('created_at', { ascending: false })
      ]);

      // Process HP data
      if (hpResponse.status === 'fulfilled' && hpResponse.value.data) {
        setDashboardData(prev => ({ ...prev, playerHP: hpResponse.value.data }));
      }
      setLoading(prev => ({ ...prev, hp: false }));

      // Process XP data
      if (xpResponse.status === 'fulfilled' && xpResponse.value.data) {
        setDashboardData(prev => ({ ...prev, playerXP: xpResponse.value.data }));
      }
      setLoading(prev => ({ ...prev, xp: false }));

      // Process tokens data
      if (tokensResponse.status === 'fulfilled' && tokensResponse.value.data) {
        setDashboardData(prev => ({ ...prev, playerTokens: tokensResponse.value.data }));
      }
      setLoading(prev => ({ ...prev, tokens: false }));

      // Process activities data
      if (activitiesResponse.status === 'fulfilled' && activitiesResponse.value.data) {
        setDashboardData(prev => ({ ...prev, recentActivities: activitiesResponse.value.data }));
      }
      setLoading(prev => ({ ...prev, activities: false }));

      // Process challenges data
      if (challengesResponse.status === 'fulfilled' && challengesResponse.value.data) {
        setDashboardData(prev => ({ ...prev, pendingChallenges: challengesResponse.value.data }));
      }
      setLoading(prev => ({ ...prev, challenges: false }));

      // Process matches data
      if (matchesResponse.status === 'fulfilled' && matchesResponse.value.data) {
        setDashboardData(prev => ({ ...prev, activeMatches: matchesResponse.value.data }));
      }
      setLoading(prev => ({ ...prev, matches: false }));

      // Set dummy match history for now
      setDashboardData(prev => ({ 
        ...prev, 
        matchHistory: { 
          totalMatches: 0, 
          wins: 0, 
          losses: 0, 
          winRate: 0, 
          recentMatches: [] 
        } 
      }));
      setLoading(prev => ({ ...prev, matchHistory: false }));

    } catch (err) {
      console.error('[Dashboard] Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    }
  }, [user?.id]);

  // Setup real-time subscriptions
  const setupSubscriptions = useCallback(async () => {
    if (!user?.id || subscriptionsRef.current.size > 0) return;

    try {
      const userId = user.id;
      console.log(`[Dashboard] Setting up subscriptions for user: ${userId}`);

      // HP updates channel
      const hpChannel = getOrCreateChannel(`dashboard-hp-${userId}`);
      if (!subscriptionsRef.current.has(`dashboard-hp-${userId}`)) {
        hpChannel
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'player_hp',
            filter: `player_id=eq.${userId}`
          }, (payload) => {
            console.log('[Dashboard] HP update:', payload);
            if (payload.new) {
              setDashboardData(prev => ({ ...prev, playerHP: payload.new as PlayerHP }));
            }
          })
          .subscribe((status) => {
            console.log(`[Dashboard] HP channel status: ${status}`);
            if (status === 'SUBSCRIBED') {
              subscriptionsRef.current.add(`dashboard-hp-${userId}`);
            }
          });
      }

      // XP updates channel
      const xpChannel = getOrCreateChannel(`dashboard-xp-${userId}`);
      if (!subscriptionsRef.current.has(`dashboard-xp-${userId}`)) {
        xpChannel
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'player_xp',
            filter: `player_id=eq.${userId}`
          }, (payload) => {
            console.log('[Dashboard] XP update:', payload);
            if (payload.new) {
              setDashboardData(prev => ({ ...prev, playerXP: payload.new as PlayerXP }));
            }
          })
          .subscribe((status) => {
            console.log(`[Dashboard] XP channel status: ${status}`);
            if (status === 'SUBSCRIBED') {
              subscriptionsRef.current.add(`dashboard-xp-${userId}`);
            }
          });
      }

      // Tokens updates channel
      const tokensChannel = getOrCreateChannel(`dashboard-tokens-${userId}`);
      if (!subscriptionsRef.current.has(`dashboard-tokens-${userId}`)) {
        tokensChannel
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'player_tokens',
            filter: `player_id=eq.${userId}`
          }, (payload) => {
            console.log('[Dashboard] Tokens update:', payload);
            if (payload.new) {
              setDashboardData(prev => ({ ...prev, playerTokens: payload.new as PlayerTokens }));
            }
          })
          .subscribe((status) => {
            console.log(`[Dashboard] Tokens channel status: ${status}`);
            if (status === 'SUBSCRIBED') {
              subscriptionsRef.current.add(`dashboard-tokens-${userId}`);
            }
          });
      }

      // Activities updates channel
      const activitiesChannel = getOrCreateChannel(`dashboard-activities-${userId}`);
      if (!subscriptionsRef.current.has(`dashboard-activities-${userId}`)) {
        activitiesChannel
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'activity_logs',
            filter: `player_id=eq.${userId}`
          }, (payload) => {
            console.log('[Dashboard] New activity:', payload);
            if (payload.new) {
              setDashboardData(prev => ({
                ...prev,
                recentActivities: [payload.new as RecentActivity, ...prev.recentActivities.slice(0, 9)]
              }));
            }
          })
          .subscribe((status) => {
            console.log(`[Dashboard] Activities channel status: ${status}`);
            if (status === 'SUBSCRIBED') {
              subscriptionsRef.current.add(`dashboard-activities-${userId}`);
            }
          });
      }

      // Challenges updates channel
      const challengesChannel = getOrCreateChannel(`dashboard-challenges-${userId}`);
      if (!subscriptionsRef.current.has(`dashboard-challenges-${userId}`)) {
        challengesChannel
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'challenges',
            filter: `challenger_id=eq.${userId},challenged_id=eq.${userId}`
          }, () => {
            console.log('[Dashboard] Challenges update, refetching...');
            // Refetch challenges data
            supabase.from('challenges')
              .select('*')
              .or(`challenger_id.eq.${userId},challenged_id.eq.${userId}`)
              .order('created_at', { ascending: false })
              .then(({ data }) => {
                if (data) {
                  const pending = data.filter(c => c.status === 'pending');
                  const active = data.filter(c => ['accepted', 'active'].includes(c.status));
                  setDashboardData(prev => ({
                    ...prev,
                    pendingChallenges: pending,
                    activeMatches: active
                  }));
                }
              });
          })
          .subscribe((status) => {
            console.log(`[Dashboard] Challenges channel status: ${status}`);
            if (status === 'SUBSCRIBED') {
              subscriptionsRef.current.add(`dashboard-challenges-${userId}`);
            }
          });
      }

    } catch (err) {
      console.error('[Dashboard] Error setting up subscriptions:', err);
      setError(err instanceof Error ? err.message : 'Failed to setup real-time updates');
    }
  }, [user?.id, getOrCreateChannel]);

  // Cleanup function
  const cleanupSubscriptions = useCallback(() => {
    if (cleanupInProgressRef.current) return;
    cleanupInProgressRef.current = true;

    try {
      console.log('[Dashboard] Cleaning up subscriptions...');
      const channels = supabase.getChannels();
      const dashboardChannels = channels.filter(ch => 
        ch.topic.includes('dashboard-') || 
        ch.topic.includes(user?.id || '')
      );

      dashboardChannels.forEach(channel => {
        try {
          console.log(`[Dashboard] Removing channel: ${channel.topic}`);
          supabase.removeChannel(channel);
        } catch (err) {
          console.error(`[Dashboard] Error removing channel ${channel.topic}:`, err);
        }
      });

      subscriptionsRef.current.clear();
    } catch (err) {
      console.error('[Dashboard] Error during cleanup:', err);
    } finally {
      cleanupInProgressRef.current = false;
    }
  }, [user?.id]);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    console.log('[Dashboard] Manual refresh triggered');
    setLoading({
      hp: true,
      xp: true,
      tokens: true,
      activities: true,
      challenges: true,
      matches: true,
      matchHistory: true,
    });
    await fetchDashboardData();
  }, [fetchDashboardData]);

  // Main effect
  useEffect(() => {
    const currentMount = ++mountRef.current;
    console.log(`[Dashboard] Mount ${currentMount}, user:`, user?.id);

    if (!user?.id) {
      console.log('[Dashboard] No user, skipping setup');
      return;
    }

    // Initial data fetch
    fetchDashboardData();

    // Setup subscriptions after a brief delay to ensure proper initialization
    const subscriptionTimeout = setTimeout(() => {
      if (mountRef.current === currentMount) {
        setupSubscriptions();
      }
    }, 100);

    // Cleanup function
    return () => {
      console.log(`[Dashboard] Cleanup for mount ${currentMount}`);
      clearTimeout(subscriptionTimeout);
      
      // Only cleanup if this is the most recent mount
      if (mountRef.current === currentMount) {
        cleanupSubscriptions();
      }
    };
  }, [user?.id, fetchDashboardData, setupSubscriptions, cleanupSubscriptions]);

  return {
    dashboardData,
    loading,
    refreshAll,
    error
  };
};