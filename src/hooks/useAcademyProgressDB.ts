import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export interface AcademyProgress {
  id: string;
  player_id: string;
  level: number;
  level_name: string;
  total_xp: number;
  daily_tokens_earned: number;
  daily_streak: number;
  quizzes_completed: number;
  last_activity: string;
  is_onboarding_completed: boolean;
  placement_quiz_completed: boolean;
  created_at: string;
  updated_at: string;
}

export function useAcademyProgressDB() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Get current academy progress
  const { data: progress, isLoading, error } = useQuery({
    queryKey: ["academy_progress"],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("academy_progress")
        .select("*")
        .eq("player_id", user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching academy progress:', error);
        throw error;
      }
      
      // If no record found, auto-initialize
      if (!data) {
        const { error: initError } = await supabase.rpc('initialize_academy_progress', {
          user_id: user.id
        });
        
        if (initError) {
          console.error('Error initializing academy progress:', initError);
          throw initError;
        }
        
        // Fetch the newly created record
        const { data: newData, error: fetchError } = await supabase
          .from("academy_progress")
          .select("*")
          .eq("player_id", user.id)
          .single();
          
        if (fetchError) throw fetchError;
        return newData as AcademyProgress;
      }
      
      return data as AcademyProgress;
    },
    enabled: !!user,
  });

  // Complete onboarding
  const completeOnboardingMutation = useMutation({
    mutationFn: async (startingLevel: number) => {
      if (!user) throw new Error("Not authenticated");
      
      const { error } = await supabase.rpc('complete_academy_onboarding', {
        user_id: user.id,
        starting_level: startingLevel
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academy_progress"] });
      toast({
        title: "Welcome to RAKO Academy!",
        description: "Your learning journey begins now!",
      });
    },
    onError: (error: any) => {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update progress (XP gain, quiz completion, etc.)
  const updateProgressMutation = useMutation({
    mutationFn: async ({
      xpGained = 0,
      tokensGained = 0,
      quizCompleted = false
    }: {
      xpGained?: number;
      tokensGained?: number;
      quizCompleted?: boolean;
    }) => {
      if (!user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase.rpc('update_academy_progress', {
        user_id: user.id,
        xp_gained: xpGained,
        tokens_gained: tokensGained,
        quiz_completed: quizCompleted
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (result: any) => {
      queryClient.invalidateQueries({ queryKey: ["academy_progress"] });
      
      if (result?.level_up) {
        toast({
          title: "Level Up!",
          description: `Congratulations! You've reached level ${result.new_level}!`,
        });
      }
      
      if (result?.xp_gained > 0) {
        toast({
          title: "XP Earned!",
          description: `+${result.xp_gained} XP earned`,
        });
      }
    },
    onError: (error: any) => {
      console.error('Error updating academy progress:', error);
      toast({
        title: "Error",
        description: "Failed to update progress. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Calculate daily streak
  const calculateStreak = (lastActivity: string): number => {
    if (!lastActivity) return 0;
    
    const today = new Date();
    const lastDate = new Date(lastActivity);
    const diffTime = today.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // If last activity was today or yesterday, maintain streak
    if (diffDays <= 1) {
      return progress?.daily_streak || 1;
    }
    
    // Otherwise reset streak
    return 0;
  };

  // Enhanced progress object with computed values
  const enhancedProgress = progress ? {
    ...progress,
    levelName: progress.level_name,
    totalXP: progress.total_xp,
    dailyTokensEarned: progress.daily_tokens_earned,
    dailyStreak: calculateStreak(progress.last_activity),
    quizzesCompleted: progress.quizzes_completed,
    lastActivity: progress.last_activity,
    onboardingCompleted: progress.is_onboarding_completed
  } : null;

  return {
    progress: enhancedProgress,
    isCompleted: progress?.is_onboarding_completed || false,
    isLoading,
    error,
    completeOnboarding: completeOnboardingMutation.mutate,
    updateProgress: updateProgressMutation.mutate,
    isCompletingOnboarding: completeOnboardingMutation.isPending,
    isUpdatingProgress: updateProgressMutation.isPending,
  };
}
