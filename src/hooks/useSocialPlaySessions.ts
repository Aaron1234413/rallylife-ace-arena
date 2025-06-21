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
  session_creator_id: string;
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

  // Get user's social play sessions - now we need to get both owned and participated sessions separately
  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['social-play-sessions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Get sessions user created
      const { data: ownedSessions, error: ownedError } = await supabase
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
      
      if (ownedError) throw ownedError;

      // Get sessions user participates in
      const { data: participantSessions, error: participantError } = await supabase
        .from('social_play_participants')
        .select(`
          session:social_play_sessions(
            *,
            participants:social_play_participants(
              *,
              user:profiles!social_play_participants_user_id_fkey(id, full_name, avatar_url)
            )
          )
        `)
        .eq('user_id', user.id)
        .neq('session.created_by', user.id); // Exclude sessions we already got above
      
      if (participantError) throw participantError;

      // Combine and flatten the results
      const allSessions = [
        ...(ownedSessions || []),
        ...(participantSessions?.map(p => p.session).filter(Boolean) || [])
      ];

      // Remove duplicates and sort by created_at
      const uniqueSessions = allSessions
        .filter((session, index, self) => 
          session && self.findIndex(s => s?.id === session.id) === index
        )
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      return uniqueSessions as (SocialPlaySession & { participants: SocialPlayParticipant[] })[];
    },
    enabled: !!user?.id
  });

  // Get active session - same approach
  const { data: activeSession } = useQuery({
    queryKey: ['active-social-play-session', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      // Check owned sessions first
      const { data: ownedSession, error: ownedError } = await supabase
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
      
      if (ownedError) throw ownedError;
      if (ownedSession) return ownedSession as (SocialPlaySession & { participants: SocialPlayParticipant[] });

      // Check participated sessions
      const { data: participantSession, error: participantError } = await supabase
        .from('social_play_participants')
        .select(`
          session:social_play_sessions(
            *,
            participants:social_play_participants(
              *,
              user:profiles!social_play_participants_user_id_fkey(id, full_name, avatar_url)
            )
          )
        `)
        .eq('user_id', user.id)
        .in('session.status', ['pending', 'active', 'paused'])
        .order('session.created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (participantError) throw participantError;
      return participantSession?.session as (SocialPlaySession & { participants: SocialPlayParticipant[] }) | null;
    },
    enabled: !!user?.id
  });

  // Create social play session - updated to properly set session_creator_id
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
      const { error: creatorError } = await supabase
        .from('social_play_participants')
        .insert({
          session_id: session.id,
          user_id: user.id,
          session_creator_id: user.id, // Use the denormalized session_creator_id
          status: 'joined',
          joined_at: new Date().toISOString()
        });
      
      if (creatorError) throw creatorError;

      // Add other participants as 'invited' (if any)
      if (sessionData.participants.length > 0) {
        const invitedParticipants = sessionData.participants.map(userId => ({
          session_id: session.id,
          user_id: userId,
          session_creator_id: user.id, // Denormalized session creator ID
          status: 'invited' as const
        }));

        const { error: participantsError } = await supabase
          .from('social_play_participants')
          .insert(invitedParticipants);
        
        if (participantsError) throw participantsError;
      }
      
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
