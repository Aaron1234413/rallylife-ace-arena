
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

  return {
    achievements,
    unlocked,
    progress,
    loading: achievementsLoading || unlockedLoading || progressLoading,
  };
}
