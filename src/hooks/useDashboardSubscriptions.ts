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

  // Helper function to check if channel already exists
  const getOrCreateChannel = (topic: string) => {
    const existingChannels = supabase.getChannels();
    let channel = existingChannels.find(ch => ch.topic === topic);
    
    if (!channel) {
      channel = supabase.channel(topic);
      channelsRef.current.push(topic);
    }
    
    return channel;
  };

  // Trigger data updates
  const triggerUpdate = (type: keyof DashboardData) => {
    setDashboardData(prev => ({
      ...prev,
      [type]: type === 'profileUpdated' ? Date.now() : prev[type]
    }));
  };

  useEffect(() => {
    if (!user || subscribedRef.current) return;

    subscribedRef.current = true;

    try {
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
    }

    // Cleanup function
    return () => {
      if (channelsRef.current.length > 0) {
        const existingChannels = supabase.getChannels();
        
        // Remove channels that match our patterns
        existingChannels.forEach(channel => {
          if (channelsRef.current.includes(channel.topic)) {
            supabase.removeChannel(channel);
          }
        });
        
        channelsRef.current = [];
      }
      subscribedRef.current = false;
    };
  }, [user]);

  // Also cleanup on user change
  useEffect(() => {
    return () => {
      if (channelsRef.current.length > 0) {
        const existingChannels = supabase.getChannels();
        
        existingChannels.forEach(channel => {
          if (channelsRef.current.includes(channel.topic)) {
            supabase.removeChannel(channel);
          }
        });
        
        channelsRef.current = [];
      }
      subscribedRef.current = false;
    };
  }, []);

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
    }
  };
}