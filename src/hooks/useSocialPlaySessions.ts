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

interface CreateSessionParticipant {
  user_id: string;
  role: string;
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

  // Get active session with invitation status check
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
      
      // Check if session is ready to activate based on accepted invitations
      if (data && data.status === 'pending') {
        const acceptedCount = await checkAcceptedInvitations(data.id);
        const minParticipants = data.session_type === 'singles' ? 2 : 4;
        
        if (acceptedCount >= minParticipants) {
          // Auto-activate session
          await activateSession(data.id);
        }
      }
      
      return data;
    },
    enabled: !!user?.id
  });

  // Check how many invitations have been accepted for a session
  const checkAcceptedInvitations = async (sessionId: string) => {
    const { data: invitations, error } = await supabase
      .from('match_invitations')
      .select('id')
      .eq('invitation_category', 'social_play')
      .eq('match_session_id', sessionId)
      .eq('status', 'accepted');
    
    if (error) {
      console.error('Error checking accepted invitations:', error);
      return 0;
    }
    
    // Include the session creator (always counts as 1)
    return (invitations?.length || 0) + 1;
  };

  // Auto-activate session when minimum participants are ready
  const activateSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('social_play_sessions')
        .update({
          status: 'active',
          start_time: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);
      
      if (error) throw error;
      
      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['active-social-play-session'] });
      queryClient.invalidateQueries({ queryKey: ['social-play-sessions'] });
      
      toast({
        title: 'Session Ready!',
        description: 'Minimum participants have joined. Session is now active.',
      });
    } catch (error) {
      console.error('Error activating session:', error);
    }
  };

  // Clean up expired invitations and sessions
  const cleanupExpiredSessions = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      
      // Find sessions with expired invitations (older than 24 hours)
      const expiredTime = new Date();
      expiredTime.setHours(expiredTime.getHours() - 24);
      
      const { data: expiredSessions, error: fetchError } = await supabase
        .from('social_play_sessions')
        .select('id')
        .eq('created_by', user.id)
        .eq('status', 'pending')
        .lt('created_at', expiredTime.toISOString());
      
      if (fetchError) throw fetchError;
      
      if (expiredSessions && expiredSessions.length > 0) {
        // Cancel expired sessions
        const { error: updateError } = await supabase
          .from('social_play_sessions')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .in('id', expiredSessions.map(s => s.id));
        
        if (updateError) throw updateError;
        
        // Expire related invitations
        const { error: inviteError } = await supabase
          .from('match_invitations')
          .update({
            status: 'expired',
            updated_at: new Date().toISOString()
          })
          .eq('invitation_category', 'social_play')
          .in('match_session_id', expiredSessions.map(s => s.id))
          .eq('status', 'pending');
        
        if (inviteError) throw inviteError;
      }
      
      return expiredSessions?.length || 0;
    },
    onSuccess: (cleanedCount) => {
      if (cleanedCount && cleanedCount > 0) {
        toast({
          title: 'Sessions Cleaned Up',
          description: `${cleanedCount} expired session(s) have been cancelled.`,
        });
        queryClient.invalidateQueries({ queryKey: ['social-play-sessions'] });
        queryClient.invalidateQueries({ queryKey: ['active-social-play-session'] });
      }
    }
  });

  // Create social play session (now invitation-based)
  const createSession = useMutation({
    mutationFn: async (sessionData: {
      session_type: 'singles' | 'doubles';
      competitive_level: 'low' | 'medium' | 'high';
      location?: string;
      title?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data: session, error: sessionError } = await supabase
        .from('social_play_sessions')
        .insert({
          created_by: user.id,
          session_type: sessionData.session_type,
          competitive_level: sessionData.competitive_level,
          location: sessionData.location,
          notes: sessionData.title,
          status: 'pending' // Will be activated when invitations are accepted
        })
        .select()
        .single();
      
      if (sessionError) throw sessionError;

      // Add creator as a participant automatically
      const { error: participantError } = await supabase
        .from('social_play_participants')
        .insert({
          session_id: session.id,
          user_id: user.id,
          session_creator_id: user.id,
          status: 'joined',
          role: 'creator',
          joined_at: new Date().toISOString()
        });
      
      if (participantError) throw participantError;
      
      return session;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-play-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['active-social-play-session'] });
      toast({
        title: 'Session Created',
        description: 'Send invitations to start playing when participants join!',
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
    cleanupExpiredSessions: cleanupExpiredSessions.mutate,
    isCreatingSession: createSession.isPending,
    isUpdatingSession: updateSessionStatus.isPending,
    isCleaningUp: cleanupExpiredSessions.isPending,
  };
}
