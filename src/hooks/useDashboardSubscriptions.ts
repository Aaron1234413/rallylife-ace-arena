import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
// import type { RecentActivityItem } from '@/hooks/useRecentActivity';

interface RecentActivityItem {
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

// === Token System Interfaces ===
interface TokenTransaction {
  id: string;
  player_id: string;
  transaction_type: 'earn' | 'spend';
  token_type: 'regular' | 'premium' | 'subscription';
  amount: number;
  source: string;
  description?: string;
  created_at: string;
  balance_after?: number;
  balance_before?: number;
  metadata?: any;
}

interface TokenNotification {
  type: 'earning' | 'spending' | 'subscription' | 'redemption' | 'pool_update' | 'overdraft_warning';
  message: string;
  amount?: number;
  clubName?: string;
  serviceType?: string;
  timestamp?: string;
}

// === Enhanced Activity System Interfaces ===
interface XPActivity {
  id: string;
  player_id: string;
  activity_type: string;
  xp_earned: number;
  description?: string;
  level_before: number;
  level_after: number;
  created_at: string;
  metadata?: any;
}

interface HPActivity {
  id: string;
  player_id: string;
  activity_type: string;
  hp_change: number;
  hp_before: number;
  hp_after: number;
  description?: string;
  created_at: string;
  metadata?: any;
}

// === Session Management Interfaces ===
interface Session {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  start_datetime?: string;
  end_datetime?: string;
  location?: string;
  max_participants: number;
  current_participants: number;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  creator_id: string;
  creator_name?: string;
  skill_level?: string;
  session_type: string;
  club_id?: string;
  notes?: string;
  format?: string;
  created_at: string;
  updated_at: string;
  participants?: Array<{
    id: string;
    user_id: string;
    status: string;
    joined_at: string;
    user?: {
      id: string;
      full_name?: string;
      avatar_url?: string;
    };
  }>;
  stakes_amount?: number;
  cost_tokens?: number;
  cost_money?: number;
  payment_method?: 'tokens' | 'money';
  max_players?: number;
}

interface SessionParticipation {
  id: string;
  session_id: string;
  user_id: string;
  status: 'joined' | 'left' | 'banned';
  joined_at: string;
  left_at?: string;
  notes?: string;
  session?: Session;
}

// === Notification System Interfaces ===
interface Notification {
  id: string;
  user_id: string;
  match_id?: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  updated_at: string;
  metadata?: any;
}

// === Club Data Interfaces ===
interface ClubMembership {
  id: string;
  club_id: string;
  user_id: string;
  role: string;
  status: string;
  joined_at: string;
  updated_at: string;
  permissions?: any;
  club?: {
    id: string;
    name: string;
    description?: string;
    logo_url?: string;
    is_public: boolean;
  };
}

interface ClubActivityItem {
  id: string;
  club_id: string;
  user_id: string;
  activity_type: string;
  activity_data: any;
  created_at: string;
  user?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  };
}

// === Coaching Data Interfaces ===
interface Appointment {
  id: string;
  coach_id: string;
  player_id: string;
  title: string;
  description?: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: string;
  appointment_type: string;
  location?: string;
  notes?: string;
  price_amount?: number;
  payment_status?: string;
  created_at: string;
  updated_at: string;
  coach?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  };
  player?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  };
}

interface CoachBooking {
  id: string;
  coach_id: string;
  player_id: string;
  club_id: string;
  service_id: string;
  start_datetime: string;
  end_datetime: string;
  status: string;
  total_cost_tokens: number;
  total_cost_money: number;
  payment_method: string;
  feedback_rating?: number;
  feedback_comment?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface PlayerHP {
  id: string;
  current_hp: number;
  max_hp: number;
  last_activity: string;
  decay_rate: number;
  decay_paused: boolean;
}

interface PlayerXP {
  id: string;
  current_xp: number;
  total_xp_earned: number;
  current_level: number;
  xp_to_next_level: number;
  created_at: string;
  updated_at: string;
}

interface PlayerTokens {
  id: string;
  player_id: string;
  personal_tokens?: number;
  monthly_subscription_tokens?: number;
  regular_tokens: number;
  premium_tokens?: number;
  lifetime_earned: number;
  created_at: string;
  updated_at: string;
}

interface MatchHistory {
  totalMatches: number;
  winRate: number;
}

interface DashboardData {
  // === Core Player Data ===
  playerHP: PlayerHP | null;
  playerXP: PlayerXP | null;
  playerTokens: PlayerTokens | null;
  recentActivities: RecentActivityItem[];
  pendingChallenges: any[];
  activeMatches: any[];
  matchHistory: MatchHistory | null;

  // === Expanded Token System Data ===
  tokenTransactions: TokenTransaction[];
  tokenNotifications: TokenNotification[];

  // === Enhanced Activity System Data ===
  xpActivities: XPActivity[];
  hpActivities: HPActivity[];

  // === Session Management Data ===
  userSessions: Session[];
  sessionParticipations: SessionParticipation[];

  // === Notification System Data ===
  notifications: Notification[];

  // === Club Data ===
  clubMemberships: ClubMembership[];
  clubActivities: ClubActivityItem[];

  // === Coaching Data ===
  appointments: Appointment[];
  coachBookings: CoachBooking[];
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

interface ErrorStates {
  hp: string | null;
  xp: string | null;
  tokens: string | null;
  activities: string | null;
  challenges: string | null;
  matches: string | null;
  matchHistory: string | null;
  subscription: string | null;
}

interface SubscriptionStatus {
  connected: boolean;
  lastConnected: Date | null;
  retryCount: number;
  maxRetries: number;
}

export function useDashboardSubscriptions() {
  const { user } = useAuth();
  const { toast } = useToast();

  // DEBUG: Clear any stale channels on mount
  useEffect(() => {
    const active = supabase.getChannels();
    console.log('🔍 Clearing stale channels on mount:', active.map(c => c.topic));
    active.forEach(ch => supabase.removeChannel(ch));
  }, []);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    // === Core Player Data ===
    playerHP: null,
    playerXP: null,
    playerTokens: null,
    recentActivities: [],
    pendingChallenges: [],
    activeMatches: [],
    matchHistory: null,

    // === Expanded Token System Data ===
    tokenTransactions: [],
    tokenNotifications: [],

    // === Enhanced Activity System Data ===
    xpActivities: [],
    hpActivities: [],

    // === Session Management Data ===
    userSessions: [],
    sessionParticipations: [],

    // === Notification System Data ===
    notifications: [],

    // === Club Data ===
    clubMemberships: [],
    clubActivities: [],

    // === Coaching Data ===
    appointments: [],
    coachBookings: []
  });

  const [loading, setLoading] = useState<LoadingStates>({
    hp: true,
    xp: true,
    tokens: true,
    activities: true,
    challenges: true,
    matches: true,
    matchHistory: true
  });

  const [errors, setErrors] = useState<ErrorStates>({
    hp: null,
    xp: null,
    tokens: null,
    activities: null,
    challenges: null,
    matches: null,
    matchHistory: null,
    subscription: null
  });

  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    connected: false,
    lastConnected: null,
    retryCount: 0,
    maxRetries: 3
  });

  const channelRef = useRef<any>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to update loading state
  const updateLoading = useCallback((key: keyof LoadingStates, value: boolean) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  }, []);

  // Helper function to update error state
  const updateError = useCallback((key: keyof ErrorStates, error: string | null) => {
    setErrors(prev => ({ ...prev, [key]: error }));
  }, []);

  // Helper function to show error toast
  const showErrorToast = useCallback((message: string, retry?: () => void) => {
    toast({
      title: "Connection Error",
      description: message,
      variant: "destructive",
    });
  }, [toast]);

  const fetchPlayerHP = useCallback(async (): Promise<void> => {
    if (!user) return;
    
    updateLoading('hp', true);
    updateError('hp', null);

    try {
      const { data, error } = await supabase
        .from('player_hp')
        .select('*')
        .eq('player_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching HP:', error);
        updateError('hp', 'Failed to load HP data');
        return;
      }

      setDashboardData(prev => ({ ...prev, playerHP: data }));
    } catch (error) {
      console.error('Error in fetchPlayerHP:', error);
      updateError('hp', 'Network error while loading HP');
    } finally {
      updateLoading('hp', false);
    }
  }, [user, updateLoading, updateError]);

  const fetchPlayerXP = useCallback(async (): Promise<void> => {
    if (!user) return;
    
    updateLoading('xp', true);
    updateError('xp', null);

    try {
      const { data, error } = await supabase
        .from('player_xp')
        .select('*')
        .eq('player_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching XP:', error);
        updateError('xp', 'Failed to load XP data');
        return;
      }

      setDashboardData(prev => ({ ...prev, playerXP: data }));
    } catch (error) {
      console.error('Error in fetchPlayerXP:', error);
      updateError('xp', 'Network error while loading XP');
    } finally {
      updateLoading('xp', false);
    }
  }, [user, updateLoading, updateError]);

  const fetchPlayerTokens = useCallback(async (): Promise<void> => {
    if (!user) return;
    
    updateLoading('tokens', true);
    updateError('tokens', null);

    try {
      const response = await supabase
        .from('profiles')
        .select('id, tokens, daily_streak, last_login, lifetime_tokens_earned')
        .eq('id', user.id)
        .single();

      if (response.error) {
        console.error('Error fetching tokens:', response.error);
        updateError('tokens', 'Failed to load token data');
        return;
      }

      const data = response.data;
      const transformedData = {
        id: data.id,
        player_id: data.id,
        regular_tokens: data.tokens || 0,
        personal_tokens: data.tokens || 0,
        monthly_subscription_tokens: 0,
        premium_tokens: 0,
        lifetime_earned: data.lifetime_tokens_earned || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setDashboardData(prev => ({ ...prev, playerTokens: transformedData }));
    } catch (error) {
      console.error('Error in fetchPlayerTokens:', error);
      updateError('tokens', 'Network error while loading tokens');
    } finally {
      updateLoading('tokens', false);
    }
  }, [user, updateLoading, updateError]);

  const fetchRecentActivities = useCallback(async (): Promise<void> => {
    if (!user) return;
    
    updateLoading('activities', true);
    updateError('activities', null);

    try {
      const recentActivities: RecentActivityItem[] = [];

      // Fetch activity logs with error handling
      const { data: activityLogs, error: activityError } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('player_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (activityError) {
        console.warn('Error fetching activity logs:', activityError);
      } else if (activityLogs) {
        activityLogs.forEach(log => {
          recentActivities.push({
            id: `activity-${log.id}`,
            activity_type: log.activity_type,
            title: log.title,
            description: log.description || `${log.activity_type} - ${log.duration_minutes ? `${log.duration_minutes} minutes` : 'Completed'}`,
            logged_at: log.created_at,
            xp_earned: log.xp_earned,
            hp_impact: log.hp_impact,
            duration_minutes: log.duration_minutes,
            score: log.score,
            opponent_name: log.opponent_name,
            location: log.location
          });
        });
      }

      // Fetch XP activities with error handling
      const { data: xpActivities, error: xpError } = await supabase
        .from('xp_activities')
        .select('*')
        .eq('player_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (xpError) {
        console.warn('Error fetching XP activities:', xpError);
      } else if (xpActivities) {
        xpActivities.forEach(xp => {
          recentActivities.push({
            id: `xp-${xp.id}`,
            activity_type: 'xp_earned',
            title: `Earned ${xp.xp_earned} XP`,
            description: xp.description || `From ${xp.activity_type}`,
            logged_at: xp.created_at,
            xp_earned: xp.xp_earned
          });
        });
      }

      // Sort and limit activities
      const sortedActivities = recentActivities
        .sort((a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime())
        .slice(0, 10);

      setDashboardData(prev => ({ ...prev, recentActivities: sortedActivities }));
    } catch (error) {
      console.error('Error in fetchRecentActivities:', error);
      updateError('activities', 'Network error while loading activities');
    } finally {
      updateLoading('activities', false);
    }
  }, [user, updateLoading, updateError]);

  const fetchMatches = useCallback(async (): Promise<void> => {
    if (!user) return;
    
    updateLoading('challenges', true);
    updateLoading('matches', true);
    updateError('challenges', null);
    updateError('matches', null);

    try {
      // Fetch matches with error handling
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select(`
          *,
          challenger:challenger_id(id, full_name, avatar_url),
          opponent:opponent_id(id, full_name, avatar_url),
          winner:winner_id(id, full_name, avatar_url)
        `)
        .or(`challenger_id.eq.${user.id},opponent_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (matchesError) {
        console.error('Error fetching matches:', matchesError);
        updateError('challenges', 'Failed to load challenges');
        updateError('matches', 'Failed to load matches');
      } else if (matchesData) {
        const pendingChallenges = matchesData.filter(match => 
          match.status === 'pending' && match.opponent_id === user.id
        );
        
        const activeMatches = matchesData.filter(match => match.status === 'accepted');

        setDashboardData(prev => ({ 
          ...prev, 
          pendingChallenges,
          activeMatches
        }));
      }
    } catch (error) {
      console.error('Error in fetchMatches:', error);
      updateError('challenges', 'Network error while loading challenges');
      updateError('matches', 'Network error while loading matches');
    } finally {
      updateLoading('challenges', false);
      updateLoading('matches', false);
    }
  }, [user, updateLoading, updateError]);

  const fetchMatchHistory = useCallback(async (): Promise<void> => {
    if (!user) return;
    
    updateLoading('matchHistory', true);
    updateError('matchHistory', null);

    try {
      const { data: completedMatches, error: historyError } = await supabase
        .from('matches')
        .select('*')
        .or(`challenger_id.eq.${user.id},opponent_id.eq.${user.id}`)
        .eq('status', 'completed');

      if (historyError) {
        console.error('Error fetching match history:', historyError);
        updateError('matchHistory', 'Failed to load match history');
      } else if (completedMatches) {
        const totalMatches = completedMatches.length;
        const wonMatches = completedMatches.filter(match => match.winner_id === user.id).length;
        const winRate = totalMatches > 0 ? Math.round((wonMatches / totalMatches) * 100) : 0;

        setDashboardData(prev => ({ 
          ...prev, 
          matchHistory: { totalMatches, winRate }
        }));
      }
    } catch (error) {
      console.error('Error in fetchMatchHistory:', error);
      updateError('matchHistory', 'Network error while loading match history');
    } finally {
      updateLoading('matchHistory', false);
    }
  }, [user, updateLoading, updateError]);

  // Enhanced refresh function with error handling
  const refreshAll = useCallback(async (): Promise<void> => {
    if (!user) return;
    
    console.log('🔄 Refreshing all dashboard data...');
    
    try {
      // Reset all errors before refresh
      setErrors({
        hp: null,
        xp: null,
        tokens: null,
        activities: null,
        challenges: null,
        matches: null,
        matchHistory: null,
        subscription: null
      });

      // Fetch all data in parallel with individual error handling
      await Promise.allSettled([
        fetchPlayerHP(),
        fetchPlayerXP(),
        fetchPlayerTokens(),
        fetchRecentActivities(),
        fetchMatches(),
        fetchMatchHistory()
      ]);
      
      console.log('✅ Dashboard refresh completed');
      
      toast({
        title: "Dashboard Updated",
        description: "All data has been refreshed successfully.",
      });
    } catch (error) {
      console.error('Error during dashboard refresh:', error);
      showErrorToast('Failed to refresh dashboard data', refreshAll);
    }
  }, [user, fetchPlayerHP, fetchPlayerXP, fetchPlayerTokens, fetchRecentActivities, fetchMatches, fetchMatchHistory, toast, showErrorToast]);

  // Enhanced subscription setup with retry logic
  const setupSubscriptions = useCallback(() => {
    if (!user || subscriptionStatus.retryCount >= subscriptionStatus.maxRetries) {
      return;
    }

    // Clear any existing timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    try {
      console.log('🔌 Setting up dashboard subscriptions...');
      
      // Clean up existing channels
      cleanupChannels();

      // Check if there are existing channels to avoid duplicates
      const existingChannels = supabase.getChannels();
      const dashboardChannels = existingChannels.filter(ch => 
        ch.topic?.includes('dashboard-') || 
        ch.topic?.includes(user.id)
      );

      if (dashboardChannels.length > 0) {
        console.log('🚨 Found existing dashboard channels, cleaning up first');
        dashboardChannels.forEach(ch => {
          supabase.removeChannel(ch);
        });
      }

      // Create single consolidated channel for all subscriptions
      const channelName = `dashboard-${user.id}-${Date.now()}`;
      const channel = supabase.channel(channelName);

      // HP updates
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'player_hp',
          filter: `player_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔄 HP real-time update:', payload);
          fetchPlayerHP();
        }
      );

      // XP updates
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'player_xp',
          filter: `player_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔄 XP real-time update:', payload);
          fetchPlayerXP();
        }
      );

      // Token updates
      channel.on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔄 Token real-time update:', payload);
          fetchPlayerTokens();
        }
      );

      // Activity updates
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs',
          filter: `player_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔄 Activity real-time update:', payload);
          fetchRecentActivities();
        }
      );

      // Match updates
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `challenger_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔄 Match real-time update:', payload);
          fetchMatches();
          fetchMatchHistory();
        }
      );

      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `opponent_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔄 Match real-time update:', payload);
          fetchMatches();
          fetchMatchHistory();
        }
      );

      // Subscribe with enhanced error handling
      channel.subscribe((status, err) => {
        console.log('📡 Dashboard subscription status:', status, err);
        
        if (status === 'SUBSCRIBED') {
          setSubscriptionStatus(prev => ({
            ...prev,
            connected: true,
            lastConnected: new Date(),
            retryCount: 0
          }));
          updateError('subscription', null);
          console.log('✅ Dashboard subscriptions active');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('❌ Subscription error:', err);
          setSubscriptionStatus(prev => ({
            ...prev,
            connected: false,
            retryCount: prev.retryCount + 1
          }));
          updateError('subscription', 'Real-time updates temporarily unavailable');
          
          // Retry with exponential backoff
          if (subscriptionStatus.retryCount < subscriptionStatus.maxRetries) {
            const retryDelay = Math.pow(2, subscriptionStatus.retryCount) * 1000; // 1s, 2s, 4s
            console.log(`🔄 Retrying subscription in ${retryDelay}ms...`);
            
            retryTimeoutRef.current = setTimeout(() => {
              setupSubscriptions();
            }, retryDelay);
          } else {
            showErrorToast(
              'Real-time updates unavailable. Data will refresh manually.',
              () => {
                setSubscriptionStatus(prev => ({ ...prev, retryCount: 0 }));
                setupSubscriptions();
              }
            );
          }
        }
      });

      channelRef.current = channel;
    } catch (error) {
      console.error('Error setting up subscriptions:', error);
      updateError('subscription', 'Failed to establish real-time connection');
      
      // Fallback to manual refresh interval
      if (!retryTimeoutRef.current) {
        retryTimeoutRef.current = setTimeout(() => {
          refreshAll();
        }, 30000); // Refresh every 30 seconds as fallback
      }
    }
  }, [user, subscriptionStatus.retryCount, subscriptionStatus.maxRetries, fetchPlayerHP, fetchPlayerXP, fetchPlayerTokens, fetchRecentActivities, fetchMatches, fetchMatchHistory, refreshAll, updateError, showErrorToast]);

  // Enhanced cleanup function
  const cleanupChannels = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    if (channelRef.current) {
      console.log('🧹 Cleaning up dashboard channel');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    setSubscriptionStatus(prev => ({
      ...prev,
      connected: false
    }));
  }, []);

  // Enhanced main effect with error boundaries
  useEffect(() => {
    if (user) {
      console.log('👤 User authenticated, initializing dashboard...');
      
      const initializeDashboard = async () => {
        try {
          // Initial data fetch
          await refreshAll();
          
          // Set up subscriptions after initial fetch
          setupSubscriptions();
        } catch (error) {
          console.error('Failed to initialize dashboard:', error);
          showErrorToast('Failed to load dashboard. Please try refreshing.', refreshAll);
        }
      };

      initializeDashboard();

      return () => {
        console.log('🧹 User logged out, cleaning up dashboard...');
        cleanupChannels();
      };
    } else {
      // Reset state when no user
      setDashboardData({
        // === Core Player Data ===
        playerHP: null,
        playerXP: null,
        playerTokens: null,
        recentActivities: [],
        pendingChallenges: [],
        activeMatches: [],
        matchHistory: null,

        // === Expanded Token System Data ===
        tokenTransactions: [],
        tokenNotifications: [],

        // === Enhanced Activity System Data ===
        xpActivities: [],
        hpActivities: [],

        // === Session Management Data ===
        userSessions: [],
        sessionParticipations: [],

        // === Notification System Data ===
        notifications: [],

        // === Club Data ===
        clubMemberships: [],
        clubActivities: [],

        // === Coaching Data ===
        appointments: [],
        coachBookings: []
      });
      
      setLoading({
        hp: false,
        xp: false,
        tokens: false,
        activities: false,
        challenges: false,
        matches: false,
        matchHistory: false
      });

      setErrors({
        hp: null,
        xp: null,
        tokens: null,
        activities: null,
        challenges: null,
        matches: null,
        matchHistory: null,
        subscription: null
      });

      cleanupChannels();
    }
  }, [user, refreshAll, setupSubscriptions, cleanupChannels, showErrorToast]);

  return {
    dashboardData,
    loading,
    errors,
    subscriptionStatus,
    refreshAll,
    // Individual refresh functions for granular control
    refreshPlayerHP: fetchPlayerHP,
    refreshPlayerXP: fetchPlayerXP,
    refreshPlayerTokens: fetchPlayerTokens,
    refreshActivities: fetchRecentActivities,
    refreshMatches: fetchMatches,
    refreshMatchHistory: fetchMatchHistory
  };
}