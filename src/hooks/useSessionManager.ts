import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Session {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  max_participants: number;
  current_participants: number;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  creator_id: string;
  creator_name?: string;
  skill_level?: string;
  session_type: string;
  club_id?: string;
}

export function useSessionManager(clubId?: string) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          location: 'Court 1',
          max_participants: 4,
          current_participants: 2,
          status: 'upcoming',
          creator_id: user.id,
          creator_name: 'John Doe',
          skill_level: 'advanced',
          session_type: 'practice',
          club_id: clubId
        }
      ];

      setSessions(mockSessions);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, [user, clubId]);

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

  return {
    sessions,
    loading,
    error,
    createSession,
    refreshSessions: fetchSessions
  };
}