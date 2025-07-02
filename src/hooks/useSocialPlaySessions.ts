import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface SocialPlaySession {
  id: string;
  creator_id: string;
  session_type: 'social_play';
  format: 'singles' | 'doubles';
  max_players: number;
  stakes_amount: number;
  status: 'waiting' | 'active' | 'completed' | 'cancelled';
  location: string | null;
  notes: string | null;
  is_private: boolean;
  invitation_code: string | null;
  created_at: string;
  updated_at: string;
  participants?: Array<{
    id: string;
    user_id: string;
    status: 'joined' | 'left' | 'kicked';
    joined_at: string;
    left_at?: string;
    user?: {
      id: string;
      full_name: string;
      avatar_url?: string;
    };
  }>;
}

interface CreateSessionParticipant {
  user_id: string;
  role: string;
}

export function useSocialPlaySessions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user's social play sessions from unified sessions table
  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['social-play-sessions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          participants:session_participants(
            id,
            user_id,
            status,
            joined_at,
            left_at,
            user:profiles(id, full_name, avatar_url)
          )
        `)
        .eq('session_type', 'social_play')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  // Get active session with participant status check
  const { data: activeSession } = useQuery({
    queryKey: ['active-social-play-session', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          participants:session_participants(
            id,
            user_id,
            status,
            joined_at,
            left_at,
            user:profiles(id, full_name, avatar_url)
          )
        `)
        .eq('session_type', 'social_play')
        .eq('creator_id', user.id)
        .in('status', ['waiting', 'active'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      
      // Check if session is ready to activate based on participant count
      if (data && data.status === 'waiting') {
        const joinedParticipants = data.participants?.filter(p => p.status === 'joined') || [];
        const participantCount = joinedParticipants.length;
        const minParticipants = data.max_players;
        
        if (participantCount >= minParticipants) {
          // Auto-activate session using the start_session RPC function
          await activateSession(data.id);
        }
      }
      
      return data;
    },
    enabled: !!user?.id
  });

  // Auto-activate session when minimum participants are ready using unified RPC
  const activateSession = async (sessionId: string) => {
    try {
      const { data, error } = await supabase.rpc('start_session', {
        session_id_param: sessionId,
        starter_id_param: user?.id
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string };

      if (result.success) {
        // Invalidate queries to refresh UI
        queryClient.invalidateQueries({ queryKey: ['active-social-play-session'] });
        queryClient.invalidateQueries({ queryKey: ['social-play-sessions'] });
        
        toast({
          title: 'Session Ready!',
          description: 'Minimum participants have joined. Session is now active.',
        });
      } else {
        throw new Error(result.error || 'Failed to start session');
      }
    } catch (error) {
      console.error('Error activating session:', error);
    }
  };

  // Clean up expired sessions using unified sessions table
  const cleanupExpiredSessions = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      
      // Find sessions that are waiting for too long (older than 24 hours)
      const expiredTime = new Date();
      expiredTime.setHours(expiredTime.getHours() - 24);
      
      const { data: expiredSessions, error: fetchError } = await supabase
        .from('sessions')
        .select('id')
        .eq('session_type', 'social_play')
        .eq('creator_id', user.id)
        .eq('status', 'waiting')
        .lt('created_at', expiredTime.toISOString());
      
      if (fetchError) throw fetchError;
      
      if (expiredSessions && expiredSessions.length > 0) {
        // Cancel expired sessions using unified sessions table
        const { error: updateError } = await supabase
          .from('sessions')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .in('id', expiredSessions.map(s => s.id));
        
        if (updateError) throw updateError;
        
        // Clean up any related invitations in match_invitations table
        const { error: inviteError } = await supabase
          .from('match_invitations')
          .update({
            status: 'expired',
            updated_at: new Date().toISOString()
          })
          .eq('invitation_category', 'social_play')
          .in('match_session_id', expiredSessions.map(s => s.id))
          .eq('status', 'pending');
        
        if (inviteError) {
          console.warn('Error updating related invitations:', inviteError);
        }
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

  // Create social play session using unified sessions table
  const createSession = useMutation({
    mutationFn: async (sessionData: {
      session_type: 'singles' | 'doubles';
      competitive_level?: 'low' | 'medium' | 'high';
      location?: string;
      title?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Map session_type to format and max_players for unified schema
      const format = sessionData.session_type as 'singles' | 'doubles';
      const max_players = sessionData.session_type === 'singles' ? 2 : 4;
      
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          creator_id: user.id,
          session_type: 'social_play',
          format: format,
          max_players: max_players,
          stakes_amount: 0,
          location: sessionData.location,
          notes: sessionData.title,
          status: 'waiting', // Will be activated when enough participants join
          is_private: false
        })
        .select()
        .single();
      
      if (sessionError) throw sessionError;

      // Add creator as a participant automatically using unified table
      const { error: participantError } = await supabase
        .from('session_participants')
        .insert({
          session_id: session.id,
          user_id: user.id,
          status: 'joined',
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

  // Update session status using unified sessions table
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
        .from('sessions')
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
