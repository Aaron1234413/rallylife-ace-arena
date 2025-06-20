
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

interface SocialPlayParticipant {
  id: string;
  session_id: string;
  user_id: string;
  status: 'invited' | 'accepted' | 'declined' | 'joined';
  invited_at: string;
  joined_at: string | null;
  user?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
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
            user:profiles(id, full_name, avatar_url)
          )
        `)
        .or(`created_by.eq.${user.id},social_play_participants.user_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as (SocialPlaySession & { participants: SocialPlayParticipant[] })[];
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
            user:profiles(id, full_name, avatar_url)
          )
        `)
        .eq('status', 'active')
        .or(`created_by.eq.${user.id},social_play_participants.user_id.eq.${user.id}`)
        .maybeSingle();
      
      if (error) throw error;
      return data as (SocialPlaySession & { participants: SocialPlayParticipant[] }) | null;
    },
    enabled: !!user?.id
  });

  // Create social play session
  const createSession = useMutation({
    mutationFn: async (sessionData: {
      session_type: 'singles' | 'doubles';
      competitive_level: 'low' | 'medium' | 'high';
      location?: string;
      participants: string[]; // user IDs to invite
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Create the session
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

      // Add creator as a participant with 'joined' status
      const participantInserts = [
        {
          session_id: session.id,
          user_id: user.id,
          status: 'joined' as const,
          joined_at: new Date().toISOString()
        }
      ];

      // Add other participants as 'invited'
      if (sessionData.participants.length > 0) {
        participantInserts.push(...sessionData.participants.map(userId => ({
          session_id: session.id,
          user_id: userId,
          status: 'invited' as const
        })));
      }

      const { error: participantsError } = await supabase
        .from('social_play_participants')
        .insert(participantInserts);
      
      if (participantsError) throw participantsError;
      
      return session;
    },
    onSuccess: (session, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['social-play-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['active-social-play-session'] });
      toast({
        title: 'Social Play Session Created',
        description: 'Your friends have been invited to play!',
      });
      
      // Call the onSuccess callback if provided
      if (context && typeof context === 'object' && 'onSuccess' in context) {
        (context as any).onSuccess(session.id);
      }
    },
    onError: (error: any, variables, context) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create social play session',
        variant: 'destructive',
      });
      
      // Call the onError callback if provided
      if (context && typeof context === 'object' && 'onError' in context) {
        (context as any).onError(error);
      }
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

  // Accept session invitation
  const acceptInvitation = useMutation({
    mutationFn: async (sessionId: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('social_play_participants')
        .update({ 
          status: 'accepted',
          joined_at: new Date().toISOString()
        })
        .eq('session_id', sessionId)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-play-sessions'] });
      toast({
        title: 'Invitation Accepted',
        description: 'You have joined the social play session!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to accept invitation',
        variant: 'destructive',
      });
    }
  });

  // Enhanced createSession function that supports callbacks
  const createSessionWithCallback = (sessionData: {
    session_type: 'singles' | 'doubles';
    competitive_level: 'low' | 'medium' | 'high';
    location?: string;
    participants: string[];
    onSuccess?: (sessionId: string) => void;
    onError?: (error: any) => void;
  }) => {
    const { onSuccess, onError, ...data } = sessionData;
    createSession.mutate(data, {
      onSuccess: (session) => {
        onSuccess?.(session.id);
      },
      onError: (error) => {
        onError?.(error);
      }
    });
  };

  return {
    sessions: sessions || [],
    activeSession,
    isLoading: sessionsLoading,
    createSession: createSessionWithCallback,
    updateSessionStatus: updateSessionStatus.mutate,
    acceptInvitation: acceptInvitation.mutate,
    isCreatingSession: createSession.isPending,
    isUpdatingSession: updateSessionStatus.isPending,
    isAcceptingInvitation: acceptInvitation.isPending,
  };
}
