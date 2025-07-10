import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Session {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  start_datetime?: string;
  end_datetime?: string;
  location?: string;
  max_participants: number;
  current_participants: number;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  creator_id: string;
  creator_name?: string;
  skill_level?: string;
  session_type: string;
  club_id?: string;
  notes?: string;
  format?: string;
  created_at: string;
  updated_at: string;
  participants?: Array<{
    id: string;
    user_id: string;
    status: string;
    joined_at: string;
    user?: {
      id: string;
      full_name?: string;
      avatar_url?: string;
    };
  }>;
  stakes_amount?: number;
  cost_tokens?: number;
  cost_money?: number;
  payment_method?: 'tokens' | 'money';
  max_players?: number;
}

export type SessionData = Session;

export interface SessionManagerOptions {
  sessionType?: string;
  clubId?: string;
  includeNonClubSessions?: boolean;
  filterUserParticipation?: boolean;
  filterUserSessions?: boolean;
}

export function useSessionManager(options: SessionManagerOptions | string = {}) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const config = typeof options === 'string' ? { clubId: options } : options;
  const { sessionType = 'all', clubId, includeNonClubSessions = false } = config;

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

      if (config.filterUserParticipation) {
        // Get sessions where user is a participant
        const { data: userSessions } = await supabase
          .from('session_participants')
          .select('session_id')
          .eq('user_id', user.id);
        
        const sessionIds = userSessions?.map(p => p.session_id) || [];
        if (sessionIds.length > 0) {
          query = query.in('id', sessionIds);
        } else {
          setSessions([]);
          return;
        }
      }

      if (config.filterUserSessions) {
        query = query.eq('creator_id', user.id);
      }

      const { data: sessionsData, error } = await query;

      if (error) throw error;

      // Get participant counts and transform data
      const sessionsWithCounts = await Promise.all(
        (sessionsData || []).map(async (session) => {
          const { count } = await supabase
            .from('session_participants')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', session.id);

          // Transform to Session interface format
          return {
            id: session.id,
            title: `${session.session_type} Session`,
            description: session.notes || '',
            start_time: session.created_at,
            end_time: session.session_ended_at || '',
            start_datetime: session.session_started_at || '',
            end_datetime: session.session_ended_at || '',
            location: session.location,
            max_participants: session.max_players,
            current_participants: count || 0,
            status: session.session_started_at 
              ? (session.session_ended_at ? 'completed' : 'active')
              : 'upcoming',
            creator_id: session.creator_id,
            creator_name: session.creator?.full_name || 'Unknown',
            skill_level: 'intermediate',
            session_type: session.session_type,
            club_id: session.club_id,
            notes: session.notes,
            format: session.format,
            created_at: session.created_at,
            updated_at: session.updated_at,
            participants: [],
            stakes_amount: session.stakes_amount || 0,
            cost_tokens: session.stakes_amount || 0,
            cost_money: 0,
            payment_method: 'tokens' as const,
            max_players: session.max_players
          } as Session;
        })
      );

      setSessions(sessionsWithCounts);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, [user, clubId, sessionType, includeNonClubSessions, config.filterUserParticipation, config.filterUserSessions]);

  const createSession = async (sessionData: Partial<Session>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          creator_id: user.id,
          session_type: sessionData.session_type || 'challenge',
          format: sessionData.format || 'singles',
          max_players: sessionData.max_participants || 2,
          stakes_amount: sessionData.stakes_amount || 0,
          location: sessionData.location || '',
          notes: sessionData.notes || '',
          is_private: false,
          club_id: sessionData.club_id || null
        })
        .select()
        .single();

      if (error) throw error;

      await fetchSessions(); // Refresh sessions list
      return data;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    fetchSessions();

    const channel = supabase
      .channel(`sessions_realtime_${clubId || 'all'}`)
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
  }, [user, clubId, fetchSessions]);

  const joinSession = async (sessionId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .rpc('join_session_with_hp_check', {
          session_id_param: sessionId,
          user_id_param: user.id
        });

      if (error) throw error;

      const result = data as { success: boolean; error?: string };
      if (result.success) {
        await fetchSessions();
        return true;
      } else {
        console.error('Failed to join session:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error joining session:', error);
      return false;
    }
  };

  const leaveSession = async (sessionId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('session_participants')
        .delete()
        .eq('session_id', sessionId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchSessions();
      return true;
    } catch (error) {
      console.error('Error leaving session:', error);
      return false;
    }
  };

  const startSession = async (sessionId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .rpc('start_session_with_tracking', {
          session_id_param: sessionId,
          starter_id_param: user.id
        });

      if (error) throw error;

      const result = data as { success: boolean; error?: string };
      if (result.success) {
        await fetchSessions();
        return true;
      } else {
        console.error('Failed to start session:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error starting session:', error);
      return false;
    }
  };

  const completeSession = async (sessionId: string, completionData?: any): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .rpc('complete_session_with_hp', {
          session_id_param: sessionId,
          winner_id_param: completionData?.winnerId || null,
          winning_team_param: completionData?.winningTeam || null
        });

      if (error) throw error;

      const result = data as { success: boolean; error?: string };
      if (result.success) {
        await fetchSessions();
        return true;
      } else {
        console.error('Failed to complete session:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error completing session:', error);
      return false;
    }
  };

  const cancelSession = async (sessionId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId)
        .eq('creator_id', user.id);

      if (error) throw error;

      await fetchSessions();
      return true;
    } catch (error) {
      console.error('Error cancelling session:', error);
      return false;
    }
  };

  return {
    sessions,
    loading,
    error,
    createSession,
    refreshSessions: fetchSessions,
    joinSession,
    leaveSession,
    startSession,
    completeSession,
    cancelSession
  };
}