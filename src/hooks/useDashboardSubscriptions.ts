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

  // Helper function to check if channel already exists and reuse it
  const getOrCreateChannel = (topic: string) => {
    const existingChannels = supabase.getChannels();
    let channel = existingChannels.find(ch => ch.topic === topic);
    
    if (channel) {
      console.log(`Reusing existing channel: ${topic}`);
      return channel;
    }
    
    console.log(`Creating new channel: ${topic}`);
    channel = supabase.channel(topic);
    channelsRef.current.push(topic);
    return channel;
  };

  // Comprehensive channel cleanup with pattern matching
  const cleanupChannels = () => {
    try {
      const existingChannels = supabase.getChannels();
      console.log(`Found ${existingChannels.length} existing channels, cleaning up dashboard channels...`);
      
      // Clean up channels from our current session
      channelsRef.current.forEach(topic => {
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
      
      channelsRef.current = [];
      console.log('Dashboard channels cleanup completed');
      
    } catch (error) {
      console.error('Error during channel cleanup:', error);
      // Force clear the tracking array even if cleanup fails
      channelsRef.current = [];
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
    // Prevent duplicate subscriptions
    if (subscribedRef.current) {
      console.log('Dashboard subscriptions already active');
      return;
    }

    console.log('Setting up dashboard subscriptions for user:', user.id);
    subscribedRef.current = true;

    try {
      // Clean up any existing channels first
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
      console.error('Error setting up dashboard subscriptions:', error);
      subscribedRef.current = false;
      cleanupChannels();
    }

    // Cleanup function
    return () => {
      console.log('Cleaning up dashboard subscriptions');
      cleanupChannels();
      subscribedRef.current = false;
    };
  }, [user]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      console.log('Component unmount - performing comprehensive dashboard cleanup');
      cleanupChannels();
      subscribedRef.current = false;
    };
  }, []);

  // Enhanced cleanup on user change
  useEffect(() => {
    if (!user) {
      console.log('User logged out - cleaning up all dashboard subscriptions');
      cleanupChannels();
      subscribedRef.current = false;
    }
  }, [user]);

  // Emergency cleanup function for external use
  const emergencyCleanup = () => {
    console.log('Emergency cleanup initiated');
    try {
      const allChannels = supabase.getChannels();
      allChannels.forEach(channel => {
        console.log(`Force removing channel: ${channel.topic}`);
        supabase.removeChannel(channel);
      });
      channelsRef.current = [];
      subscribedRef.current = false;
      console.log('Emergency cleanup completed');
    } catch (error) {
      console.error('Error in emergency cleanup:', error);
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
    emergencyCleanup, // Expose emergency cleanup for debugging
    isSubscribed: subscribedRef.current,
    channelCount: () => channelsRef.current.length
  };
}