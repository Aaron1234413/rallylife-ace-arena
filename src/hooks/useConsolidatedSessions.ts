import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface Session {
  id: string;
  creator_id: string;
  session_type: 'match' | 'social_play' | 'training' | 'wellbeing';
  format?: 'singles' | 'doubles';
  max_players: number;
  stakes_amount: number;
  location?: string;
  notes?: string;
  status: 'waiting' | 'active' | 'completed' | 'cancelled';
  is_private: boolean;
  invitation_code?: string;
  created_at: string;
  updated_at: string;
  participant_count?: number;
  creator_name?: string;
  user_joined?: boolean;
  participants?: Array<{
    id: string;
    user_id: string;
    status: string;
    joined_at: string;
    user: {
      full_name: string;
    }
  }>;
}

interface ConsolidatedSessionsData {
  availableSessions: Session[];
  mySessions: Session[];
  loading: boolean;
  error: string | null;
  joinSession: (sessionId: string) => Promise<void>;
  leaveSession: (sessionId: string) => Promise<void>;
  startSession: (sessionId: string) => Promise<void>;
  completeSession: (sessionId: string, winnerId?: string, sessionDurationMinutes?: number) => Promise<void>;
  kickParticipant: (sessionId: string, participantId: string) => Promise<void>;
}

export function useConsolidatedSessions(): ConsolidatedSessionsData {
  const { user } = useAuth();
  const [availableSessions, setAvailableSessions] = useState<Session[]>([]);
  const [mySessions, setMySessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const channelRef = useRef<any>(null);
  const effectiveUserId = user?.id;

  const clearChannel = useCallback(() => {
    if (channelRef.current) {
      try {
        supabase.removeChannel(channelRef.current);
      } catch (err) {
        console.warn('Error removing channel:', err);
      }
      channelRef.current = null;
    }
  }, []);

  const fetchAllSessions = useCallback(async () => {
    if (!effectiveUserId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch available sessions
      const { data: availableData, error: availableError } = await supabase
        .from('sessions')
        .select(`
          *,
          participants:session_participants(
            id,
            user_id,
            status,
            joined_at,
            user:profiles(full_name)
          ),
          creator:profiles(full_name)
        `)
        .eq('status', 'waiting')
        .eq('is_private', false)
        .order('created_at', { ascending: false });

      if (availableError) throw availableError;

      // Fetch user's sessions (created by them or joined by them)
      const { data: participantSessions, error: participantError } = await supabase
        .from('session_participants')
        .select('session_id')
        .eq('user_id', effectiveUserId)
        .eq('status', 'joined');
      
      if (participantError) {
        console.warn('Error fetching participant sessions:', participantError);
      }
      
      const sessionIds = participantSessions?.map(p => p.session_id) || [];
      
      let mySessionsQuery = supabase
        .from('sessions')
        .select(`
          *,
          participants:session_participants(
            id,
            user_id,
            status,
            joined_at,
            user:profiles(full_name)
          ),
          creator:profiles(full_name)
        `);

      if (sessionIds.length > 0) {
        mySessionsQuery = mySessionsQuery.or(`creator_id.eq.${effectiveUserId},id.in.(${sessionIds.join(',')})`);
      } else {
        mySessionsQuery = mySessionsQuery.eq('creator_id', effectiveUserId);
      }

      const { data: myData, error: myError } = await mySessionsQuery.order('created_at', { ascending: false });

      if (myError) throw myError;

      // Process both datasets
      const processSession = (session: any) => {
        const participants = session.participants || [];
        const activeParticipants = participants.filter((p: any) => p.status === 'joined');
        
        return {
          ...session,
          participant_count: activeParticipants.length,
          creator_name: session.creator?.full_name || 'Unknown',
          user_joined: activeParticipants.some((p: any) => p.user_id === effectiveUserId),
          participants: activeParticipants
        };
      };

      const processedAvailable = availableData?.map(processSession) || [];
      const processedMy = myData?.map(processSession) || [];

      setAvailableSessions(processedAvailable);
      setMySessions(processedMy);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching sessions:', error);
      setError(errorMessage);
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, [effectiveUserId]);

  // Initial fetch
  useEffect(() => {
    if (effectiveUserId) {
      fetchAllSessions();
    } else {
      setLoading(false);
    }
  }, [fetchAllSessions]);

  // Set up single real-time subscription
  useEffect(() => {
    if (!effectiveUserId) return;

    // Clear any existing channel first
    clearChannel();

    try {
      // Create a single unique channel for all session updates
      const uniqueId = `${effectiveUserId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const channelName = `consolidated-sessions-${uniqueId}`;

      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'sessions'
          },
          () => {
            fetchAllSessions();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'session_participants'
          },
          () => {
            fetchAllSessions();
          }
        )
        .subscribe();

      channelRef.current = channel;
    } catch (error) {
      console.error('Error setting up real-time subscription:', error);
    }

    return () => {
      clearChannel();
    };
  }, [effectiveUserId, fetchAllSessions, clearChannel]);

  const joinSession = useCallback(async (sessionId: string) => {
    if (!effectiveUserId) {
      toast.error('User not authenticated');
      return;
    }

    try {
      console.log('Attempting to join session:', sessionId);
      const { data, error } = await supabase.rpc('join_session', {
        session_id_param: sessionId,
        user_id_param: effectiveUserId
      });

      if (error) {
        console.error('RPC Error:', error);
        throw error;
      }

      console.log('Join session response:', data);
      const result = data as { success: boolean; error?: string; participant_count?: number; session_ready?: boolean };

      if (result && result.success) {
        console.log('Successfully joined session:', sessionId);
        toast.success('Successfully joined session!');
        if (result.session_ready) {
          toast.success('Session is ready to start!');
        }
        await fetchAllSessions();
      } else {
        console.error('Join session failed:', result?.error);
        
        // Handle specific token insufficient error
        if (result?.error?.includes('Insufficient tokens')) {
          toast.error('Not enough tokens! You need more tokens to join this session.');
        } else {
          toast.error(result?.error || 'Failed to join session');
        }
        
        throw new Error(result?.error || 'Failed to join session');
      }
    } catch (error) {
      console.error('Error joining session:', error);
      
      // Handle specific token insufficient error in catch block too
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Insufficient tokens')) {
        toast.error('Not enough tokens! Please visit the store to purchase more tokens.');
      } else {
        toast.error('Failed to join session');
      }
      
      throw error; // Re-throw so the Play component can handle it
    }
  }, [effectiveUserId, fetchAllSessions]);

  const leaveSession = useCallback(async (sessionId: string) => {
    if (!effectiveUserId) {
      toast.error('User not authenticated');
      return;
    }

    try {
      const { data: participant, error: findError } = await supabase
        .from('session_participants')
        .select('id')
        .eq('session_id', sessionId)
        .eq('user_id', effectiveUserId)
        .eq('status', 'joined')
        .maybeSingle();

      if (findError) throw findError;
      
      if (!participant) {
        toast.error('Could not find your participation in this session');
        return;
      }

      const { error: leaveError } = await supabase
        .from('session_participants')
        .update({ status: 'left', left_at: new Date().toISOString() })
        .eq('id', participant.id);

      if (leaveError) throw leaveError;

      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('stakes_amount')
        .eq('id', sessionId)
        .maybeSingle();

      if (sessionError) throw sessionError;

      if (session?.stakes_amount && session.stakes_amount > 0) {
        const { error: refundError } = await supabase.rpc('add_tokens', {
          user_id: effectiveUserId,
          amount: session.stakes_amount,
          token_type: 'regular',
          source: 'session_leave_refund',
          description: 'Stakes refund for leaving session'
        });

        if (refundError) {
          console.error('Error refunding stakes:', refundError);
        } else {
          toast.success(`Left session and received ${session.stakes_amount} tokens refund`);
        }
      } else {
        toast.success('Successfully left session');
      }

      await fetchAllSessions();
    } catch (error) {
      console.error('Error leaving session:', error);
      toast.error('Failed to leave session');
    }
  }, [effectiveUserId, fetchAllSessions]);

  const startSession = useCallback(async (sessionId: string) => {
    if (!effectiveUserId) {
      toast.error('User not authenticated');
      return;
    }

    try {
      const { data, error } = await supabase.rpc('start_session', {
        session_id_param: sessionId,
        starter_id_param: effectiveUserId
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string };

      if (result.success) {
        toast.success('Session has been started!');
        await fetchAllSessions();
      } else {
        toast.error(result.error || 'Failed to start session');
      }
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error('Failed to start session');
    }
  }, [effectiveUserId, fetchAllSessions]);

  const completeSession = useCallback(async (sessionId: string, winnerId?: string, sessionDurationMinutes?: number) => {
    if (!effectiveUserId) {
      toast.error('User not authenticated');
      return;
    }

    try {
      const { data, error } = await supabase.rpc('complete_session', {
        session_id_param: sessionId,
        winner_id_param: winnerId || null,
        session_duration_minutes: sessionDurationMinutes || null
      });

      if (error) throw error;

      const result = data as { 
        success: boolean; 
        error?: string; 
        session_type: string;
        session_duration_minutes?: number;
        xp_granted?: number;
        hp_cost?: number;
        hp_cap_applied?: boolean;
        total_stakes?: number;
        distribution_type?: string;
        organizer_share?: number;
        participant_share?: number;
        hp_granted?: number;
        participant_count?: number;
        total_stakes_refunded?: number;
        debug?: string;
      };

      if (result.success) {
        if (result.session_type === 'wellbeing') {
          const hpMessage = `+${result.hp_granted} HP restored`;
          const participantMessage = result.participant_count > 1 ? ` for ${result.participant_count} participants` : '';
          const refundMessage = result.total_stakes_refunded > 0 ? ` • ${result.total_stakes_refunded} tokens refunded` : '';
          
          toast.success(`Wellbeing session completed! ${hpMessage}${participantMessage}${refundMessage}`);
        } else {
          const duration = result.session_duration_minutes || 0;
          const hours = Math.floor(duration / 60);
          const minutes = duration % 60;
          const durationText = hours > 0 ? `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}` : `${minutes}m`;
          
          const sessionTypeText = result.session_type === 'social_play' ? 'Social play' : 
                                  result.session_type === 'match' ? 'Match' : 
                                  result.session_type.charAt(0).toUpperCase() + result.session_type.slice(1);
          
          const xpText = result.xp_granted ? `+${result.xp_granted} XP` : '';
          const hpText = result.hp_cost ? `-${result.hp_cost} HP` : '';
          const capText = result.hp_cap_applied ? ' (capped)' : '';
          
          let message = `${durationText} ${sessionTypeText.toLowerCase()} complete!`;
          if (xpText && hpText) {
            message += ` ${xpText}, ${hpText}${capText}`;
          } else if (xpText) {
            message += ` ${xpText}`;
          } else if (hpText) {
            message += ` ${hpText}${capText}`;
          }
          
          if (result.total_stakes && result.total_stakes > 0) {
            message += ` • Stakes distributed`;
          }
          
          toast.success(message);
        }
        
        await fetchAllSessions();
      } else {
        toast.error(result.error || 'Failed to complete session');
      }
    } catch (error) {
      console.error('Error completing session:', error);
      toast.error('Failed to complete session');
    }
  }, [effectiveUserId, fetchAllSessions]);

  const kickParticipant = useCallback(async (sessionId: string, participantId: string) => {
    if (!effectiveUserId) {
      toast.error('User not authenticated');
      return;
    }

    try {
      const { data, error } = await supabase.rpc('kick_participant', {
        session_id_param: sessionId,
        participant_id_param: participantId,
        kicker_id_param: effectiveUserId
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string };

      if (result.success) {
        toast.success('Participant removed from session');
        await fetchAllSessions();
      } else {
        toast.error(result.error || 'Failed to remove participant');
      }
    } catch (error) {
      console.error('Error removing participant:', error);
      toast.error('Failed to remove participant');
    }
  }, [effectiveUserId, fetchAllSessions]);

  return {
    availableSessions,
    mySessions,
    loading,
    error,
    joinSession,
    leaveSession,
    startSession,
    completeSession,
    kickParticipant
  };
}