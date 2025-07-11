import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { subscriptionCoordinator } from '@/services/SubscriptionCoordinator';

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

interface UseCoordinatedRealTimeSessionsOptions {
  enabled?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
  onError?: (error: Error) => void;
}

export function useCoordinatedRealTimeSessions(
  activeTab: string, 
  userId?: string,
  options: UseCoordinatedRealTimeSessionsOptions = {}
) {
  const { user } = useAuth();
  const {
    enabled = true,
    retryAttempts = 3,
    retryDelay = 1000,
    onError
  } = options;

  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const subscriptionIdsRef = useRef<string[]>([]);
  const retryCountRef = useRef(0);

  // Use the authenticated user's ID if no userId provided
  const effectiveUserId = userId || user?.id;

  const clearSubscriptions = useCallback(() => {
    subscriptionIdsRef.current.forEach(id => {
      subscriptionCoordinator.removeSubscriptionRequest(id);
    });
    subscriptionIdsRef.current = [];
  }, []);

  const fetchSessions = useCallback(async () => {
    // Safety check: don't fetch if disabled or no user
    if (!enabled || !effectiveUserId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
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

      // Apply tab-specific filtering with safety checks
      if (activeTab === 'my-sessions') {
        const { data: participantSessions, error: participantError } = await supabase
          .from('session_participants')
          .select('session_id')
          .eq('user_id', effectiveUserId)
          .eq('status', 'joined');
        
        if (participantError) {
          console.warn('Error fetching participant sessions:', participantError);
        }
        
        const sessionIds = participantSessions?.map(p => p.session_id) || [];
        
        if (sessionIds.length > 0) {
          query = query.or(`creator_id.eq.${effectiveUserId},id.in.(${sessionIds.join(',')})`);
        } else {
          query = query.eq('creator_id', effectiveUserId);
        }
      } else if (activeTab === 'available') {
        query = query.eq('status', 'waiting').eq('is_private', false);
      } else if (activeTab === 'completed') {
        const { data: participantSessions, error: participantError } = await supabase
          .from('session_participants')
          .select('session_id')
          .eq('user_id', effectiveUserId)
          .eq('status', 'joined');
        
        if (participantError) {
          console.warn('Error fetching participant sessions:', participantError);
        }
        
        const sessionIds = participantSessions?.map(p => p.session_id) || [];
        
        if (sessionIds.length > 0) {
          query = query.eq('status', 'completed').or(`creator_id.eq.${effectiveUserId},id.in.(${sessionIds.join(',')})`);
        } else {
          query = query.eq('status', 'completed').eq('creator_id', effectiveUserId);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Process the data with safety checks
      const processedSessions = data?.map((session: any) => {
        const participants = session.participants || [];
        const activeParticipants = participants.filter((p: any) => p.status === 'joined');
        
        return {
          ...session,
          participant_count: activeParticipants.length,
          creator_name: session.creator?.full_name || 'Unknown',
          user_joined: activeParticipants.some((p: any) => p.user_id === effectiveUserId),
          participants: activeParticipants
        };
      }) || [];

      setSessions(processedSessions);
      retryCountRef.current = 0; // Reset retry count on success
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching sessions:', error);
      setError(errorMessage);
      onError?.(error instanceof Error ? error : new Error(errorMessage));
      
      // Retry logic
      if (retryCountRef.current < retryAttempts) {
        retryCountRef.current += 1;
        retryTimeoutRef.current = setTimeout(() => {
          fetchSessions();
        }, retryDelay * Math.pow(2, retryCountRef.current)); // Exponential backoff
      } else {
        toast.error('Failed to load sessions after multiple attempts');
      }
    } finally {
      setLoading(false);
    }
  }, [activeTab, effectiveUserId, enabled, retryAttempts, retryDelay, onError]);

  // Initial fetch
  useEffect(() => {
    if (enabled && effectiveUserId) {
      fetchSessions();
    } else {
      setLoading(false);
    }

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [activeTab, effectiveUserId, enabled]);

  // Create a stable reference to fetchSessions for subscriptions
  const fetchSessionsRef = useRef(fetchSessions);
  fetchSessionsRef.current = fetchSessions;

  // Set up coordinated real-time subscriptions
  useEffect(() => {
    if (!enabled || !effectiveUserId) return;

    // Clear existing subscriptions
    clearSubscriptions();

    // Add subscription requests through coordinator
    const channelPrefix = `coordinated-${effectiveUserId}`;
    
    const sessionsSubscriptionId = subscriptionCoordinator.addSubscriptionRequest(
      'sessions',
      () => fetchSessionsRef.current(),
      2, // Higher priority
      channelPrefix
    );

    const participantsSubscriptionId = subscriptionCoordinator.addSubscriptionRequest(
      'session_participants',
      () => fetchSessionsRef.current(),
      1, // Lower priority
      channelPrefix
    );

    subscriptionIdsRef.current = [sessionsSubscriptionId, participantsSubscriptionId];

    console.log('Coordinated subscriptions set up:', {
      sessions: sessionsSubscriptionId,
      participants: participantsSubscriptionId,
      queueStatus: subscriptionCoordinator.getQueueStatus()
    });

    return () => {
      clearSubscriptions();
    };
  }, [effectiveUserId, enabled]);

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
        await fetchSessions();
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
  }, [effectiveUserId, fetchSessions]);

  const leaveSession = useCallback(async (sessionId: string) => {
    if (!effectiveUserId) {
      toast.error('User not authenticated');
      return;
    }

    try {
      // Use maybeSingle instead of single for safety
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

      // Get session details for stakes refund - use maybeSingle
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('stakes_amount')
        .eq('id', sessionId)
        .maybeSingle();

      if (sessionError) throw sessionError;

      // Refund stakes if any
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

      await fetchSessions();
    } catch (error) {
      console.error('Error leaving session:', error);
      toast.error('Failed to leave session');
    }
  }, [effectiveUserId, fetchSessions]);

  return {
    sessions,
    loading,
    error,
    joinSession,
    leaveSession,
    refetch: fetchSessions
  };
}