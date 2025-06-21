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
  session_creator_id: string;
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
  completeSession: (finalScore?: string, notes?: string, mood?: string) => Promise<any>;
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

  const persistSession = (session: SocialPlaySessionData | null) => {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Load active session on mount
  useEffect(() => {
    if (user?.id) {
      loadActiveSession();
    }
  }, [user?.id]);

  // Enhanced real-time subscriptions with better error handling
  useEffect(() => {
    if (!activeSession?.id || !user?.id) return;

    console.log('Setting up enhanced real-time subscriptions for session:', activeSession.id);

    // Session updates subscription
    const sessionChannel = supabase
      .channel(`session-updates-${activeSession.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'social_play_sessions',
          filter: `id=eq.${activeSession.id}`
        },
        (payload) => {
          console.log('Session real-time update:', payload);
          if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedSession = payload.new as SocialPlaySessionData;
            setActiveSession(updatedSession);
            persistSession(updatedSession);
            
            // Show toast for status changes
            if (payload.old && payload.old.status !== updatedSession.status) {
              toast({
                title: 'Session Updated',
                description: `Session status changed to ${updatedSession.status}`,
              });
            }
          } else if (payload.eventType === 'DELETE') {
            handleSessionDeleted();
          }
        }
      )
      .subscribe((status) => {
        console.log('Session channel status:', status);
      });

    // Participants updates subscription with enhanced filtering
    const participantsChannel = supabase
      .channel(`participants-updates-${activeSession.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'social_play_participants',
          filter: `session_id=eq.${activeSession.id}`
        },
        (payload) => {
          console.log('Participants real-time update:', payload);
          
          // Reload participants data to get updated info
          loadParticipants();
          
          // Show toast for participant changes
          if (payload.eventType === 'INSERT' && payload.new) {
            const newParticipant = payload.new as SocialPlayParticipant;
            if (newParticipant.user_id !== user.id) {
              toast({
                title: 'Player Invited',
                description: 'A new player has been invited to the session',
              });
            }
          } else if (payload.eventType === 'UPDATE' && payload.new && payload.old) {
            const updatedParticipant = payload.new as SocialPlayParticipant;
            const oldParticipant = payload.old as SocialPlayParticipant;
            
            if (oldParticipant.status !== updatedParticipant.status) {
              toast({
                title: 'Player Status Updated',
                description: `A player's status changed to ${updatedParticipant.status}`,
              });
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Participants channel status:', status);
      });

    return () => {
      console.log('Cleaning up real-time subscriptions');
      supabase.removeChannel(sessionChannel);
      supabase.removeChannel(participantsChannel);
    };
  }, [activeSession?.id, user?.id]);

  const loadActiveSession = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Check for stored session first
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const storedSession = JSON.parse(stored);
        
        // Verify stored session is still valid and accessible
        const { data: session, error } = await supabase
          .from('social_play_sessions')
          .select('*')
          .eq('id', storedSession.id)
          .in('status', ['pending', 'active', 'paused'])
          .single();

        // Check if user has access (either owns it or participates)
        if (session) {
          const hasAccess = session.created_by === user.id || 
            await checkUserParticipation(session.id, user.id);
          
          if (hasAccess) {
            setActiveSession(session as SocialPlaySessionData);
            await loadParticipants(session.id);
            return;
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
        } else if (error) {
          localStorage.removeItem(STORAGE_KEY);
        }
      }

      // Look for any active session the user owns
      const { data: ownedSessions, error: ownedError } = await supabase
        .from('social_play_sessions')
        .select('*')
        .eq('created_by', user.id)
        .in('status', ['pending', 'active', 'paused'])
        .order('created_at', { ascending: false })
        .limit(1);

      if (!ownedError && ownedSessions && ownedSessions.length > 0) {
        const session = ownedSessions[0];
        setActiveSession(session as SocialPlaySessionData);
        await loadParticipants(session.id);
        persistSession(session as SocialPlaySessionData);
        return;
      }

      // Look for any active session the user participates in
      const { data: participantSessions, error: participantError } = await supabase
        .from('social_play_participants')
        .select(`
          session:social_play_sessions(*)
        `)
        .eq('user_id', user.id)
        .in('session.status', ['pending', 'active', 'paused'])
        .order('session.created_at', { ascending: false })
        .limit(1);

      if (!participantError && participantSessions && participantSessions.length > 0) {
        const session = participantSessions[0].session;
        if (session) {
          setActiveSession(session as SocialPlaySessionData);
          await loadParticipants(session.id);
          persistSession(session as SocialPlaySessionData);
        }
      }
    } catch (error) {
      console.error('Failed to load active session:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkUserParticipation = async (sessionId: string, userId: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('social_play_participants')
      .select('id')
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .single();
    
    return !error && !!data;
  };

  const loadParticipants = async (sessionId?: string) => {
    const id = sessionId || activeSession?.id;
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('social_play_participants')
        .select(`
          *,
          user:profiles!social_play_participants_user_id_fkey(id, full_name, avatar_url)
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
      // Get session details first
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
      } else {
        // Add as new participant (only if invited by session creator or public session)
        const { error: insertError } = await supabase
          .from('social_play_participants')
          .insert({
            session_id: sessionId,
            user_id: user.id,
            session_creator_id: session.created_by,
            status: 'joined',
            joined_at: new Date().toISOString()
          });

        if (insertError) throw insertError;
      }

      setActiveSession(session as SocialPlaySessionData);
      persistSession(session as SocialPlaySessionData);
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
    persistSession(null);
    
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

      const updatedSession = data as SocialPlaySessionData;
      setActiveSession(updatedSession);
      
      // Clear from storage if session is completed or cancelled
      if (status === 'completed' || status === 'cancelled') {
        persistSession(null);
      } else {
        persistSession(updatedSession);
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

  const completeSession = async (finalScore?: string, notes?: string, mood?: string) => {
    if (!activeSession || !user?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('complete_social_play_session', {
          session_id: activeSession.id,
          final_score: finalScore || null,
          notes: notes || null,
          mood: mood || null
        });

      if (error) throw error;

      const result = data as any;
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to complete session');
      }

      // Clear session from storage since it's completed
      setActiveSession(null);
      setParticipants([]);
      persistSession(null);

      toast({
        title: 'Session Completed!',
        description: `Earned ${result.rewards.hp} HP, ${result.rewards.xp} XP, and ${result.rewards.tokens} tokens!`,
      });

      return result;
    } catch (error: any) {
      console.error('Failed to complete session:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete session',
        variant: 'destructive',
      });
      throw error;
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
          session_creator_id: activeSession.created_by,
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
    persistSession(null);
    
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
        completeSession,
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
