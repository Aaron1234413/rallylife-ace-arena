
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StretchingSession {
  id: string;
  user_id: string;
  routine_id: string;
  routine_name: string;
  duration_minutes: number;
  hp_gained: number;
  difficulty: string;
  completed_at: string;
  created_at: string;
}

interface StretchingProgress {
  id: string;
  user_id: string;
  total_sessions: number;
  total_minutes: number;
  current_streak: number;
  longest_streak: number;
  last_session_date: string | null;
  created_at: string;
  updated_at: string;
}

interface StretchingCompletionResult {
  success: boolean;
  session_id: string;
  hp_gained: number;
  total_sessions: number;
  total_minutes: number;
  current_streak: number;
  longest_streak: number;
  streak_bonus_applied: boolean;
}

export function useStretchingProgress() {
  return useQuery({
    queryKey: ['stretching-progress'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('stretching_progress')
        .select('*')
        .eq('user_id', user.user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching stretching progress:', error);
        throw error;
      }
      
      return data as StretchingProgress | null;
    },
  });
}

export function useStretchingSessions() {
  return useQuery({
    queryKey: ['stretching-sessions'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('stretching_sessions')
        .select('*')
        .eq('user_id', user.user.id)
        .order('completed_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Error fetching stretching sessions:', error);
        throw error;
      }
      
      return data as StretchingSession[];
    },
  });
}

export function useCompleteStretching() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      routine_id, 
      routine_name, 
      duration_minutes, 
      difficulty = 'easy' 
    }: { 
      routine_id: string;
      routine_name: string;
      duration_minutes: number; 
      difficulty?: string; 
    }) => {
      console.log('Completing stretching session:', { routine_id, routine_name, duration_minutes, difficulty });
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('Not authenticated');
      }
      
      const { data, error } = await supabase.rpc('complete_stretching_session', {
        user_id: user.user.id,
        routine_id,
        routine_name,
        duration_minutes,
        difficulty
      });
      
      if (error) {
        console.error('Error completing stretching session:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('No data returned from stretching completion');
      }
      
      return data as unknown as StretchingCompletionResult;
    },
    onSuccess: async (data) => {
      console.log('Stretching session completed successfully:', data);
      
      try {
        // Show success message with streak info
        const message = data.streak_bonus_applied 
          ? `Stretching complete! +${data.hp_gained} HP (streak bonus applied!)`
          : `Stretching complete! +${data.hp_gained} HP`;
        
        toast.success(message, {
          description: `${data.current_streak} day streak • ${data.total_sessions} total sessions`
        });
        
        // Refresh all related queries
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['stretching-progress'] }),
          queryClient.invalidateQueries({ queryKey: ['stretching-sessions'] }),
          queryClient.invalidateQueries({ queryKey: ['activity-logs'] }),
          // Force refresh HP data
          queryClient.refetchQueries({ queryKey: ['player-hp'] }),
          queryClient.invalidateQueries({ queryKey: ['hp-activities'] })
        ]);
        
        console.log('All queries refreshed after stretching completion');
        
      } catch (refreshError) {
        console.error('Error refreshing queries after stretching:', refreshError);
        // Still show success even if refresh fails
        toast.success(`Stretching complete! +${data.hp_gained} HP`);
      }
    },
    onError: (error) => {
      console.error('Error completing stretching:', error);
      
      // Show specific error message
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to complete stretching session';
        
      toast.error('Stretching failed', {
        description: errorMessage + '. Please try again.'
      });
    }
  });
}
