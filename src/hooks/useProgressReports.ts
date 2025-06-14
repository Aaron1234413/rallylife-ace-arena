
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useProgressReports() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['progress-reports'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('progress_reports')
        .select(`
          *,
          coach_profiles:profiles!coach_id(full_name, avatar_url),
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

export function useSubmitProgressReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      coachId,
      reportType,
      title,
      content,
      relatedAssignmentId,
      relatedChallengeId,
      relatedSessionId,
      metrics
    }: {
      coachId: string;
      reportType: string;
      title: string;
      content: string;
      relatedAssignmentId?: string;
      relatedChallengeId?: string;
      relatedSessionId?: string;
      metrics?: any;
    }) => {
      const { data, error } = await supabase.rpc('submit_progress_report', {
        coach_user_id: coachId,
        report_type: reportType,
        title,
        content,
        related_assignment_id: relatedAssignmentId,
        related_challenge_id: relatedChallengeId,
        related_session_id: relatedSessionId,
        metrics
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress-reports'] });
      queryClient.invalidateQueries({ queryKey: ['token-balances'] });
    }
  });
}
