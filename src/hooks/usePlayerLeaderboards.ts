import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useRef } from "react";

export interface PlayerLeaderboardEntry {
  rank_position: number;
  player_id: string;
  player_name: string;
  player_avatar_url: string | null;
  current_level: number;
  total_xp_earned: number;
  current_xp: number;
  xp_to_next_level: number;
}

export function usePlayerLeaderboards(limit: number = 50, offset: number = 0) {
  const queryClient = useQueryClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const isSubscribedRef = useRef(false);

  // Main leaderboard query
  const { data: leaderboard = [], isLoading, error } = useQuery({
    queryKey: ["player_leaderboard", limit, offset],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('player_xp')
        .select(`
          player_id,
          current_level,
          total_xp_earned,
          current_xp,
          xp_to_next_level
        `)
        .order('current_level', { ascending: false })
        .order('total_xp_earned', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Get profile data separately
      const playerIds = data.map(item => item.player_id);
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', playerIds);

      if (profileError) throw profileError;

      // Create a map for quick lookup
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Transform data and add rank positions
      const transformedData: PlayerLeaderboardEntry[] = data.map((item, index) => {
        const profile = profileMap.get(item.player_id);
        return {
          rank_position: offset + index + 1,
          player_id: item.player_id,
          player_name: profile?.full_name || 'Unknown Player',
          player_avatar_url: profile?.avatar_url || null,
          current_level: item.current_level,
          total_xp_earned: item.total_xp_earned,
          current_xp: item.current_xp,
          xp_to_next_level: item.xp_to_next_level
        };
      });

      return transformedData;
    },
    staleTime: 30000, // Data is fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  // Real-time subscription for live updates
  useEffect(() => {
    const channelName = 'player_leaderboard_changes';
    
    // Check if channel already exists
    const existingChannels = supabase.getChannels();
    const existingChannel = existingChannels.find(ch => ch.topic === channelName);
    
    if (existingChannel && existingChannel.state === 'joined') {
      // Reuse existing channel
      channelRef.current = existingChannel;
      console.log('Reusing existing player leaderboard channel');
    } else {
      // Create new channel only if none exists
      if (!channelRef.current || channelRef.current.state === 'closed') {
        const channel = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'player_xp'
            },
            () => {
              console.log('Player XP data changed, refreshing leaderboard...');
              queryClient.invalidateQueries({ queryKey: ["player_leaderboard"] });
            }
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'profiles'
            },
            () => {
              console.log('Profile data changed, refreshing leaderboard...');
              queryClient.invalidateQueries({ queryKey: ["player_leaderboard"] });
            }
          );

        channelRef.current = channel;
        
        // Subscribe only if not already subscribed
        if (!isSubscribedRef.current) {
          channel.subscribe((status) => {
            console.log('Player leaderboard subscription status:', status);
            if (status === 'SUBSCRIBED') {
              isSubscribedRef.current = true;
            }
          });
        }
      }
    }

    // Cleanup on unmount
    return () => {
      if (channelRef.current && isSubscribedRef.current) {
        console.log('Cleaning up player leaderboard subscription');
        channelRef.current.unsubscribe();
        isSubscribedRef.current = false;
        channelRef.current = null;
      }
    };
  }, [queryClient]);

  return {
    leaderboard,
    isLoading,
    error,
    refresh: () => queryClient.invalidateQueries({ queryKey: ["player_leaderboard"] })
  };
}