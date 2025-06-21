
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface SocialPlaySession {
  id: string;
  created_by: string;
  session_type: 'singles' | 'doubles';
  competitive_level: 'low' | 'medium' | 'high';
  status: 'pending' | 'active' | 'paused' | 'completed' | 'cancelled';
  start_time: string | null;
  end_time: string | null;
  paused_duration: number;
  location: string | null;
  notes: string | null;
  mood: string | null;
  final_score: string | null;
  created_at: string;
  updated_at: string;
}

export function useSocialPlaySessions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user's social play sessions
  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['social-play-sessions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('social_play_sessions')
        .select(`
          *,
          participants:social_play_participants(
            *,
            user:profiles!social_play_participants_user_id_fkey(id, full_name, avatar_url)
          )
        `)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  // Get active session
  const { data: activeSession } = useQuery({
    queryKey: ['active-social-play-session', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('social_play_sessions')
        .select(`
          *,
          participants:social_play_participants(
            *,
            user:profiles!social_play_participants_user_id_fkey(id, full_name, avatar_url)
          )
        `)
        .eq('created_by', user.id)
        .in('status', ['pending', 'active', 'paused'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Create social play session
  const createSession = useMutation({
    mutationFn: async (sessionData: {
      session_type: 'singles' | 'doubles';
      competitive_level: 'low' | 'medium' | 'high';
      location?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data: session, error: sessionError } = await supabase
        .from('social_play_sessions')
        .insert({
          created_by: user.id,
          session_type: sessionData.session_type,
          competitive_level: sessionData.competitive_level,
          location: sessionData.location,
          status: 'pending'
        })
        .select()
        .single();
      
      if (sessionError) throw sessionError;

      // Add creator as a participant
      const { error: creatorError } = await supabase
        .from('social_play_participants')
        .insert({
          session_id: session.id,
          user_id: user.id,
          session_creator_id: user.id,
          status: 'joined',
          joined_at: new Date().toISOString()
        });
      
      if (creatorError) throw creatorError;
      
      return session;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-play-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['active-social-play-session'] });
      toast({
        title: 'Social Play Session Created',
        description: 'Your session is ready!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create social play session',
        variant: 'destructive',
      });
    }
  });

  // Update session status
  const updateSessionStatus = useMutation({
    mutationFn: async ({ sessionId, status, updates }: {
      sessionId: string;
      status: SocialPlaySession['status'];
      updates?: Partial<SocialPlaySession>;
    }) => {
      const updateData = {
        status,
        updated_at: new Date().toISOString(),
        ...updates
      };

      const { data, error } = await supabase
        .from('social_play_sessions')
        .update(updateData)
        .eq('id', sessionId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-play-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['active-social-play-session'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update session',
        variant: 'destructive',
      });
    }
  });

  return {
    sessions: sessions || [],
    activeSession,
    isLoading: sessionsLoading,
    createSession: createSession.mutate,
    updateSessionStatus: updateSessionStatus.mutate,
    isCreatingSession: createSession.isPending,
    isUpdatingSession: updateSessionStatus.isPending,
  };
}
