
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MeditationSession {
  id: string;
  user_id: string;
  duration_minutes: number;
  hp_gained: number;
  session_type: string;
  completed_at: string;
}

interface MeditationProgress {
  id: string;
  user_id: string;
  total_sessions: number;
  total_minutes: number;
  current_streak: number;
  longest_streak: number;
  last_session_date: string | null;
}

interface MeditationCompletionResult {
  success: boolean;
  session_id: string;
  hp_gained: number;
  total_sessions: number;
  total_minutes: number;
  current_streak: number;
  longest_streak: number;
  streak_bonus_applied: boolean;
}

export function useMeditationProgress() {
  return useQuery({
    queryKey: ['meditation-progress'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meditation_progress')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching meditation progress:', error);
        throw error;
      }
      
      return data as MeditationProgress | null;
    },
  });
}

export function useMeditationSessions() {
  return useQuery({
    queryKey: ['meditation-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meditation_sessions')
        .select('*')
        .order('completed_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Error fetching meditation sessions:', error);
        throw error;
      }
      
      return data as MeditationSession[];
    },
  });
}

export function useCompleteMeditation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ duration_minutes, session_type = 'guided' }: { 
      duration_minutes: number; 
      session_type?: string; 
    }) => {
      console.log('Completing meditation session:', { duration_minutes, session_type });
      
      const { data, error } = await supabase.rpc('complete_meditation_session', {
        user_id: (await supabase.auth.getUser()).data.user?.id,
        duration_minutes,
        session_type
      });
      
      if (error) {
        console.error('Error completing meditation session:', error);
        throw error;
      }
      
      return data as unknown as MeditationCompletionResult;
    },
    onSuccess: async (data) => {
      console.log('Meditation session completed successfully:', data);
      
      // Show success message with streak info
      const message = data.streak_bonus_applied 
        ? `Meditation complete! +${data.hp_gained} HP (streak bonus applied!)`
        : `Meditation complete! +${data.hp_gained} HP`;
      
      toast.success(message, {
        description: `${data.current_streak} day streak • ${data.total_sessions} total sessions`
      });
      
      // Refresh all related queries
      queryClient.invalidateQueries({ queryKey: ['meditation-progress'] });
      queryClient.invalidateQueries({ queryKey: ['meditation-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['player-hp'] });
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
      
      // Check for meditation achievements
      // Import achievement checking here
      const { useMeditationAchievements } = await import('./useMeditationAchievements');
      
      // Trigger achievement check after a short delay to ensure data is refreshed
      setTimeout(() => {
        // This will be handled by the component that uses this hook
        queryClient.invalidateQueries({ queryKey: ['meditation-achievements'] });
      }, 500);
    },
    onError: (error) => {
      console.error('Error completing meditation:', error);
      toast.error('Failed to complete meditation session. Please try again.');
    }
  });
}
