
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useTrainingAssignments() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['training-assignments'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('player_training_assignments')
        .select(`
          *,
          training_plans(*),
          profiles!coach_id(full_name, avatar_url),
          player_profiles:profiles!player_id(full_name, avatar_url)
        `)
        .or(`coach_id.eq.${user.id},player_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });
}

export function useCompleteTrainingAssignment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      assignmentId,
      playerFeedback
    }: {
      assignmentId: string;
      playerFeedback?: string;
    }) => {
      const { data, error } = await supabase.rpc('complete_training_assignment', {
        assignment_id: assignmentId,
        player_feedback: playerFeedback
      });
      
      if (error) throw error;
      return data as { 
        success: boolean; 
        xp_earned?: number; 
        tokens_earned?: number; 
        coach_crp_earned?: number;
        error?: string;
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['player-xp'] });
      queryClient.invalidateQueries({ queryKey: ['token-balances'] });
      queryClient.invalidateQueries({ queryKey: ['coach-crp'] });
    }
  });
}
