
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUnifiedInvitations } from '@/hooks/useUnifiedInvitations';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SafeContextProvider } from '@/components/ui/safe-context-provider';

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
  partner_name?: string;
  partner_id?: string;
  opponent_1_name?: string;
  opponent_1_id?: string;
  opponent_2_name?: string;
  opponent_2_id?: string;
  mid_match_mood?: string;
  mid_match_notes?: string;
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
    createMatchInvitation: createInvitation,
    refreshInvitations
  } = useUnifiedInvitations();

  // Helper function to safely parse sets data
  const parseSetsData = (sets: any): SetData[] => {
    if (!sets) return [];
    
    try {
      let parsed: any;
      if (typeof sets === 'string') {
        parsed = JSON.parse(sets);
      } else {
        parsed = sets;
      }
      
      if (Array.isArray(parsed)) {
        return parsed.map((set: any) => ({
          playerScore: set.playerScore || '',
          opponentScore: set.opponentScore || '',
          completed: Boolean(set.completed)
        }));
      }
    } catch (e) {
      console.error('Error parsing sets data:', e);
    }
    
    return [{ playerScore: '', opponentScore: '', completed: false }];
  };

  // Helper function to safely cast status
  const castStatus = (status: any): 'active' | 'completed' | 'abandoned' => {
    if (status === 'active' || status === 'completed' || status === 'abandoned') {
      return status;
    }
    return 'active';
  };

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
          .maybeSingle();

        if (error) {
          console.error('Error fetching active match session:', error);
          setError(error.message);
        }

        if (data) {
          // Convert the database response to our interface format
          const session: MatchSessionData = {
            id: data.id,
            player_id: data.player_id,
            opponent_name: data.opponent_name,
            opponent_id: data.opponent_id,
            is_doubles: data.is_doubles || false,
            match_type: data.match_type,
            start_time: new Date(data.start_time),
            end_time: data.completed_at ? new Date(data.completed_at) : undefined,
            status: castStatus(data.status),
            sets: parseSetsData(data.sets),
            current_set: data.current_set,
            final_notes: data.match_notes,
            end_mood: data.end_mood,
            partner_name: data.partner_name,
            partner_id: data.partner_id,
            opponent_1_name: data.opponent_1_name,
            opponent_1_id: data.opponent_1_id,
            opponent_2_name: data.opponent_2_name,
            opponent_2_id: data.opponent_2_id,
            mid_match_mood: data.mid_match_mood,
            mid_match_notes: data.mid_match_notes
          };
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
        .update({ sets: JSON.stringify(updatedSets) })
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
        .update({ sets: JSON.stringify(updatedSets), current_set: nextSetIndex })
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
        .update({ 
          status: 'completed', 
          completed_at: new Date().toISOString(), 
          match_notes: finalNotes, 
          end_mood: endMood 
        })
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
    <SafeContextProvider 
      requireAuth={true}
      loadingMessage="Loading match session..."
      fallbackComponent={
        <div className="text-center p-4">
          <p className="text-muted-foreground">Match sessions unavailable</p>
        </div>
      }
    >
      <MatchSessionContext.Provider value={value}>
        {children}
      </MatchSessionContext.Provider>
    </SafeContextProvider>
  );
};
