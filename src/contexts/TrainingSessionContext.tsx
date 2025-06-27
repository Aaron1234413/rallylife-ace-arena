
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TrainingSessionData {
  sessionType?: string;
  coachName?: string;
  skillsFocus?: string[];
  intensity?: string;
  estimatedDuration?: number;
  startTime?: string;
  pausedAt?: string;
  midSessionCheckIn?: {
    mood?: string;
    notes?: string;
    timestamp?: string;
  };
  actualDuration?: number;
  sessionNotes?: string;
  mood?: string;
}

interface TrainingSessionContextType {
  sessionData: TrainingSessionData;
  updateSessionData: (data: Partial<TrainingSessionData>) => void;
  clearSession: () => void;
  isSessionActive: boolean;
}

const TrainingSessionContext = createContext<TrainingSessionContextType | undefined>(undefined);

const STORAGE_KEY = 'training_session_data';

export function TrainingSessionProvider({ children }: { children: ReactNode }) {
  const [sessionData, setSessionData] = useState<TrainingSessionData>({});

  // Load session data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSessionData(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse saved session data:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const updateSessionData = (data: Partial<TrainingSessionData>) => {
    const updated = { ...sessionData, ...data };
    setSessionData(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const clearSession = () => {
    setSessionData({});
    localStorage.removeItem(STORAGE_KEY);
  };

  const isSessionActive = Object.keys(sessionData).length > 0;

  return (
    <TrainingSessionContext.Provider value={{
      sessionData,
      updateSessionData,
      clearSession,
      isSessionActive
    }}>
      {children}
    </TrainingSessionContext.Provider>
  );
}

export function useTrainingSession() {
  const context = useContext(TrainingSessionContext);
  if (context === undefined) {
    throw new Error('useTrainingSession must be used within a TrainingSessionProvider');
  }
  return context;
}
