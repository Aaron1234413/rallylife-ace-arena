
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

export function useCoachLeaderboards() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get leaderboard data
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
    calculateLeaderboards: calculateLeaderboards.mutate,
    isCalculating: calculateLeaderboards.isPending,
  };
}
