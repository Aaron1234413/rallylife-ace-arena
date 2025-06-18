
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TrainingSession {
  id: string;
  sessionType: 'Solo Practice' | 'With Coach' | 'Group Training' | '';
  coachName?: string;
  coachId?: string;
  skillsFocused: string[];
  intensityLevel: 'Low' | 'Medium' | 'High' | 'Extreme' | '';
  estimatedDuration: number; // in minutes
  startTime: string;
  midSessionCheckIn?: {
    mood: string;
    note: string;
    timestamp: string;
  };
  actualDuration?: number;
  sessionNotes?: string;
  finalMood?: string;
  isCompleted: boolean;
}

interface TrainingSessionContextType {
  currentSession: TrainingSession | null;
  startNewSession: () => string;
  updateSession: (updates: Partial<TrainingSession>) => void;
  addMidSessionCheckIn: (mood: string, note: string) => void;
  completeSession: (actualDuration: number, notes: string, mood: string) => void;
  clearSession: () => void;
  hasActiveSession: boolean;
}

const TrainingSessionContext = createContext<TrainingSessionContextType | undefined>(undefined);

const STORAGE_KEY = 'rallylife_training_session';

export function TrainingSessionProvider({ children }: { children: ReactNode }) {
  const [currentSession, setCurrentSession] = useState<TrainingSession | null>(null);

  // Load session from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem(STORAGE_KEY);
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        setCurrentSession(session);
      } catch (error) {
        console.error('Error loading training session from localStorage:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save session to localStorage whenever it changes
  useEffect(() => {
    if (currentSession) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentSession));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [currentSession]);

  const startNewSession = (): string => {
    const sessionId = `training_${Date.now()}`;
    const newSession: TrainingSession = {
      id: sessionId,
      sessionType: '',
      skillsFocused: [],
      intensityLevel: '',
      estimatedDuration: 30,
      startTime: new Date().toISOString(),
      isCompleted: false,
    };
    setCurrentSession(newSession);
    return sessionId;
  };

  const updateSession = (updates: Partial<TrainingSession>) => {
    if (currentSession) {
      setCurrentSession(prev => ({ ...prev!, ...updates }));
    }
  };

  const addMidSessionCheckIn = (mood: string, note: string) => {
    if (currentSession) {
      setCurrentSession(prev => ({
        ...prev!,
        midSessionCheckIn: {
          mood,
          note,
          timestamp: new Date().toISOString(),
        },
      }));
    }
  };

  const completeSession = (actualDuration: number, notes: string, mood: string) => {
    if (currentSession) {
      setCurrentSession(prev => ({
        ...prev!,
        actualDuration,
        sessionNotes: notes,
        finalMood: mood,
        isCompleted: true,
      }));
    }
  };

  const clearSession = () => {
    setCurrentSession(null);
  };

  const hasActiveSession = currentSession !== null && !currentSession.isCompleted;

  return (
    <TrainingSessionContext.Provider
      value={{
        currentSession,
        startNewSession,
        updateSession,
        addMidSessionCheckIn,
        completeSession,
        clearSession,
        hasActiveSession,
      }}
    >
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
