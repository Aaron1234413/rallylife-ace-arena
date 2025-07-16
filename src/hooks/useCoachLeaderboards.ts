
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef } from "react";

export interface CoachLeaderboardEntry {
  rank_position: number;
  coach_id: string;
  coach_name: string;
  coach_avatar_url: string | null;
  score_value: number;
  metadata: any;
  calculated_at: string;
}

export interface LeaderboardCalculationResult {
  success: boolean;
  leaderboard_type: string;
  period_type: string;
  period_start: string | null;
  period_end: string | null;
  entries_created: number;
  calculated_at: string;
}

export interface SimpleCoachLeaderboardEntry {
  rank_position: number;
  coach_id: string;
  coach_name: string;
  coach_avatar_url: string | null;
  current_level: number;
  total_cxp_earned: number;
  current_cxp: number;
  cxp_to_next_level: number;
  coaching_tier: string;
}

export function useCoachLeaderboards() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const isSubscribedRef = useRef(false);

  // Simplified CXP-based leaderboard for live pulse
  const getCXPLeaderboard = (limit: number = 50, offset: number = 0) => {
    return useQuery({
      queryKey: ["coach_cxp_leaderboard", limit, offset],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('coach_cxp')
          .select(`
            coach_id,
            current_level,
            total_cxp_earned,
            current_cxp,
            cxp_to_next_level,
            coaching_tier
          `)
          .order('current_level', { ascending: false })
          .order('total_cxp_earned', { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) throw error;

        // Get profile data separately
        const coachIds = data.map(item => item.coach_id);
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', coachIds);

        if (profileError) throw profileError;

        // Create a map for quick lookup
        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

        // Transform data and add rank positions
        const transformedData: SimpleCoachLeaderboardEntry[] = data.map((item, index) => {
          const profile = profileMap.get(item.coach_id);
          return {
            rank_position: offset + index + 1,
            coach_id: item.coach_id,
            coach_name: profile?.full_name || 'Unknown Coach',
            coach_avatar_url: profile?.avatar_url || null,
            current_level: item.current_level,
            total_cxp_earned: item.total_cxp_earned,
            current_cxp: item.current_cxp,
            cxp_to_next_level: item.cxp_to_next_level,
            coaching_tier: item.coaching_tier
          };
        });

        return transformedData;
      },
      staleTime: 30000, // Data is fresh for 30 seconds
      gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    });
  };

  // Get leaderboard data (existing complex leaderboard)
  const getLeaderboard = (
    leaderboardType: string = 'overall',
    periodType: string = 'all_time',
    limit: number = 50,
    offset: number = 0
  ) => {
    return useQuery({
      queryKey: ["coach_leaderboard", leaderboardType, periodType, limit, offset],
      queryFn: async () => {
        const { data, error } = await supabase.rpc('get_coach_leaderboard', {
          leaderboard_type: leaderboardType,
          period_type: periodType,
          limit_count: limit,
          offset_count: offset
        });
        if (error) throw error;
        return data as CoachLeaderboardEntry[];
      },
    });
  };

  // Real-time subscription for CXP leaderboard
  useEffect(() => {
    const channelName = 'coach_leaderboard_changes';
    
    // Check if channel already exists
    const existingChannels = supabase.getChannels();
    const existingChannel = existingChannels.find(ch => ch.topic === channelName);
    
    if (existingChannel && existingChannel.state === 'joined') {
      // Reuse existing channel
      channelRef.current = existingChannel;
      console.log('Reusing existing coach leaderboard channel');
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
              table: 'coach_cxp'
            },
            () => {
              console.log('Coach CXP data changed, refreshing leaderboard...');
              queryClient.invalidateQueries({ queryKey: ["coach_cxp_leaderboard"] });
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
              console.log('Profile data changed, refreshing coach leaderboard...');
              queryClient.invalidateQueries({ queryKey: ["coach_cxp_leaderboard"] });
            }
          );

        channelRef.current = channel;
        
        // Subscribe only if not already subscribed
        if (!isSubscribedRef.current) {
          channel.subscribe((status) => {
            console.log('Coach leaderboard subscription status:', status);
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
        console.log('Cleaning up coach leaderboard subscription');
        channelRef.current.unsubscribe();
        isSubscribedRef.current = false;
        channelRef.current = null;
      }
    };
  }, [queryClient]);

  // Calculate/refresh leaderboards
  const calculateLeaderboards = useMutation({
    mutationFn: async ({
      leaderboardType = 'all',
      periodType = 'all_time'
    }: {
      leaderboardType?: string;
      periodType?: string;
    }) => {
      const { data, error } = await supabase.rpc('calculate_coach_leaderboards', {
        leaderboard_type: leaderboardType,
        period_type: periodType
      });
      if (error) throw error;
      return data as unknown as LeaderboardCalculationResult;
    },
    onSuccess: (data) => {
      toast({
        title: "Leaderboards Updated",
        description: `Successfully calculated ${data.entries_created} leaderboard entries`,
      });
      // Invalidate all leaderboard queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["coach_leaderboard"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to calculate leaderboards",
        variant: "destructive",
      });
    },
  });

  return {
    getLeaderboard,
    getCXPLeaderboard,
    calculateLeaderboards: calculateLeaderboards.mutate,
    isCalculating: calculateLeaderboards.isPending,
    refresh: () => queryClient.invalidateQueries({ queryKey: ["coach_cxp_leaderboard"] })
  };
}
