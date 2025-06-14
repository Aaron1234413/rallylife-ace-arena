
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useTrainingPlans() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['training-plans'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('training_plans')
        .select('*')
        .eq('coach_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });
}

export function useCreateTrainingPlan() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (planData: {
      name: string;
      description?: string;
      difficulty_level: string;
      estimated_duration_minutes?: number;
      skills_focus?: string[];
      equipment_needed?: string[];
      instructions?: any;
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('training_plans')
        .insert([{
          ...planData,
          coach_id: user.id
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-plans'] });
    }
  });
}

export function useAssignTrainingPlan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      playerId,
      trainingPlanId,
      dueDate,
      coachNotes
    }: {
      playerId: string;
      trainingPlanId: string;
      dueDate?: string;
      coachNotes?: string;
    }) => {
      const { data, error } = await supabase.rpc('assign_training_plan', {
        player_user_id: playerId,
        training_plan_id: trainingPlanId,
        due_date: dueDate,
        coach_notes: coachNotes
      });
      
      if (error) throw error;
      return data as { success: boolean; assignment_id?: string; message?: string; error?: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['coach-cxp'] });
    }
  });
}
