
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRealTimeSessions } from '@/hooks/useRealTimeSessions';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TrainingSessionData {
  sessionId?: string;  // NEW: Track unified session ID
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
  createTrainingSession: (sessionData: Partial<TrainingSessionData>) => Promise<string>;
  startTrainingSession: (sessionId: string) => Promise<void>;
  completeTrainingSession: (sessionId: string, duration: number) => Promise<void>;
}

const TrainingSessionContext = createContext<TrainingSessionContextType | undefined>(undefined);

const STORAGE_KEY = 'training_session_data';

export function TrainingSessionProvider({ children }: { children: ReactNode }) {
  const [sessionData, setSessionData] = useState<TrainingSessionData>({});
  const { user } = useAuth();
  const { completeSession } = useRealTimeSessions('my-sessions', user?.id);

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

  // Create training session in unified sessions table
  const createTrainingSession = async (trainingData: Partial<TrainingSessionData>): Promise<string> => {
    if (!user?.id) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('sessions')
      .insert({
        creator_id: user.id,
        session_type: 'training',
        format: 'singles', // Training is typically solo
        max_players: 1,
        stakes_amount: 0, // Training sessions have no stakes
        location: null,
        notes: trainingData.sessionNotes || `${trainingData.intensity} intensity training`,
        status: 'waiting',
        is_private: true // Training sessions are private
      })
      .select('id')
      .single();

    if (error) throw error;

    // Add creator as participant
    const { error: participantError } = await supabase
      .from('session_participants')
      .insert({
        session_id: data.id,
        user_id: user.id,
        status: 'joined'
      });

    if (participantError) throw participantError;

    return data.id;
  };

  // Start training session (update status to active)
  const startTrainingSession = async (sessionId: string): Promise<void> => {
    const { error } = await supabase
      .from('sessions')
      .update({ status: 'active' })
      .eq('id', sessionId);

    if (error) throw error;
  };

  // Complete training session using unified completion
  const completeTrainingSession = async (sessionId: string, duration: number): Promise<void> => {
    await completeSession(sessionId, undefined, duration);
  };

  return (
    <TrainingSessionContext.Provider value={{
      sessionData,
      updateSessionData,
      clearSession,
      isSessionActive,
      createTrainingSession,
      startTrainingSession,
      completeTrainingSession
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
