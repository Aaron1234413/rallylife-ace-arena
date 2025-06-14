
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useLessonSessions() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['lesson-sessions'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('lesson_sessions')
        .select(`
          *,
          coach_profile:profiles!coach_id(full_name, avatar_url),
          player_profile:profiles!player_id(full_name, avatar_url)
        `)
        .or(`coach_id.eq.${user.id},player_id.eq.${user.id}`)
        .order('scheduled_date', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });
}

export function useCreateLessonSession() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (sessionData: {
      player_id: string;
      title: string;
      description?: string;
      scheduled_date: string;
      duration_minutes: number;
      session_type: string;
      location?: string;
      skills_focus?: string[];
      hourly_rate?: number;
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      const totalCost = sessionData.hourly_rate 
        ? (sessionData.hourly_rate * sessionData.duration_minutes / 60)
        : null;
      
      const { data, error } = await supabase
        .from('lesson_sessions')
        .insert([{
          ...sessionData,
          coach_id: user.id,
          total_cost: totalCost
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-sessions'] });
    }
  });
}

export function useUpdateLessonSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      sessionId, 
      updates 
    }: { 
      sessionId: string; 
      updates: any;
    }) => {
      const { data, error } = await supabase
        .from('lesson_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-sessions'] });
    }
  });
}
