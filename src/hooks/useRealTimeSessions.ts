import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Session {
  id: string;
  creator_id: string;
  session_type: 'match' | 'social_play' | 'training' | 'wellbeing';
  format?: 'singles' | 'doubles';
  max_players: number;
  stakes_amount: number;
  location?: string;
  notes?: string;
  status: 'waiting' | 'active' | 'completed' | 'cancelled' | 'full';
  is_private: boolean;
  invitation_code?: string;
  created_at: string;
  updated_at: string;
  
  // Phase 1 enhanced fields
  current_participants: number;
  started_at?: string;
  completed_at?: string;
  winner_id?: string;
  session_result?: any;
  
  // Computed fields
  participant_count?: number;
  creator_name?: string;
  user_joined?: boolean;
  is_creator?: boolean;
  can_start?: boolean;
  participants?: Array<{
    id: string;
    user_id: string;
    status: string;
    joined_at: string;
    role: string;
    user: {
      full_name: string;
    }
  }>;
}

export function useRealTimeSessions(activeTab: string, userId?: string) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      
      let query = supabase
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

      // Apply tab-specific filtering
      if (activeTab === 'my-sessions' && userId) {
        // For my sessions, get sessions where user is creator or participant
        const { data: participantSessions } = await supabase
          .from('session_participants')
          .select('session_id')
          .eq('user_id', userId)
          .eq('status', 'joined');
        
        const sessionIds = participantSessions?.map(p => p.session_id) || [];
        
        if (sessionIds.length > 0) {
          query = query.or(`creator_id.eq.${userId},id.in.(${sessionIds.join(',')})`);
        } else {
          query = query.eq('creator_id', userId);
        }
      } else if (activeTab === 'available') {
        query = query.eq('status', 'waiting').eq('is_private', false);
      } else if (activeTab === 'completed') {
        // For completed sessions, show sessions where user is creator or participant
        if (userId) {
          const { data: participantSessions } = await supabase
            .from('session_participants')
            .select('session_id')
            .eq('user_id', userId)
            .eq('status', 'joined');
          
          const sessionIds = participantSessions?.map(p => p.session_id) || [];
          
          if (sessionIds.length > 0) {
            query = query.eq('status', 'completed').or(`creator_id.eq.${userId},id.in.(${sessionIds.join(',')})`);
          } else {
            query = query.eq('status', 'completed').eq('creator_id', userId);
          }
        } else {
          // If no userId, don't show any completed sessions
          query = query.eq('status', 'completed').eq('id', '00000000-0000-0000-0000-000000000000');
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Process the data to add participant count and user join status
      const processedSessions = data?.map((session: any) => {
        const participants = session.participants || [];
        const activeParticipants = participants.filter((p: any) => p.status === 'joined');
        
        return {
          ...session,
          participant_count: session.current_participants || activeParticipants.length,
          creator_name: session.creator?.full_name || 'Unknown',
          user_joined: activeParticipants.some((p: any) => p.user_id === userId),
          is_creator: session.creator_id === userId,
          can_start: session.creator_id === userId && session.status === 'waiting' && session.current_participants >= 2,
          participants: activeParticipants
        };
      }) || [];

      setSessions(processedSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchSessions();
    }
  }, [activeTab, userId]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!userId) return;

    // Subscribe to sessions table changes
    const sessionsChannel = supabase
      .channel(`sessions-changes-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions'
        },
        () => {
          fetchSessions();
        }
      )
      .subscribe();

    // Subscribe to session_participants table changes
    const participantsChannel = supabase
      .channel(`participants-changes-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_participants'
        },
        () => {
          fetchSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sessionsChannel);
      supabase.removeChannel(participantsChannel);
    };
  }, [userId, activeTab]);

  const joinSession = async (sessionId: string) => {
    try {
      console.log('Attempting to join session:', sessionId, 'for user:', userId);
      
      const { data, error } = await supabase.rpc('join_session', {
        session_id_param: sessionId,
        user_id_param: userId
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; participant_count?: number; session_ready?: boolean };
      console.log('Join session result:', result);

      if (result.success) {
        toast.success('Successfully joined session!');
        if (result.session_ready) {
          toast.success('Session is ready to start!');
        }
        // Force a refresh of sessions after successful join
        fetchSessions();
      } else {
        toast.error(result.error || 'Failed to join session');
      }
    } catch (error) {
      console.error('Error joining session:', error);
      toast.error('Failed to join session');
    }
  };

  const leaveSession = async (sessionId: string) => {
    try {
      // Find the participant record to leave
      const { data: participant, error: findError } = await supabase
        .from('session_participants')
        .select('id')
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .eq('status', 'joined')
        .single();

      if (findError || !participant) {
        toast.error('Could not find your participation in this session');
        return;
      }

      // Leave the session by updating status
      const { error: leaveError } = await supabase
        .from('session_participants')
        .update({ status: 'left', left_at: new Date().toISOString() })
        .eq('id', participant.id);

      if (leaveError) throw leaveError;

      // Get session details for stakes refund
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('stakes_amount')
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;

      // Refund stakes if any
      if (session.stakes_amount > 0) {
        const { error: refundError } = await supabase.rpc('add_tokens', {
          user_id: userId,
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
    } catch (error) {
      console.error('Error leaving session:', error);
      toast.error('Failed to leave session');
    }
  };

  const kickParticipant = async (sessionId: string, participantId: string) => {
    try {
      const { data, error } = await supabase.rpc('kick_participant', {
        session_id_param: sessionId,
        participant_id_param: participantId,
        kicker_id_param: userId
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string };

      if (result.success) {
        toast.success('Participant has been removed from the session');
      } else {
        toast.error(result.error || 'Failed to remove participant');
      }
    } catch (error) {
      console.error('Error kicking participant:', error);
      toast.error('Failed to remove participant');
    }
  };

  const startSession = async (sessionId: string) => {
    try {
      const { data, error } = await supabase.rpc('start_session', {
        session_id_param: sessionId,
        starter_id_param: userId
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string };

      if (result.success) {
        toast.success('Session has been started!');
      } else {
        toast.error(result.error || 'Failed to start session');
      }
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error('Failed to start session');
    }
  };

  const completeSession = async (sessionId: string, winnerId?: string, sessionResult?: any) => {
    try {
      console.log('🎾 Starting session completion:', {
        sessionId,
        winnerId,
        sessionResult,
        userId
      });
      
      const { data, error } = await supabase.rpc('complete_session', {
        session_id_param: sessionId,
        winner_id_param: winnerId || null,
        session_result_param: sessionResult || {}
      });

      if (error) {
        console.error('❌ Database error completing session:', error);
        throw error;
      }

      const result = data as { 
        success: boolean; 
        error?: string; 
        session_id: string;
        winner_id?: string;
        total_stakes: number;
        winner_reward: number;
        participants_count: number;
      };

      console.log('✅ Complete session result:', result);

      if (result.success) {
        let message = 'Session completed successfully!';
        
        if (result.winner_id && result.winner_reward > 0) {
          message += ` Winner received ${result.winner_reward} tokens.`;
        }
        
        if (result.total_stakes > 0) {
          message += ` Total stakes: ${result.total_stakes} tokens.`;
        }
        
        toast.success(message);
        
        // Force refresh sessions after successful completion
        console.log('🔄 Session completed successfully, refreshing sessions...');
        await fetchSessions();
        console.log('✅ Sessions refreshed after completion');
        
      } else {
        console.error('❌ Session completion failed:', result.error);
        toast.error(result.error || 'Failed to complete session');
      }
    } catch (error) {
      console.error('Error completing session:', error);
      toast.error('Failed to complete session');
    }
  };

  return {
    sessions,
    loading,
    joinSession,
    leaveSession,
    kickParticipant,
    startSession,
    completeSession
  };
}