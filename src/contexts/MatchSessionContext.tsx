
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
  
  // Simple score tracking
  playerScore?: string; // e.g., "6-4, 2-1"
  opponentScore?: string; // e.g., "4-6, 1-2"
  
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
  updateScore: (playerScore: string, opponentScore: string) => void;
  clearSession: () => void;
  isSessionActive: boolean;
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
        // Initialize with default scores if starting a new session
        const newData = data as MatchSessionData;
        if (!newData.playerScore) {
          newData.playerScore = '0';
          newData.opponentScore = '0';
        }
        return newData;
      }
      return { ...prev, ...data };
    });
  };

  const updateScore = (playerScore: string, opponentScore: string) => {
    setSessionData(prev => {
      if (!prev) return prev;
      return { 
        ...prev, 
        playerScore,
        opponentScore
      };
    });
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
        updateScore,
        clearSession, 
        isSessionActive 
      }}
    >
      {children}
    </MatchSessionContext.Provider>
  );
};
