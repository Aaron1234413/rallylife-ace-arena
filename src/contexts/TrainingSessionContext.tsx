import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TrainingSessionData {
  id: string;
  player_id: string;
  start_time: Date;
  end_time?: Date;
  duration_minutes?: number;
  location?: string;
  training_type?: string;
  focus_areas?: string[];
  drills_performed?: string[];
  notes?: string;
  mood_before?: string;
  mood_after?: string;
  energy_level_before?: number;
  energy_level_after?: number;
  performance_rating?: number;
  session_summary?: string;
  created_at: string;
  updated_at: string;
}

interface SessionCompletionData {
  endTime: Date;
  durationMinutes: number;
  moodAfter: string;
  energyLevelAfter: number;
  performanceRating: number;
  sessionSummary: string;
}

interface TrainingSessionContextType {
  sessionData: TrainingSessionData | null;
  isSessionActive: boolean;
  loading: boolean;
  updateSessionData: (data: Partial<TrainingSessionData>) => Promise<void>;
  completeSession: (completionData: SessionCompletionData) => Promise<void>;
  refreshSession: () => Promise<void>;
}

const TrainingSessionContext = createContext<TrainingSessionContextType | undefined>(undefined);

export const TrainingSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [sessionData, setSessionData] = useState<TrainingSessionData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchActiveSession = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('active_training_sessions')
        .select('*')
        .eq('player_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching active training session:', error);
        return;
      }

      if (data) {
        // Convert the start_time to a Date object
        const sessionDataWithDate = {
          ...data,
          start_time: new Date(data.start_time),
        };
        setSessionData(sessionDataWithDate);
      } else {
        setSessionData(null);
      }
    } catch (error) {
      console.error('Error in fetchActiveSession:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSessionData = async (data: Partial<TrainingSessionData>) => {
    if (!user || !sessionData) return;

    try {
      setLoading(true);
      const { data: updatedData, error } = await supabase
        .from('active_training_sessions')
        .update(data)
        .eq('id', sessionData.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating training session:', error);
        toast.error('Failed to update training session');
        return;
      }

      // Convert the start_time to a Date object
      const sessionDataWithDate = {
        ...updatedData,
        start_time: new Date(updatedData.start_time),
      };
      setSessionData(sessionDataWithDate);
      toast.success('Training session updated successfully!');
    } catch (error) {
      console.error('Error in updateSessionData:', error);
      toast.error('An error occurred while updating the training session');
    } finally {
      setLoading(false);
    }
  };

  const completeSession = async (completionData: SessionCompletionData) => {
    if (!user || !sessionData) return;

    try {
      setLoading(true);

      // Update the session with completion data
      const { error } = await supabase
        .from('active_training_sessions')
        .update({
          end_time: completionData.endTime.toISOString(),
          duration_minutes: completionData.durationMinutes,
          mood_after: completionData.moodAfter,
          energy_level_after: completionData.energyLevelAfter,
          performance_rating: completionData.performanceRating,
          session_summary: completionData.sessionSummary,
        })
        .eq('id', sessionData.id);

      if (error) {
        console.error('Error completing training session:', error);
        toast.error('Failed to complete training session');
        return;
      }

      // Optionally, move the session to a history table
      // and remove it from the active sessions table

      setSessionData(null);
      toast.success('Training session completed successfully!');
    } catch (error) {
      console.error('Error in completeSession:', error);
      toast.error('An error occurred while completing the training session');
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async () => {
    await fetchActiveSession();
  };

  useEffect(() => {
    if (user) {
      fetchActiveSession();
    }
  }, [user]);

  const value = {
    sessionData,
    isSessionActive: !!sessionData,
    loading,
    updateSessionData,
    completeSession,
    refreshSession
  };

  return (
    <TrainingSessionContext.Provider value={value}>
      {children}
    </TrainingSessionContext.Provider>
  );
};

export const useTrainingSession = () => {
  const context = useContext(TrainingSessionContext);
  if (context === undefined) {
    throw new Error('useTrainingSession must be used within a TrainingSessionProvider');
  }
  return context;
};
