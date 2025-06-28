
import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useMatchSessions } from '@/hooks/useMatchSessions';

interface MatchSessionData {
  // Start match data
  opponentName: string;
  opponentId?: string; // New: Store opponent player ID
  isDoubles: boolean;
  partnerName?: string;
  partnerId?: string; // New: Store partner player ID
  opponent1Name?: string;
  opponent1Id?: string; // New: Store first opponent player ID
  opponent2Name?: string;
  opponent2Id?: string; // New: Store second opponent player ID
  matchType: 'singles' | 'doubles';
  startTime: Date;
  
  // Progressive scoring system
  sets: {
    playerScore: string;
    opponentScore: string;
    completed: boolean;
  }[];
  currentSet: number; // 0-indexed
  
  // Mid-match check-in data
  midMatchMood?: string;
  midMatchNotes?: string;
  
  // End match data
  finalScore?: string;
  duration?: number;
  endMood?: string;
  matchNotes?: string;
  result?: 'win' | 'loss';
}

interface MatchSessionContextType {
  sessionData: MatchSessionData | null;
  updateSessionData: (data: Partial<MatchSessionData>) => Promise<void>;
  logSetScore: (playerScore: string, opponentScore: string) => Promise<void>;
  startNextSet: () => Promise<void>;
  clearSession: () => void;
  isSessionActive: boolean;
  getCurrentSetDisplay: () => string;
  getOpponentSetDisplay: () => string;
  loading: boolean;
}

const MatchSessionContext = createContext<MatchSessionContextType | undefined>(undefined);

export const useMatchSession = () => {
  const context = useContext(MatchSessionContext);
  if (context === undefined) {
    throw new Error('useMatchSession must be used within a MatchSessionProvider');
  }
  return context;
};

interface MatchSessionProviderProps {
  children: ReactNode;
}

export const MatchSessionProvider: React.FC<MatchSessionProviderProps> = ({ children }) => {
  const { 
    activeSession, 
    loading, 
    createMatchSession, 
    updateMatchSession, 
    completeMatchSession 
  } = useMatchSessions();

  // Convert database session to context format
  const sessionData: MatchSessionData | null = activeSession ? {
    opponentName: activeSession.opponent_name,
    opponentId: activeSession.opponent_id,
    isDoubles: activeSession.is_doubles,
    partnerName: activeSession.partner_name,
    partnerId: activeSession.partner_id,
    opponent1Name: activeSession.opponent_1_name,
    opponent1Id: activeSession.opponent_1_id,
    opponent2Name: activeSession.opponent_2_name,
    opponent2Id: activeSession.opponent_2_id,
    matchType: activeSession.match_type,
    startTime: new Date(activeSession.start_time),
    sets: activeSession.sets,
    currentSet: activeSession.current_set,
    midMatchMood: activeSession.mid_match_mood,
    midMatchNotes: activeSession.mid_match_notes,
    finalScore: activeSession.final_score,
    endMood: activeSession.end_mood,
    matchNotes: activeSession.match_notes,
    result: activeSession.result
  } : null;

  const updateSessionData = async (data: Partial<MatchSessionData>) => {
    if (!activeSession) {
      // Create new session
      if (data.opponentName && data.matchType && data.startTime) {
        await createMatchSession({
          opponentName: data.opponentName,
          opponentId: data.opponentId,
          isDoubles: data.isDoubles || false,
          partnerName: data.partnerName,
          partnerId: data.partnerId,
          opponent1Name: data.opponent1Name,
          opponent1Id: data.opponent1Id,
          opponent2Name: data.opponent2Name,
          opponent2Id: data.opponent2Id,
          matchType: data.matchType,
          startTime: data.startTime
        });
      }
      return;
    }

    // Update existing session
    await updateMatchSession({
      sessionId: activeSession.id,
      sets: data.sets,
      currentSet: data.currentSet,
      midMatchMood: data.midMatchMood,
      midMatchNotes: data.midMatchNotes,
      finalScore: data.finalScore,
      endMood: data.endMood,
      matchNotes: data.matchNotes,
      result: data.result
    });
  };

  const logSetScore = async (playerScore: string, opponentScore: string) => {
    if (!activeSession || !sessionData) return;

    const updatedSets = [...sessionData.sets];
    updatedSets[sessionData.currentSet] = {
      playerScore,
      opponentScore,
      completed: true
    };

    await updateSessionData({ sets: updatedSets });
  };

  const startNextSet = async () => {
    if (!sessionData) return;

    const newSets = [...sessionData.sets, { playerScore: '', opponentScore: '', completed: false }];
    await updateSessionData({
      sets: newSets,
      currentSet: sessionData.currentSet + 1
    });
  };

  const getCurrentSetDisplay = () => {
    if (!sessionData || !sessionData.sets) return '';
    
    return sessionData.sets
      .filter(set => set.completed)
      .map(set => set.playerScore)
      .join(', ');
  };

  const getOpponentSetDisplay = () => {
    if (!sessionData || !sessionData.sets) return '';
    
    return sessionData.sets
      .filter(set => set.completed)
      .map(set => set.opponentScore)
      .join(', ');
  };

  const clearSession = () => {
    // This will be handled by completing the session
    // The session will be marked as completed in the database
    console.log('Session cleared - this should be handled by completing the match');
  };

  const isSessionActive = sessionData !== null;

  return (
    <MatchSessionContext.Provider 
      value={{ 
        sessionData, 
        updateSessionData, 
        logSetScore,
        startNextSet,
        clearSession, 
        isSessionActive,
        getCurrentSetDisplay,
        getOpponentSetDisplay,
        loading
      }}
    >
      {children}
    </MatchSessionContext.Provider>
  );
};
