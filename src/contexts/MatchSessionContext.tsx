import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMatchInvitations } from '@/hooks/useMatchInvitations';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SetData {
  playerScore: string;
  opponentScore: string;
  completed: boolean;
}

interface MatchSessionData {
  id: string;
  player_id: string;
  opponent_name: string;
  opponent_id: string;
  is_doubles: boolean;
  match_type: string;
  start_time: Date;
  end_time?: Date;
  status: 'active' | 'completed' | 'abandoned';
  sets: SetData[];
  current_set: number;
  final_notes?: string;
  end_mood?: string;
}

interface MatchSessionContextType {
  sessionData: MatchSessionData | null;
  isSessionActive: boolean;
  loading: boolean;
  error: string | null;
  updateSessionData: (data: Partial<MatchSessionData>) => void;
  logSetScore: (playerScore: string, opponentScore: string) => Promise<void>;
  startNextSet: () => Promise<void>;
  endMatch: (finalNotes?: string, endMood?: string) => Promise<void>;
  createInvitation: (params: any) => Promise<any>;
  refreshInvitations: () => Promise<void>;
  receivedInvitations: any[];
  sentInvitations: any[];
  invitationsLoading: boolean;
}

const MatchSessionContext = createContext<MatchSessionContextType | undefined>(undefined);

export const useMatchSession = () => {
  const context = useContext(MatchSessionContext);
  if (!context) {
    throw new Error('useMatchSession must be used within a MatchSessionProvider');
  }
  return context;
};

export const MatchSessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [sessionData, setSessionData] = useState<MatchSessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use the match invitations hook
  const {
    receivedInvitations,
    sentInvitations,
    loading: invitationsLoading,
    createInvitation,
    refreshInvitations
  } = useMatchInvitations();

  useEffect(() => {
    const fetchActiveSession = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('active_match_sessions')
          .select('*')
          .eq('player_id', user.id)
          .eq('status', 'active')
          .single();

        if (error) {
          console.error('Error fetching active match session:', error);
          setError(error.message);
        }

        if (data) {
          // Convert the start_time to a Date object
          const session = {
            ...data,
            start_time: new Date(data.start_time),
          } as MatchSessionData;
          setSessionData(session);
        } else {
          setSessionData(null);
        }
      } catch (err: any) {
        console.error('Unexpected error fetching active match session:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveSession();
  }, [user]);

  const updateSessionData = (data: Partial<MatchSessionData>) => {
    setSessionData((prevSessionData) => {
      if (!prevSessionData) return prevSessionData;
      return { ...prevSessionData, ...data };
    });
  };

  const logSetScore = async (playerScore: string, opponentScore: string) => {
    if (!sessionData) {
      console.error('No active session to log score.');
      return;
    }

    const updatedSets = [...sessionData.sets];
    updatedSets[sessionData.current_set] = {
      playerScore,
      opponentScore,
      completed: true,
    };

    try {
      const { error } = await supabase
        .from('active_match_sessions')
        .update({ sets: updatedSets })
        .eq('id', sessionData.id);

      if (error) {
        console.error('Error logging set score:', error);
        throw error;
      }

      updateSessionData({ sets: updatedSets });
    } catch (error) {
      console.error('Error in logSetScore:', error);
      toast.error('Failed to save set score. Please try again.');
      throw error;
    }
  };

  const startNextSet = async () => {
    if (!sessionData) {
      console.error('No active session to start next set.');
      return;
    }

    const nextSetIndex = sessionData.current_set + 1;
    const updatedSets = [...sessionData.sets, { playerScore: '', opponentScore: '', completed: false }];

    try {
      const { error } = await supabase
        .from('active_match_sessions')
        .update({ sets: updatedSets, current_set: nextSetIndex })
        .eq('id', sessionData.id);

      if (error) {
        console.error('Error starting next set:', error);
        throw error;
      }

      updateSessionData({ sets: updatedSets, current_set: nextSetIndex });
    } catch (error) {
      console.error('Error in startNextSet:', error);
      toast.error('Failed to start next set. Please try again.');
      throw error;
    }
  };

  const endMatch = async (finalNotes?: string, endMood?: string) => {
    if (!sessionData) {
      console.error('No active session to end.');
      return;
    }

    try {
      const { error } = await supabase
        .from('active_match_sessions')
        .update({ status: 'completed', end_time: new Date().toISOString(), final_notes: finalNotes, end_mood: endMood })
        .eq('id', sessionData.id);

      if (error) {
        console.error('Error ending match:', error);
        throw error;
      }

      setSessionData(null);
    } catch (error) {
      console.error('Error in endMatch:', error);
      toast.error('Failed to end match. Please try again.');
      throw error;
    }
  };

  const value = {
    sessionData,
    isSessionActive: !!sessionData,
    loading,
    error,
    updateSessionData,
    logSetScore,
    startNextSet,
    endMatch,
    createInvitation,
    refreshInvitations,
    receivedInvitations,
    sentInvitations,
    invitationsLoading
  };

  return (
    <MatchSessionContext.Provider value={value}>
      {children}
    </MatchSessionContext.Provider>
  );
};
