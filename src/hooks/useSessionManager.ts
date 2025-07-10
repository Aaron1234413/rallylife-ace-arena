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

      // Mock sessions data for testing
      const mockSessions: Session[] = [
        {
          id: '1',
          title: 'Morning Practice Session',
          description: 'Intensive practice for advanced players',
          start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          end_time: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
          start_datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          end_datetime: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
          location: 'Court 1',
          max_participants: 4,
          current_participants: 2,
          status: 'upcoming',
          creator_id: user.id,
          creator_name: 'John Doe',
          skill_level: 'advanced',
          session_type: sessionType === 'all' ? 'practice' : sessionType,
          club_id: clubId,
          notes: 'Practice session notes',
          format: 'singles',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          participants: [],
          stakes_amount: 0,
          cost_tokens: 0,
          cost_money: 0,
          payment_method: 'tokens',
          max_players: 4
        }
      ];

      setSessions(mockSessions);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, [user, clubId, sessionType]);

  const createSession = async (sessionData: Partial<Session>) => {
    if (!user) throw new Error('User not authenticated');
    
    // Mock session creation
    const newSession: Session = {
      id: Date.now().toString(),
      ...sessionData,
      creator_id: user.id,
      status: 'upcoming',
      current_participants: 0
    } as Session;

    setSessions(prev => [...prev, newSession]);
    return newSession;
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
          table: 'club_sessions'
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

  const joinSession = async (sessionId: string) => {
    console.log('Joining session:', sessionId);
    return true;
  };

  const leaveSession = async (sessionId: string) => {
    console.log('Leaving session:', sessionId);
    return true;
  };

  const startSession = async (sessionId: string) => {
    console.log('Starting session:', sessionId);
    return true;
  };

  const completeSession = async (sessionId: string, completionData?: any) => {
    console.log('Completing session:', sessionId, completionData);
    return true;
  };

  const cancelSession = async (sessionId: string) => {
    console.log('Cancelling session:', sessionId);
    return true;
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