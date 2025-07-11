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
    
    console.log('Creating session with data:', sessionData);
    
    // Insert into the actual database
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        creator_id: user.id,
        session_type: sessionData.session_type,
        location: sessionData.location,
        max_players: sessionData.max_participants,
        stakes_amount: sessionData.stakes_amount || 0,
        notes: sessionData.description,
        club_id: sessionData.club_id,
        is_private: false,
        invitation_code: null,
        session_source: 'manual'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Database error creating session:', error);
      throw new Error(`Failed to create session: ${error.message}`);
    }
    
    console.log('Session created successfully:', data);
    
    // Convert database format to our Session interface
    const newSession: Session = {
      id: data.id,
      title: `${sessionData.session_type} Session`,
      description: sessionData.description,
      start_time: sessionData.start_time || new Date().toISOString(),
      end_time: sessionData.end_time || new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      location: data.location,
      max_participants: data.max_players,
      current_participants: 0,
      status: 'upcoming',
      creator_id: data.creator_id,
      session_type: data.session_type,
      club_id: data.club_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      stakes_amount: data.stakes_amount
    } as Session;

    // Update local state
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