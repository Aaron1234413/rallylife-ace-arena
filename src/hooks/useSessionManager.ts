import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

// Unified session interface that works for all session types
export interface SessionData {
  id: string;
  creator_id: string;
  session_type: 'social_play' | 'training' | 'match' | 'wellbeing' | 'club_booking' | 'club_event';
  format?: string;
  max_players: number;
  stakes_amount: number;
  location: string;
  notes?: string;
  is_private: boolean;
  invitation_code?: string;
  club_id?: string;
  session_source?: string;
  latitude?: number;
  longitude?: number;
  location_coordinates_set?: boolean;
  created_at: string;
  updated_at: string;
  
  // Computed fields
  participant_count?: number;
  user_has_joined?: boolean;
  status?: string;
  
  // Related data
  creator?: {
    full_name: string;
    avatar_url?: string;
  };
  participants?: SessionParticipant[];
  
  // Club-specific fields
  title?: string;
  description?: string;
  start_datetime?: string;
  end_datetime?: string;
  cost_tokens?: number;
  cost_money?: number;
  payment_method?: 'tokens' | 'money';
}

export interface SessionParticipant {
  id: string;
  session_id: string;
  user_id: string;
  joined_at: string;
  status: string;
  stakes_contributed: number;
  tokens_paid: number;
  money_paid: number;
  payment_status: string;
  attendance_status: string;
  notes?: string;
  
  // Related data
  user?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface UseSessionManagerOptions {
  sessionType?: 'social_play' | 'training' | 'match' | 'wellbeing' | 'club_booking' | 'club_event' | 'all';
  clubId?: string;
  includeNonClubSessions?: boolean;
  filterUserSessions?: boolean;
  filterUserParticipation?: boolean;
}

export interface SessionManagerActions {
  // Core actions
  joinSession: (sessionId: string) => Promise<boolean>;
  leaveSession: (sessionId: string) => Promise<boolean>;
  startSession: (sessionId: string) => Promise<boolean>;
  completeSession: (sessionId: string) => Promise<boolean>;
  cancelSession: (sessionId: string) => Promise<boolean>;
  
  // Participant management
  getSessionParticipants: (sessionId: string) => Promise<SessionParticipant[]>;
  
  // Refresh data
  refreshSessions: () => Promise<void>;
}

export interface SessionManagerState {
  sessions: SessionData[];
  loading: boolean;
  joining: Record<string, boolean>;
  error: string | null;
}

export function useSessionManager(options: UseSessionManagerOptions = {}): SessionManagerState & SessionManagerActions {
  const { user } = useAuth();
  const { 
    sessionType = 'all',
    clubId, 
    includeNonClubSessions = false, 
    filterUserSessions = false,
    filterUserParticipation = false
  } = options;
  
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  // Fetch sessions with unified filtering logic
  const fetchSessions = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('sessions')
        .select(`
          *,
          creator:profiles!sessions_creator_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      // Apply session type filter
      if (sessionType !== 'all') {
        query = query.eq('session_type', sessionType);
      }

      // Apply club filters
      if (clubId && !includeNonClubSessions) {
        query = query.eq('club_id', clubId);
      } else if (clubId && includeNonClubSessions) {
        query = query.or(`club_id.eq.${clubId},club_id.is.null`);
      } else if (!clubId && !includeNonClubSessions) {
        query = query.is('club_id', null);
      }

      // Filter by user creation
      if (filterUserSessions) {
        query = query.eq('creator_id', user.id);
      }

      const { data: sessionsData, error } = await query;

      if (error) throw error;

      // Get participant counts and user participation status
      const enrichedSessions = await Promise.all(
        (sessionsData || []).map(async (session) => {
          const [participantCount, userParticipation, participants] = await Promise.all([
            getParticipantCount(session.id),
            getUserParticipationStatus(session.id),
            filterUserParticipation ? [] : getSessionParticipants(session.id)
          ]);

          return {
            ...session,
            participant_count: participantCount,
            user_has_joined: userParticipation,
            participants: participants
          } as SessionData;
        })
      );

      // Filter by user participation if requested
      const finalSessions = filterUserParticipation 
        ? enrichedSessions.filter(session => session.user_has_joined)
        : enrichedSessions;

      setSessions(finalSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setError('Failed to load sessions');
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, [user, sessionType, clubId, includeNonClubSessions, filterUserSessions, filterUserParticipation]);

  // Get participant count for a session
  const getParticipantCount = async (sessionId: string): Promise<number> => {
    try {
      const { count, error } = await supabase
        .from('session_participants')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', sessionId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting participant count:', error);
      return 0;
    }
  };

  // Check if user has joined a session
  const getUserParticipationStatus = async (sessionId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('session_participants')
        .select('id')
        .eq('session_id', sessionId)
        .eq('user_id', user.id)
        .maybeSingle();

      return !error && !!data;
    } catch (error) {
      return false;
    }
  };

  // Join a session using the fixed join_session function
  const joinSession = async (sessionId: string): Promise<boolean> => {
    if (!user) return false;

    setJoining(prev => ({ ...prev, [sessionId]: true }));
    
    try {
      const { data, error } = await supabase
        .rpc('join_session', {
          session_id_param: sessionId,
          user_id_param: user.id
        });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; tokens_paid?: number };
      
      if (result.success) {
        toast.success(`Successfully joined session! ${result.tokens_paid ? `${result.tokens_paid} tokens charged.` : ''}`);
        await fetchSessions(); // Refresh to update participant counts
        return true;
      } else {
        toast.error(result.error || 'Failed to join session');
        return false;
      }
    } catch (error) {
      console.error('Error joining session:', error);
      toast.error('Failed to join session');
      return false;
    } finally {
      setJoining(prev => ({ ...prev, [sessionId]: false }));
    }
  };

  // Leave a session
  const leaveSession = async (sessionId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('session_participants')
        .delete()
        .eq('session_id', sessionId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Left session successfully!');
      await fetchSessions(); // Refresh to update participant counts
      return true;
    } catch (error) {
      console.error('Error leaving session:', error);
      toast.error('Failed to leave session');
      return false;
    }
  };

  // Get session participants
  const getSessionParticipants = async (sessionId: string): Promise<SessionParticipant[]> => {
    try {
      const { data, error } = await supabase
        .from('session_participants')
        .select(`
          *,
          user:profiles!session_participants_user_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .eq('session_id', sessionId)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      return (data as any) || [];
    } catch (error) {
      console.error('Error fetching session participants:', error);
      return [];
    }
  };

  // Start a session (update status)
  const startSession = async (sessionId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('sessions')
        .update({ 
          updated_at: new Date().toISOString()
          // Add status field if needed in future
        })
        .eq('id', sessionId)
        .eq('creator_id', user.id);

      if (error) throw error;

      toast.success('Session started!');
      await fetchSessions();
      return true;
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error('Failed to start session');
      return false;
    }
  };

  // Complete a session
  const completeSession = async (sessionId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('sessions')
        .update({ 
          updated_at: new Date().toISOString()
          // Add completion status/timestamp if needed
        })
        .eq('id', sessionId)
        .eq('creator_id', user.id);

      if (error) throw error;

      toast.success('Session completed!');
      await fetchSessions();
      return true;
    } catch (error) {
      console.error('Error completing session:', error);
      toast.error('Failed to complete session');
      return false;
    }
  };

  // Cancel/Delete a session
  const cancelSession = async (sessionId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId)
        .eq('creator_id', user.id);

      if (error) throw error;

      toast.success('Session cancelled successfully');
      await fetchSessions();
      return true;
    } catch (error) {
      console.error('Error cancelling session:', error);
      toast.error('Failed to cancel session');
      return false;
    }
  };

  // Load initial data
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const channelName = `sessions_${sessionType}_${clubId || 'global'}_${user.id}`;
    
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
          fetchSessions();
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
          fetchSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, sessionType, clubId, fetchSessions]);

  return {
    // State
    sessions,
    loading,
    joining,
    error,
    
    // Actions
    joinSession,
    leaveSession,
    startSession,
    completeSession,
    cancelSession,
    getSessionParticipants,
    refreshSessions: fetchSessions
  };
}