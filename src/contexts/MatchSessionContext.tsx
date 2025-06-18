
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
    setSessionData(prev => prev ? { ...prev, ...data } : data as MatchSessionData);
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
        clearSession, 
        isSessionActive 
      }}
    >
      {children}
    </MatchSessionContext.Provider>
  );
};
