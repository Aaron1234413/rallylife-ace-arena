import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface DashboardData {
  playerHP: any | null;
  playerXP: any | null;
  playerTokens: any | null;
  recentActivities: any[];
  pendingChallenges: any[];
  activeMatches: any[];
  profileUpdated: number; // timestamp for triggering refetches
}

export function useDashboardSubscriptions() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    playerHP: null,
    playerXP: null,
    playerTokens: null,
    recentActivities: [],
    pendingChallenges: [],
    activeMatches: [],
    profileUpdated: 0,
  });

  const channelsRef = useRef<string[]>([]);
  const subscribedRef = useRef(false);
  const mountCountRef = useRef(0);
  const cleanupInProgressRef = useRef(false);

  // StrictMode-compatible subscription state tracking
  const subscriptionStateRef = useRef({
    isInitialized: false,
    subscriptionAttempts: 0,
    lastUserId: '',
    activeChannels: new Set<string>()
  });

  // StrictMode-compatible channel creation with idempotent operations
  const getOrCreateChannel = (topic: string) => {
    // Prevent duplicate channels during StrictMode double-mounting
    if (subscriptionStateRef.current.activeChannels.has(topic)) {
      const existingChannels = supabase.getChannels();
      const existingChannel = existingChannels.find(ch => ch.topic === topic);
      if (existingChannel) {
        console.log(`StrictMode: Reusing existing channel: ${topic}`);
        return existingChannel;
      }
    }

    const existingChannels = supabase.getChannels();
    let channel = existingChannels.find(ch => ch.topic === topic);
    
    if (channel) {
      console.log(`Reusing existing channel: ${topic}`);
      subscriptionStateRef.current.activeChannels.add(topic);
      if (!channelsRef.current.includes(topic)) {
        channelsRef.current.push(topic);
      }
      return channel;
    }
    
    console.log(`Creating new channel: ${topic}`);
    channel = supabase.channel(topic);
    channelsRef.current.push(topic);
    subscriptionStateRef.current.activeChannels.add(topic);
    return channel;
  };

  // StrictMode-compatible cleanup with idempotent operations
  const cleanupChannels = () => {
    // Prevent concurrent cleanup operations
    if (cleanupInProgressRef.current) {
      console.log('Cleanup already in progress, skipping...');
      return;
    }

    cleanupInProgressRef.current = true;

    try {
      const existingChannels = supabase.getChannels();
      console.log(`StrictMode cleanup: Found ${existingChannels.length} existing channels`);
      
      // Clean up channels from our current session
      const channelsToRemove = [...channelsRef.current];
      channelsToRemove.forEach(topic => {
        const channelToRemove = existingChannels.find(ch => ch.topic === topic);
        if (channelToRemove) {
          console.log(`Removing tracked channel: ${topic}`);
          supabase.removeChannel(channelToRemove);
        }
      });
      
      // Clean up any orphaned dashboard channels with pattern matching
      existingChannels.forEach(channel => {
        const topic = channel.topic;
        
        // Pattern matching for dashboard-related channels
        const isDashboardChannel = 
          topic.includes('player_hp_') || 
          topic.includes('player_xp_') || 
          topic.includes('xp_activities_') ||
          topic.includes('hp_activities_') ||
          topic.includes('activity_logs_') ||
          topic.includes('challenges_challenger_') ||
          topic.includes('challenges_challenged_') ||
          topic.includes('token_balances_') ||
          topic.includes('profiles_') ||
          topic.includes('tokens-') ||
          topic.includes('hp-updates-') ||
          topic.includes('xp-') ||
          topic.includes('activity_logs_changes_') ||
          topic.includes('xp_activities_changes_') ||
          topic.includes('hp_activities_changes_') ||
          topic.includes('challenges_changes_') ||
          topic.includes('challenged_changes_');
          
        if (isDashboardChannel) {
          console.log(`Removing orphaned dashboard channel: ${topic}`);
          supabase.removeChannel(channel);
        }
      });
      
      // Reset all state
      channelsRef.current = [];
      subscriptionStateRef.current.activeChannels.clear();
      subscriptionStateRef.current.isInitialized = false;
      console.log('StrictMode-compatible cleanup completed');
      
    } catch (error) {
      console.error('Error during StrictMode cleanup:', error);
      // Force clear the tracking arrays even if cleanup fails
      channelsRef.current = [];
      subscriptionStateRef.current.activeChannels.clear();
      subscriptionStateRef.current.isInitialized = false;
    } finally {
      cleanupInProgressRef.current = false;
    }
  };

  // Trigger data updates
  const triggerUpdate = (type: keyof DashboardData) => {
    setDashboardData(prev => ({
      ...prev,
      [type]: type === 'profileUpdated' ? Date.now() : prev[type]
    }));
  };

  useEffect(() => {
    mountCountRef.current += 1;
    const currentMount = mountCountRef.current;
    console.log(`StrictMode: Dashboard subscriptions mount #${currentMount} for user:`, user?.id);

    if (!user) {
      console.log('No user - cleaning up and skipping subscription setup');
      cleanupChannels();
      subscribedRef.current = false;
      return;
    }

    // StrictMode-compatible subscription guard
    if (subscribedRef.current && 
        subscriptionStateRef.current.isInitialized && 
        subscriptionStateRef.current.lastUserId === user.id) {
      console.log(`StrictMode: Subscriptions already active for user ${user.id}, skipping duplicate setup`);
      return;
    }

    // Prevent duplicate subscriptions during rapid re-mounts
    if (subscriptionStateRef.current.lastUserId === user.id && 
        subscriptionStateRef.current.subscriptionAttempts > 0 &&
        (Date.now() - subscriptionStateRef.current.subscriptionAttempts) < 1000) {
      console.log('StrictMode: Preventing rapid re-subscription, using existing setup');
      return;
    }

    console.log(`StrictMode: Setting up dashboard subscriptions for user: ${user.id}`);
    
    // Update subscription state
    subscribedRef.current = true;
    subscriptionStateRef.current.isInitialized = true;
    subscriptionStateRef.current.lastUserId = user.id;
    subscriptionStateRef.current.subscriptionAttempts = Date.now();

    try {
      // Clean up any existing channels first to prevent conflicts
      cleanupChannels();
      // Player HP subscription
      const hpChannel = getOrCreateChannel(`player_hp_${user.id}`);
      hpChannel
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'player_hp',
            filter: `player_id=eq.${user.id}`
          },
          () => triggerUpdate('playerHP')
        )
        .subscribe();

      // Player XP subscription
      const xpChannel = getOrCreateChannel(`player_xp_${user.id}`);
      xpChannel
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'player_xp',
            filter: `player_id=eq.${user.id}`
          },
          () => triggerUpdate('playerXP')
        )
        .subscribe();

      // XP Activities subscription
      const xpActivitiesChannel = getOrCreateChannel(`xp_activities_${user.id}`);
      xpActivitiesChannel
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'xp_activities',
            filter: `player_id=eq.${user.id}`
          },
          () => triggerUpdate('recentActivities')
        )
        .subscribe();

      // HP Activities subscription
      const hpActivitiesChannel = getOrCreateChannel(`hp_activities_${user.id}`);
      hpActivitiesChannel
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'hp_activities',
            filter: `player_id=eq.${user.id}`
          },
          () => triggerUpdate('recentActivities')
        )
        .subscribe();

      // Activity Logs subscription
      const activityChannel = getOrCreateChannel(`activity_logs_${user.id}`);
      activityChannel
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'activity_logs',
            filter: `player_id=eq.${user.id}`
          },
          () => triggerUpdate('recentActivities')
        )
        .subscribe();

      // Challenges subscription (as challenger)
      const challengesChannel = getOrCreateChannel(`challenges_challenger_${user.id}`);
      challengesChannel
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'challenges',
            filter: `challenger_id=eq.${user.id}`
          },
          () => {
            triggerUpdate('pendingChallenges');
            triggerUpdate('activeMatches');
            triggerUpdate('recentActivities');
          }
        )
        .subscribe();

      // Challenges subscription (as challenged)
      const challengedChannel = getOrCreateChannel(`challenges_challenged_${user.id}`);
      challengedChannel
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'challenges',
            filter: `challenged_id=eq.${user.id}`
          },
          () => {
            triggerUpdate('pendingChallenges');
            triggerUpdate('activeMatches');
            triggerUpdate('recentActivities');
          }
        )
        .subscribe();

      // Token Balances subscription
      const tokensChannel = getOrCreateChannel(`token_balances_${user.id}`);
      tokensChannel
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'token_balances',
            filter: `player_id=eq.${user.id}`
          },
          () => triggerUpdate('playerTokens')
        )
        .subscribe();

      // Profiles subscription
      const profilesChannel = getOrCreateChannel(`profiles_${user.id}`);
      profilesChannel
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`
          },
          () => triggerUpdate('profileUpdated')
        )
        .subscribe();

    } catch (error) {
      console.error('StrictMode: Error setting up dashboard subscriptions:', error);
      subscribedRef.current = false;
      subscriptionStateRef.current.isInitialized = false;
      cleanupChannels();
    }

    // StrictMode-compatible cleanup function
    return () => {
      console.log(`StrictMode: Cleaning up dashboard subscriptions (mount #${currentMount})`);
      
      // Only cleanup if this is the current mount
      if (currentMount === mountCountRef.current) {
        cleanupChannels();
        subscribedRef.current = false;
      } else {
        console.log(`StrictMode: Skipping cleanup for old mount #${currentMount}, current is #${mountCountRef.current}`);
      }
    };
  }, [user]);

  // StrictMode-compatible cleanup on component unmount
  useEffect(() => {
    return () => {
      console.log('StrictMode: Component unmount - performing final cleanup');
      cleanupChannels();
      subscribedRef.current = false;
      mountCountRef.current = 0;
    };
  }, []);

  // StrictMode-compatible user change handling
  useEffect(() => {
    if (!user) {
      console.log('StrictMode: User logged out - cleaning up all dashboard subscriptions');
      cleanupChannels();
      subscribedRef.current = false;
      subscriptionStateRef.current.isInitialized = false;
    }
  }, [user]);

  // StrictMode-compatible emergency cleanup function
  const emergencyCleanup = () => {
    console.log('StrictMode: Emergency cleanup initiated');
    try {
      const allChannels = supabase.getChannels();
      allChannels.forEach(channel => {
        console.log(`Force removing channel: ${channel.topic}`);
        supabase.removeChannel(channel);
      });
      
      // Reset all state
      channelsRef.current = [];
      subscribedRef.current = false;
      subscriptionStateRef.current.isInitialized = false;
      subscriptionStateRef.current.activeChannels.clear();
      subscriptionStateRef.current.lastUserId = '';
      mountCountRef.current = 0;
      
      console.log('StrictMode: Emergency cleanup completed');
    } catch (error) {
      console.error('StrictMode: Error in emergency cleanup:', error);
    }
  };

  return {
    dashboardData,
    triggerUpdate,
    refreshAll: () => {
      triggerUpdate('playerHP');
      triggerUpdate('playerXP');
      triggerUpdate('playerTokens');
      triggerUpdate('recentActivities');
      triggerUpdate('pendingChallenges');
      triggerUpdate('activeMatches');
      triggerUpdate('profileUpdated');
    },
    emergencyCleanup, // StrictMode-compatible emergency cleanup
    isSubscribed: subscribedRef.current,
    channelCount: () => channelsRef.current.length,
    subscriptionState: subscriptionStateRef.current, // Expose for debugging
    mountCount: mountCountRef.current // Expose mount count for StrictMode debugging
  };
}