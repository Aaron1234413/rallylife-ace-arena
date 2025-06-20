import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface SocialPlaySessionData {
  id: string;
  created_by: string;
  session_type: 'singles' | 'doubles';
  competitive_level: 'low' | 'medium' | 'high';
  status: 'pending' | 'active' | 'paused' | 'completed' | 'cancelled';
  start_time: string | null;
  end_time: string | null;
  paused_duration: number;
  location: string | null;
  notes: string | null;
  mood: string | null;
  final_score: string | null;
  created_at: string;
  updated_at: string;
}

interface SocialPlayParticipant {
  id: string;
  session_id: string;
  user_id: string;
  status: 'invited' | 'accepted' | 'declined' | 'joined';
  invited_at: string;
  joined_at: string | null;
  user?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

interface SocialPlaySessionContextType {
  activeSession: SocialPlaySessionData | null;
  participants: SocialPlayParticipant[];
  isSessionActive: boolean;
  isSessionOwner: boolean;
  joinSession: (sessionId: string) => Promise<void>;
  leaveSession: () => void;
  updateSessionStatus: (status: SocialPlaySessionData['status'], updates?: Partial<SocialPlaySessionData>) => Promise<void>;
  addParticipant: (userId: string) => Promise<void>;
  removeParticipant: (participantId: string) => Promise<void>;
  loading: boolean;
}

const SocialPlaySessionContext = createContext<SocialPlaySessionContextType | undefined>(undefined);

const STORAGE_KEY = 'social_play_active_session';

export function SocialPlaySessionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeSession, setActiveSession] = useState<SocialPlaySessionData | null>(null);
  const [participants, setParticipants] = useState<SocialPlayParticipant[]>([]);
  const [loading, setLoading] = useState(false);

  // Load active session on mount
  useEffect(() => {
    if (user?.id) {
      loadActiveSession();
    }
  }, [user?.id]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!activeSession?.id) return;

    console.log('Setting up real-time subscriptions for session:', activeSession.id);

    // Session updates subscription
    const sessionChannel = supabase
      .channel(`session-${activeSession.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'social_play_sessions',
          filter: `id=eq.${activeSession.id}`
        },
        (payload) => {
          console.log('Session update received:', payload);
          if (payload.eventType === 'UPDATE') {
            setActiveSession(payload.new as SocialPlaySessionData);
          } else if (payload.eventType === 'DELETE') {
            handleSessionDeleted();
          }
        }
      )
      .subscribe();

    // Participants updates subscription
    const participantsChannel = supabase
      .channel(`participants-${activeSession.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'social_play_participants',
          filter: `session_id=eq.${activeSession.id}`
        },
        (payload) => {
          console.log('Participants update received:', payload);
          loadParticipants();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscriptions');
      supabase.removeChannel(sessionChannel);
      supabase.removeChannel(participantsChannel);
    };
  }, [activeSession?.id]);

  const loadActiveSession = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Check for stored session first
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const storedSession = JSON.parse(stored);
        
        // Verify session still exists and is active
        const { data: session, error } = await supabase
          .from('social_play_sessions')
          .select('*')
          .eq('id', storedSession.id)
          .in('status', ['pending', 'active', 'paused'])
          .single();

        if (session && !error) {
          setActiveSession(session as SocialPlaySessionData);
          await loadParticipants(session.id);
          return;
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }

      // Look for any active session the user is involved in
      const { data: sessions, error } = await supabase
        .from('social_play_sessions')
        .select(`
          *,
          participants:social_play_participants(
            *,
            user:profiles(id, full_name, avatar_url)
          )
        `)
        .or(`created_by.eq.${user.id},social_play_participants.user_id.eq.${user.id}`)
        .in('status', ['pending', 'active', 'paused'])
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error loading active session:', error);
        return;
      }

      if (sessions && sessions.length > 0) {
        const session = sessions[0];
        setActiveSession(session as SocialPlaySessionData);
        setParticipants((session.participants || []) as SocialPlayParticipant[]);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      }
    } catch (error) {
      console.error('Failed to load active session:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadParticipants = async (sessionId?: string) => {
    const id = sessionId || activeSession?.id;
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('social_play_participants')
        .select(`
          *,
          user:profiles(id, full_name, avatar_url)
        `)
        .eq('session_id', id);

      if (error) {
        console.error('Error loading participants:', error);
        return;
      }

      setParticipants((data || []) as SocialPlayParticipant[]);
    } catch (error) {
      console.error('Failed to load participants:', error);
    }
  };

  const joinSession = async (sessionId: string) => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Get session details
      const { data: session, error: sessionError } = await supabase
        .from('social_play_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError || !session) {
        throw new Error('Session not found');
      }

      // Check if user is already a participant
      const { data: existingParticipant } = await supabase
        .from('social_play_participants')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', user.id)
        .single();

      if (existingParticipant) {
        // Update participation status to joined
        const { error: updateError } = await supabase
          .from('social_play_participants')
          .update({ 
            status: 'joined',
            joined_at: new Date().toISOString()
          })
          .eq('id', existingParticipant.id);

        if (updateError) throw updateError;
      }

      setActiveSession(session as SocialPlaySessionData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      await loadParticipants(sessionId);

      toast({
        title: 'Joined Session',
        description: 'You have successfully joined the social play session!',
      });
    } catch (error: any) {
      console.error('Failed to join session:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to join session',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const leaveSession = () => {
    setActiveSession(null);
    setParticipants([]);
    localStorage.removeItem(STORAGE_KEY);
    
    toast({
      title: 'Left Session',
      description: 'You have left the social play session.',
    });
  };

  const updateSessionStatus = async (status: SocialPlaySessionData['status'], updates: Partial<SocialPlaySessionData> = {}) => {
    if (!activeSession || !user?.id) return;

    setLoading(true);
    try {
      const updateData = {
        status,
        updated_at: new Date().toISOString(),
        ...updates
      };

      // Add start_time when status changes to active
      if (status === 'active' && !activeSession.start_time) {
        updateData.start_time = new Date().toISOString();
      }

      // Add end_time when status changes to completed
      if (status === 'completed' && !activeSession.end_time) {
        updateData.end_time = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('social_play_sessions')
        .update(updateData)
        .eq('id', activeSession.id)
        .select()
        .single();

      if (error) throw error;

      setActiveSession(data as SocialPlaySessionData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

      // Clear from storage if session is completed or cancelled
      if (status === 'completed' || status === 'cancelled') {
        localStorage.removeItem(STORAGE_KEY);
      }

      toast({
        title: 'Session Updated',
        description: `Session status changed to ${status}`,
      });
    } catch (error: any) {
      console.error('Failed to update session status:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update session',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addParticipant = async (userId: string) => {
    if (!activeSession || !user?.id) return;

    try {
      const { error } = await supabase
        .from('social_play_participants')
        .insert({
          session_id: activeSession.id,
          user_id: userId,
          status: 'invited'
        });

      if (error) throw error;

      toast({
        title: 'Participant Added',
        description: 'Player has been invited to the session.',
      });
    } catch (error: any) {
      console.error('Failed to add participant:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add participant',
        variant: 'destructive',
      });
    }
  };

  const removeParticipant = async (participantId: string) => {
    if (!activeSession || !user?.id) return;

    try {
      const { error } = await supabase
        .from('social_play_participants')
        .delete()
        .eq('id', participantId);

      if (error) throw error;

      toast({
        title: 'Participant Removed',
        description: 'Player has been removed from the session.',
      });
    } catch (error: any) {
      console.error('Failed to remove participant:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove participant',
        variant: 'destructive',
      });
    }
  };

  const handleSessionDeleted = () => {
    setActiveSession(null);
    setParticipants([]);
    localStorage.removeItem(STORAGE_KEY);
    
    toast({
      title: 'Session Ended',
      description: 'The social play session has been ended.',
    });
  };

  const isSessionActive = activeSession !== null;
  const isSessionOwner = activeSession?.created_by === user?.id;

  return (
    <SocialPlaySessionContext.Provider
      value={{
        activeSession,
        participants,
        isSessionActive,
        isSessionOwner,
        joinSession,
        leaveSession,
        updateSessionStatus,
        addParticipant,
        removeParticipant,
        loading
      }}
    >
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
