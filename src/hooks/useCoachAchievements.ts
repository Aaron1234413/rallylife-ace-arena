
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CoachAchievement {
  id: string;
  name: string;
  description: string;
  category: string;
  tier: string;
  requirement_type: string;
  requirement_value: number;
  reward_cxp: number;
  reward_tokens: number;
  reward_special?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CoachAchievementUnlocked {
  id: string;
  achievement_id: string;
  coach_id: string;
  unlocked_at: string;
  is_claimed: boolean;
  claimed_at: string | null;
}

export interface CoachAchievementProgress {
  id: string;
  achievement_id: string;
  coach_id: string;
  current_progress: number;
  last_updated: string;
}

export function useCoachAchievements() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // All possible coach achievements
  const { data: achievements = [], isLoading: achievementsLoading } = useQuery({
    queryKey: ["coach_achievements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coach_achievements")
        .select("*")
        .eq("is_active", true)
        .order("category", { ascending: true })
        .order("requirement_value", { ascending: true });
      if (error) throw error;
      return data as CoachAchievement[];
    },
  });

  // Unlocked achievements for current coach
  const { data: unlocked = [], isLoading: unlockedLoading } = useQuery({
    queryKey: ["coach_achievements_unlocked"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coach_achievements_unlocked")
        .select("*")
        .order("unlocked_at", { ascending: true });
      if (error) throw error;
      return data as CoachAchievementUnlocked[];
    },
  });

  // Progress per achievement for this coach
  const { data: progress = [], isLoading: progressLoading } = useQuery({
    queryKey: ["coach_achievement_progress"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coach_achievement_progress")
        .select("*")
        .order("last_updated", { ascending: false });
      if (error) throw error;
      return data as CoachAchievementProgress[];
    },
  });

  // Check all achievements for progress updates
  const checkAllAchievements = useMutation({
    mutationFn: async () => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error("Not authenticated");
      
      // Use generic rpc call
      const { data, error } = await supabase.rpc('check_all_coach_achievements' as any, {
        user_id: user.data.user.id
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      if (data?.newly_unlocked > 0) {
        toast({
          title: "New Achievement Unlocked!",
          description: `You've unlocked ${data.newly_unlocked} new achievement${data.newly_unlocked > 1 ? 's' : ''}!`,
        });
      }
      // Refetch achievement data
      queryClient.invalidateQueries({ queryKey: ["coach_achievements_unlocked"] });
      queryClient.invalidateQueries({ queryKey: ["coach_achievement_progress"] });
    },
  });

  // Claim achievement reward
  const claimReward = useMutation({
    mutationFn: async (achievementId: string) => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error("Not authenticated");
      
      // Use generic rpc call
      const { data, error } = await supabase.rpc('claim_coach_achievement_reward' as any, {
        user_id: user.data.user.id,
        achievement_id: achievementId,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data: any, achievementId) => {
      toast({
        title: "Reward Claimed!",
        description: `You received ${data?.cxp_earned || 0} CXP and ${data?.tokens_earned || 0} CTK for ${data?.achievement_name || 'achievement'}`,
      });
      // Refetch achievement data and other stats
      queryClient.invalidateQueries({ queryKey: ["coach_achievements_unlocked"] });
      queryClient.invalidateQueries({ queryKey: ["coach_cxp"] });
      queryClient.invalidateQueries({ queryKey: ["coach_tokens"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to claim reward",
        variant: "destructive",
      });
    },
  });

  return {
    achievements,
    unlocked,
    progress,
    loading: achievementsLoading || unlockedLoading || progressLoading,
    checkAllAchievements: checkAllAchievements.mutate,
    claimReward: claimReward.mutate,
    isCheckingAchievements: checkAllAchievements.isPending,
    isClaimingReward: claimReward.isPending,
  };
}
