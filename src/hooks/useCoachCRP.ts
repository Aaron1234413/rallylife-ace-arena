
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useCoachCRP(coachId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: crpData, isLoading } = useQuery({
    queryKey: ['coach-crp', coachId || user?.id],
    queryFn: async () => {
      const id = coachId || user?.id;
      if (!id) throw new Error('No coach ID provided');

      const { data, error } = await supabase
        .from('coach_crp')
        .select('*')
        .eq('coach_id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!(coachId || user?.id)
  });

  const { data: crpActivities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['crp-activities', coachId || user?.id],
    queryFn: async () => {
      const id = coachId || user?.id;
      if (!id) throw new Error('No coach ID provided');

      const { data, error } = await supabase
        .from('crp_activities')
        .select(`
          *,
          source_player:profiles!crp_activities_source_player_id_fkey(
            full_name,
            avatar_url
          )
        `)
        .eq('coach_id', id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!(coachId || user?.id)
  });

  const initializeCRP = useMutation({
    mutationFn: async () => {
      const id = user?.id;
      if (!id) throw new Error('No user ID provided');

      const { data, error } = await supabase
        .from('coach_crp')
        .insert({
          coach_id: id,
          current_crp: 100,
          total_crp_earned: 100
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-crp'] });
      queryClient.invalidateQueries({ queryKey: ['crp-activities'] });
    }
  });

  const submitFeedbackMutation = useMutation({
    mutationFn: async ({ 
      coachId, 
      rating, 
      feedbackText, 
      sessionType = 'lesson' 
    }: {
      coachId: string;
      rating: number;
      feedbackText?: string;
      sessionType?: string;
    }) => {
      const { data, error } = await supabase.rpc('submit_player_feedback', {
        coach_user_id: coachId,
        rating,
        feedback_text: feedbackText,
        session_type: sessionType
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-crp'] });
      queryClient.invalidateQueries({ queryKey: ['crp-activities'] });
    }
  });

  return {
    crpData,
    crpActivities,
    isLoading,
    activitiesLoading,
    initializeCRP: initializeCRP.mutateAsync,
    submitFeedback: submitFeedbackMutation.mutate,
    isSubmittingFeedback: submitFeedbackMutation.isPending
  };
}
