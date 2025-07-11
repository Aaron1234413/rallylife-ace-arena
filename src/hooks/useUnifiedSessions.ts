import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface UnifiedSession {
  id: string;
  creator_id: string;
  session_type: string;
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
  
  // Related data
  creator?: {
    full_name: string;
    avatar_url?: string;
  };
  participants?: SessionParticipant[];
}

export interface SessionParticipant {
  id: string;
  session_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  payment_status: string;
  attendance_status: string;
  tokens_paid: number;
  money_paid: number;
  notes?: string;
  
  // Related data
  user?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface UseUnifiedSessionsOptions {
  clubId?: string;
  includeNonClubSessions?: boolean;
  filterUserSessions?: boolean;
}

export function useUnifiedSessions(options: UseUnifiedSessionsOptions = {}) {
  const { user } = useAuth();
  const { clubId, includeNonClubSessions = false, filterUserSessions = false } = options;
  
  const [sessions, setSessions] = useState<UnifiedSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<Record<string, boolean>>({});

  // Fetch sessions with proper filtering
  const fetchSessions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
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

      // Apply filters based on options
      if (clubId && !includeNonClubSessions) {
        // Club-specific sessions only
        query = query.eq('club_id', clubId);
      } else if (clubId && includeNonClubSessions) {
        // Club sessions + global sessions
        query = query.or(`club_id.eq.${clubId},club_id.is.null`);
      } else if (!clubId && !includeNonClubSessions) {
        // Non-club sessions only
        query = query.is('club_id', null);
      }
      // If clubId is null and includeNonClubSessions is true, get all sessions

      if (filterUserSessions) {
        query = query.eq('creator_id', user.id);
      }

      const { data: sessionsData, error } = await query;

      if (error) throw error;

      // Get participant counts and user participation status
      const sessionsWithCounts = await Promise.all(
        (sessionsData || []).map(async (session) => {
          const [participantCount, userParticipation] = await Promise.all([
            getParticipantCount(session.id),
            getUserParticipationStatus(session.id)
          ]);

          return {
            ...session,
            participant_count: participantCount,
            user_has_joined: userParticipation
          };
        })
      );

      setSessions(sessionsWithCounts);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

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
        .single();

      return !error && !!data;
    } catch (error) {
      return false;
    }
  };

  // Join a session
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
  }, [user, clubId, includeNonClubSessions, filterUserSessions]);

  // TEMPORARILY DISABLED: Real-time subscriptions to fix Play page loading
  // TODO: Re-enable with proper channel management to prevent conflicts
  /*
  useEffect(() => {
    if (!user) return;

    const channelName = `unified_sessions_${clubId || 'global'}_${user.id}`;
    
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
  }, [user, clubId]);
  */

  return {
    sessions,
    loading,
    joining,
    joinSession,
    leaveSession,
    getSessionParticipants,
    startSession,
    cancelSession,
    refreshSessions: fetchSessions
  };
}