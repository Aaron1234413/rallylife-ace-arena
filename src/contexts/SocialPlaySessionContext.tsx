
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SocialPlayParticipant {
  id: string;
  user_id: string;
  status: 'invited' | 'accepted' | 'declined' | 'joined';
  joined_at?: string;
  invited_at: string;
  profile?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface SocialPlayCheckIn {
  id: string;
  user_id: string;
  mood_emoji: string;
  notes?: string;
  checked_in_at: string;
  profile?: {
    full_name: string;
  };
}

interface SocialPlaySessionData {
  id?: string;
  created_by?: string;
  session_type?: 'singles' | 'doubles';
  competitive_level?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'active' | 'paused' | 'completed' | 'cancelled';
  start_time?: string;
  end_time?: string;
  paused_duration?: number;
  location?: string;
  notes?: string;
  final_score?: string;
  mood?: string;
  participants?: SocialPlayParticipant[];
  check_ins?: SocialPlayCheckIn[];
}

interface SocialPlaySessionContextType {
  sessionData: SocialPlaySessionData;
  updateSessionData: (data: Partial<SocialPlaySessionData>) => void;
  clearSession: () => void;
  isSessionActive: boolean;
  isSessionPending: boolean;
  createSession: (data: Partial<SocialPlaySessionData>) => Promise<string | null>;
  startSession: (sessionId: string) => Promise<void>;
  joinSession: (sessionId: string) => Promise<void>;
  pauseSession: () => Promise<void>;
  resumeSession: () => Promise<void>;
  endSession: (finalData: Partial<SocialPlaySessionData>) => Promise<void>;
  addCheckIn: (moodEmoji: string, notes?: string) => Promise<void>;
  inviteParticipants: (userIds: string[]) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const SocialPlaySessionContext = createContext<SocialPlaySessionContextType | undefined>(undefined);

const STORAGE_KEY = 'social_play_session_data';

export function SocialPlaySessionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [sessionData, setSessionData] = useState<SocialPlaySessionData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load session data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        setSessionData(parsedData);
        // If we have an active session, fetch latest data
        if (parsedData.id && (parsedData.status === 'active' || parsedData.status === 'pending')) {
          fetchSessionData(parsedData.id);
        }
      } catch (error) {
        console.error('Failed to parse saved session data:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Real-time subscription for session updates
  useEffect(() => {
    if (!sessionData.id) return;

    const subscription = supabase
      .channel(`social_play_session_${sessionData.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'social_play_sessions',
          filter: `id=eq.${sessionData.id}`,
        },
        (payload) => {
          console.log('Session updated:', payload);
          if (payload.new) {
            updateSessionData(payload.new as any);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'social_play_participants',
          filter: `session_id=eq.${sessionData.id}`,
        },
        () => {
          // Refetch participants when they change
          fetchSessionData(sessionData.id!);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'social_play_checkins',
          filter: `session_id=eq.${sessionData.id}`,
        },
        () => {
          // Refetch check-ins when new ones are added
          fetchSessionData(sessionData.id!);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [sessionData.id]);

  const fetchSessionData = async (sessionId: string) => {
    try {
      setLoading(true);
      
      // Fetch session with participants and check-ins
      const { data: session, error: sessionError } = await supabase
        .from('social_play_sessions')
        .select(`
          *,
          social_play_participants (
            *,
            profiles (full_name, avatar_url)
          ),
          social_play_checkins (
            *,
            profiles (full_name)
          )
        `)
        .eq('id', sessionId)
        .single();

      if (sessionError) {
        throw sessionError;
      }

      if (session) {
        const updatedData: SocialPlaySessionData = {
          ...session,
          session_type: session.session_type as 'singles' | 'doubles',
          competitive_level: session.competitive_level as 'low' | 'medium' | 'high',
          status: session.status as 'pending' | 'active' | 'paused' | 'completed' | 'cancelled',
          participants: (session.social_play_participants || []).map((p: any) => ({
            ...p,
            status: p.status as 'invited' | 'accepted' | 'declined' | 'joined',
            profile: p.profiles
          })),
          check_ins: (session.social_play_checkins || []).map((c: any) => ({
            ...c,
            profile: c.profiles
          })),
        };
        setSessionData(updatedData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      }
    } catch (err) {
      console.error('Error fetching session data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch session data');
    } finally {
      setLoading(false);
    }
  };

  const updateSessionData = (data: Partial<SocialPlaySessionData>) => {
    const updated = { ...sessionData, ...data };
    setSessionData(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const clearSession = () => {
    setSessionData({});
    localStorage.removeItem(STORAGE_KEY);
    setError(null);
  };

  const createSession = async (data: Partial<SocialPlaySessionData>): Promise<string | null> => {
    if (!user) return null;

    try {
      setLoading(true);
      setError(null);

      const { data: session, error } = await supabase
        .from('social_play_sessions')
        .insert({
          created_by: user.id,
          session_type: data.session_type || 'singles',
          competitive_level: data.competitive_level || 'medium',
          status: 'pending',
          location: data.location,
          notes: data.notes,
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as first participant
      await supabase
        .from('social_play_participants')
        .insert({
          session_id: session.id,
          user_id: user.id,
          status: 'joined',
          joined_at: new Date().toISOString(),
        });

      updateSessionData({
        ...session,
        session_type: session.session_type as 'singles' | 'doubles',
        competitive_level: session.competitive_level as 'low' | 'medium' | 'high',
        status: session.status as 'pending' | 'active' | 'paused' | 'completed' | 'cancelled',
      });
      return session.id;
    } catch (err) {
      console.error('Error creating session:', err);
      setError(err instanceof Error ? err.message : 'Failed to create session');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const startSession = async (sessionId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('social_play_sessions')
        .update({
          status: 'active',
          start_time: new Date().toISOString(),
        })
        .eq('id', sessionId);

      if (error) throw error;
    } catch (err) {
      console.error('Error starting session:', err);
      setError(err instanceof Error ? err.message : 'Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  const joinSession = async (sessionId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('social_play_participants')
        .update({
          status: 'joined',
          joined_at: new Date().toISOString(),
        })
        .eq('session_id', sessionId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (err) {
      console.error('Error joining session:', err);
      setError(err instanceof Error ? err.message : 'Failed to join session');
    } finally {
      setLoading(false);
    }
  };

  const pauseSession = async () => {
    if (!sessionData.id) return;

    try {
      const { error } = await supabase
        .from('social_play_sessions')
        .update({ status: 'paused' })
        .eq('id', sessionData.id);

      if (error) throw error;
    } catch (err) {
      console.error('Error pausing session:', err);
      setError(err instanceof Error ? err.message : 'Failed to pause session');
    }
  };

  const resumeSession = async () => {
    if (!sessionData.id) return;

    try {
      const { error } = await supabase
        .from('social_play_sessions')
        .update({ status: 'active' })
        .eq('id', sessionData.id);

      if (error) throw error;
    } catch (err) {
      console.error('Error resuming session:', err);
      setError(err instanceof Error ? err.message : 'Failed to resume session');
    }
  };

  const endSession = async (finalData: Partial<SocialPlaySessionData>) => {
    if (!sessionData.id) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('social_play_sessions')
        .update({
          status: 'completed',
          end_time: new Date().toISOString(),
          final_score: finalData.final_score,
          notes: finalData.notes,
          mood: finalData.mood,
        })
        .eq('id', sessionData.id);

      if (error) throw error;

      clearSession();
    } catch (err) {
      console.error('Error ending session:', err);
      setError(err instanceof Error ? err.message : 'Failed to end session');
    } finally {
      setLoading(false);
    }
  };

  const addCheckIn = async (moodEmoji: string, notes?: string) => {
    if (!sessionData.id || !user) return;

    try {
      const { error } = await supabase
        .from('social_play_checkins')
        .insert({
          session_id: sessionData.id,
          user_id: user.id,
          mood_emoji: moodEmoji,
          notes: notes,
        });

      if (error) throw error;
    } catch (err) {
      console.error('Error adding check-in:', err);
      setError(err instanceof Error ? err.message : 'Failed to add check-in');
    }
  };

  const inviteParticipants = async (userIds: string[]) => {
    if (!sessionData.id) return;

    try {
      setLoading(true);
      const invitations = userIds.map(userId => ({
        session_id: sessionData.id!,
        user_id: userId,
        status: 'invited' as const,
      }));

      const { error } = await supabase
        .from('social_play_participants')
        .insert(invitations);

      if (error) throw error;
    } catch (err) {
      console.error('Error inviting participants:', err);
      setError(err instanceof Error ? err.message : 'Failed to invite participants');
    } finally {
      setLoading(false);
    }
  };

  const isSessionActive = sessionData.status === 'active';
  const isSessionPending = sessionData.status === 'pending';

  return (
    <SocialPlaySessionContext.Provider value={{
      sessionData,
      updateSessionData,
      clearSession,
      isSessionActive,
      isSessionPending,
      createSession,
      startSession,
      joinSession,
      pauseSession,
      resumeSession,
      endSession,
      addCheckIn,
      inviteParticipants,
      loading,
      error
    }}>
      {children}
    </SocialPlaySessionContext.Provider>
  );
}

export function useSocialPlaySession() {
  const context = useContext(SocialPlaySessionContext);
  if (context === undefined) {
    throw new Error('useSocialPlaySession must be used within a SocialPlaySessionProvider');
  }
  return context;
}
