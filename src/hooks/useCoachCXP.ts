import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CoachCXP {
  id: string;
  coach_id: string;
  current_cxp: number;
  total_cxp_earned: number;
  current_level: number;
  cxp_to_next_level: number;
  coaching_tier: string;
  commission_rate: number;
  tools_unlocked: string[];
  certifications_unlocked: string[];
  created_at: string;
  updated_at: string;
}

export interface CXPActivity {
  id: string;
  coach_id: string;
  activity_type: string;
  cxp_earned: number;
  description: string;
  source_player_id?: string;
  metadata?: any;
  created_at: string;
}

export function useCoachCXP() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current CXP data
  const { data: cxpData, isLoading: cxpLoading, error } = useQuery({
    queryKey: ["coach_cxp"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("coach_cxp")
        .select("*")
        .eq("coach_id", user.user.id)
        .single();
      if (error) throw error;
      return data as CoachCXP;
    },
  });

  // Get CXP activities
  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ["cxp_activities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cxp_activities")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as CXPActivity[];
    },
  });

  // Initialize CXP for new coaches
  const { mutate: initializeCXP, isPending: isInitializingCXP } = useMutation({
    mutationFn: async () => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from('coach_cxp')
        .insert({ coach_id: user.data.user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach_cxp"] });
    },
  });

  // Add CXP using the new database function
  const addCXP = useMutation({
    mutationFn: async ({
      amount,
      activityType,
      description,
      sourcePlayerId,
      metadata,
    }: {
      amount: number;
      activityType: string;
      description?: string;
      sourcePlayerId?: string;
      metadata?: any;
    }) => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error("Not authenticated");
      
      // Call the database function directly using a manual RPC call
      const { data, error } = await supabase
        .rpc('add_cxp', {
          coach_id: user.data.user.id,
          amount: amount,
          activity_type: activityType,
          description: description || null,
          source_player_id: sourcePlayerId || null,
          metadata: metadata || null,
        } as any);
      
      if (error) throw error;
      return data;
    },
    onSuccess: async (data: any) => {
      if (data?.level_up) {
        toast({
          title: "Level Up!",
          description: `Congratulations! You've reached CXP level ${data.new_level}!`,
        });
      }
      
      // Refresh CXP data
      queryClient.invalidateQueries({ queryKey: ["coach_cxp"] });
      queryClient.invalidateQueries({ queryKey: ["cxp_activities"] });
      
      // Check achievements after CXP gain
      try {
        await supabase.rpc('check_all_coach_achievements' as any, {
          user_id: (await supabase.auth.getUser()).data.user?.id
        });
        queryClient.invalidateQueries({ queryKey: ["coach_achievements_unlocked"] });
        queryClient.invalidateQueries({ queryKey: ["coach_achievement_progress"] });
      } catch (error) {
        console.error('Failed to check achievements:', error);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add CXP",
        variant: "destructive",
      });
    },
  });

  return {
    cxpData,
    activities,
    loading: cxpLoading || activitiesLoading,
    error,
    addCXP: addCXP.mutate,
    initializeCXP,
    isAddingCXP: addCXP.isPending,
    isInitializingCXP,
  };
}