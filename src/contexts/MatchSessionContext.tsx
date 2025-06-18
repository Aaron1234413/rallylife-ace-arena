
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MatchSessionData {
  // Start match data
  opponentName: string;
  isDoubles: boolean;
  partnerName?: string;
  opponent1Name?: string;
  opponent2Name?: string;
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
  updateSessionData: (data: Partial<MatchSessionData>) => void;
  logSetScore: (playerScore: string, opponentScore: string) => void;
  startNextSet: () => void;
  clearSession: () => void;
  isSessionActive: boolean;
  getCurrentSetDisplay: () => string;
  getOpponentSetDisplay: () => string;
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
  const [sessionData, setSessionData] = useState<MatchSessionData | null>(null);

  const updateSessionData = (data: Partial<MatchSessionData>) => {
    setSessionData(prev => {
      if (!prev) {
        // Initialize with first set ready for input
        const newData = data as MatchSessionData;
        if (!newData.sets) {
          newData.sets = [{ playerScore: '', opponentScore: '', completed: false }];
          newData.currentSet = 0;
        }
        return newData;
      }
      return { ...prev, ...data };
    });
  };

  const logSetScore = (playerScore: string, opponentScore: string) => {
    setSessionData(prev => {
      if (!prev) return prev;
      
      const updatedSets = [...prev.sets];
      updatedSets[prev.currentSet] = {
        playerScore,
        opponentScore,
        completed: true
      };
      
      return {
        ...prev,
        sets: updatedSets
      };
    });
  };

  const startNextSet = () => {
    setSessionData(prev => {
      if (!prev) return prev;
      
      const newSets = [...prev.sets, { playerScore: '', opponentScore: '', completed: false }];
      
      return {
        ...prev,
        sets: newSets,
        currentSet: prev.currentSet + 1
      };
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
    setSessionData(null);
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
        getOpponentSetDisplay
      }}
    >
      {children}
    </MatchSessionContext.Provider>
  );
};
