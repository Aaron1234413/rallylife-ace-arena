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
  transaction_type: string; // Allow any string from DB
  token_type: string; // Allow any string from DB  
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
  status: string; // Allow any string from DB
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
  status: string; // Allow any string from DB
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
  // === New consolidated loading states ===
  tokenData: boolean;
  enhancedActivities: boolean;
  sessionData: boolean;
  notifications: boolean;
  clubData: boolean;
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
  // === New consolidated error states ===
  tokenData: string | null;
  enhancedActivities: string | null;
  sessionData: string | null;
  notifications: string | null;
  clubData: string | null;
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
    matchHistory: true,
    // === New consolidated loading states ===
    tokenData: true,
    enhancedActivities: true,
    sessionData: true,
    notifications: true,
    clubData: true
  });

  const [errors, setErrors] = useState<ErrorStates>({
    hp: null,
    xp: null,
    tokens: null,
    activities: null,
    challenges: null,
    matches: null,
    matchHistory: null,
    subscription: null,
    // === New consolidated error states ===
    tokenData: null,
    enhancedActivities: null,
    sessionData: null,
    notifications: null,
    clubData: null
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

  // === NEW CONSOLIDATED FETCH FUNCTIONS ===

  const fetchTokenData = useCallback(async (): Promise<void> => {
    if (!user) return;
    
    updateLoading('tokenData', true);
    updateError('tokenData', null);

    try {
      // Fetch token transactions
      const { data: transactions, error: transactionError } = await supabase
        .from('token_transactions')
        .select('*')
        .eq('player_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (transactionError) {
        console.warn('Error fetching token transactions:', transactionError);
      }

      // Fetch token redemptions 
      const { data: redemptions, error: redemptionError } = await supabase
        .from('token_redemptions')
        .select('*')
        .eq('player_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (redemptionError) {
        console.warn('Error fetching token redemptions:', redemptionError);
      }

      setDashboardData(prev => ({ 
        ...prev, 
        tokenTransactions: transactions || [],
        // Initialize with empty notifications - will be populated by real-time events
        tokenNotifications: []
      }));
    } catch (error) {
      console.error('Error in fetchTokenData:', error);
      updateError('tokenData', 'Network error while loading token data');
    } finally {
      updateLoading('tokenData', false);
    }
  }, [user, updateLoading, updateError]);

  const fetchEnhancedActivities = useCallback(async (): Promise<void> => {
    if (!user) return;
    
    updateLoading('enhancedActivities', true);
    updateError('enhancedActivities', null);

    try {
      // Fetch XP activities
      const { data: xpActivities, error: xpError } = await supabase
        .from('xp_activities')
        .select('*')
        .eq('player_id', user.id)
        .order('created_at', { ascending: false })
        .limit(15);

      if (xpError) {
        console.warn('Error fetching XP activities:', xpError);
      }

      // Fetch HP activities
      const { data: hpActivities, error: hpError } = await supabase
        .from('hp_activities')
        .select('*')
        .eq('player_id', user.id)
        .order('created_at', { ascending: false })
        .limit(15);

      if (hpError) {
        console.warn('Error fetching HP activities:', hpError);
      }

      setDashboardData(prev => ({ 
        ...prev, 
        xpActivities: xpActivities || [],
        hpActivities: hpActivities || []
      }));
    } catch (error) {
      console.error('Error in fetchEnhancedActivities:', error);
      updateError('enhancedActivities', 'Network error while loading enhanced activities');
    } finally {
      updateLoading('enhancedActivities', false);
    }
  }, [user, updateLoading, updateError]);

  const fetchSessionData = useCallback(async (): Promise<void> => {
    if (!user) return;
    
    updateLoading('sessionData', true);
    updateError('sessionData', null);

    try {
      // For now, use mock data since session tables aren't fully implemented
      const mockSessions: Session[] = [];
      const mockParticipations: SessionParticipation[] = [];

      setDashboardData(prev => ({ 
        ...prev, 
        userSessions: mockSessions,
        sessionParticipations: mockParticipations
      }));
    } catch (error) {
      console.error('Error in fetchSessionData:', error);
      updateError('sessionData', 'Network error while loading session data');
    } finally {
      updateLoading('sessionData', false);
    }
  }, [user, updateLoading, updateError]);

  const fetchNotifications = useCallback(async (): Promise<void> => {
    if (!user) return;
    
    updateLoading('notifications', true);
    updateError('notifications', null);

    try {
      // Fetch match notifications
      const { data: notifications, error: notificationsError } = await supabase
        .from('match_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (notificationsError) {
        console.warn('Error fetching notifications:', notificationsError);
      }

      setDashboardData(prev => ({ 
        ...prev, 
        notifications: notifications || []
      }));
    } catch (error) {
      console.error('Error in fetchNotifications:', error);
      updateError('notifications', 'Network error while loading notifications');
    } finally {
      updateLoading('notifications', false);
    }
  }, [user, updateLoading, updateError]);

  const fetchClubData = useCallback(async (): Promise<void> => {
    if (!user) return;
    
    updateLoading('clubData', true);
    updateError('clubData', null);

    try {
      // Fetch user's club memberships
      const { data: memberships, error: membershipsError } = await supabase
        .from('club_memberships')
        .select(`
          *,
          club:clubs(
            id,
            name,
            description,
            logo_url,
            is_public
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('joined_at', { ascending: false });

      if (membershipsError) {
        console.warn('Error fetching club memberships:', membershipsError);
      }

      // Fetch club activities for user's clubs
      let clubActivities: ClubActivityItem[] = [];
      if (memberships && memberships.length > 0) {
        const clubIds = memberships.map(m => m.club_id);
        const { data: activities, error: activitiesError } = await supabase
          .from('club_activity_stream')
          .select(`
            *,
            user:profiles(
              id,
              full_name,
              avatar_url
            )
          `)
          .in('club_id', clubIds)
          .eq('is_public', true)
          .order('created_at', { ascending: false })
          .limit(20);

        if (activitiesError) {
          console.warn('Error fetching club activities:', activitiesError);
        } else {
          clubActivities = activities || [];
        }
      }

      setDashboardData(prev => ({ 
        ...prev, 
        clubMemberships: memberships || [],
        clubActivities
      }));
    } catch (error) {
      console.error('Error in fetchClubData:', error);
      updateError('clubData', 'Network error while loading club data');
    } finally {
      updateLoading('clubData', false);
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
        subscription: null,
        // === New consolidated error states ===
        tokenData: null,
        enhancedActivities: null,
        sessionData: null,
        notifications: null,
        clubData: null
      });

      // Fetch all data in parallel with individual error handling
      await Promise.allSettled([
        // === Core data fetching ===
        fetchPlayerHP(),
        fetchPlayerXP(),
        fetchPlayerTokens(),
        fetchRecentActivities(),
        fetchMatches(),
        fetchMatchHistory(),
        // === NEW consolidated data fetching ===
        fetchTokenData(),
        fetchEnhancedActivities(),
        fetchSessionData(),
        fetchNotifications(),
        fetchClubData()
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
  }, [user, fetchPlayerHP, fetchPlayerXP, fetchPlayerTokens, fetchRecentActivities, fetchMatches, fetchMatchHistory, fetchTokenData, fetchEnhancedActivities, fetchSessionData, fetchNotifications, fetchClubData, toast, showErrorToast]);

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

      // === NEW CONSOLIDATED LISTENERS ===

      // Token system listeners
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'token_transactions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔄 Token transaction update:', payload);
          fetchTokenData();
          fetchPlayerTokens(); // Keep existing token balance sync
        }
      );

      // XP activities listener
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'xp_activities',
          filter: `player_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔄 XP activity update:', payload);
          fetchEnhancedActivities();
        }
      );

      // HP activities listener
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'hp_activities',
          filter: `player_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔄 HP activity update:', payload);
          fetchEnhancedActivities();
        }
      );

      // Sessions listener (when available)
      // Note: sessions table schema needs verification
      /*
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions',
          filter: `creator_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔄 Session update:', payload);
          fetchSessionData();
        }
      );
      */

      // Match notifications listener
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'match_notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔄 Match notification update:', payload);
          fetchNotifications();
        }
      );

      // Club memberships listener
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'club_memberships',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔄 Club membership update:', payload);
          fetchClubData();
        }
      );

      // Club activity stream listener
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'club_activity_stream'
        },
        (payload) => {
          console.log('🔄 Club activity update:', payload);
          // Only refresh if user is member of the club
          const clubIds = dashboardData.clubMemberships.map(m => m.club_id);
          if (payload.new && clubIds.includes(payload.new.club_id)) {
            fetchClubData();
          }
        }
      );

      // Appointments listener
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `player_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔄 Appointment update:', payload);
          fetchNotifications(); // Appointments affect notifications
        }
      );

      // Coach bookings listener (if user is a coach)
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'coach_bookings',
          filter: `coach_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔄 Coach booking update:', payload);
          fetchNotifications(); // Bookings affect notifications
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
        matchHistory: false,
        // === New consolidated loading states ===
        tokenData: false,
        enhancedActivities: false,
        sessionData: false,
        notifications: false,
        clubData: false
      });

      setErrors({
        hp: null,
        xp: null,
        tokens: null,
        activities: null,
        challenges: null,
        matches: null,
        matchHistory: null,
        subscription: null,
        // === New consolidated error states ===
        tokenData: null,
        enhancedActivities: null,
        sessionData: null,
        notifications: null,
        clubData: null
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
    refreshMatchHistory: fetchMatchHistory,
    // === NEW consolidated refresh functions ===
    refreshTokenData: fetchTokenData,
    refreshEnhancedActivities: fetchEnhancedActivities,
    refreshSessionData: fetchSessionData,
    refreshNotifications: fetchNotifications,
    refreshClubData: fetchClubData
  };
}