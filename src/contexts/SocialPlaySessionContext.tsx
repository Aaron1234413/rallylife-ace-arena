
import React, { createContext, useContext, ReactNode, useState } from 'react';
import { toast } from 'sonner';
import { useRealTimeSessions } from '@/hooks/useRealTimeSessions';
import { useAuth } from '@/hooks/useAuth';

interface ActiveSession {
  id: string;
  startTime: Date;
  sessionType: 'singles' | 'doubles';
  location?: string;
  participants?: Array<{
    id: string;
    name: string;
    role: string;
    user_id: string;
  }>;
}

interface SocialPlaySessionContextType {
  activeSession: ActiveSession | null;
  startSession: (sessionData: { 
    id: string; 
    sessionType: 'singles' | 'doubles'; 
    location?: string;
    participants?: Array<{ id: string; name: string; role: string; user_id: string }>;
  }) => void;
  endSession: () => Promise<any>;
  getDurationMinutes: () => number;
  loading: boolean;
  // Enhanced with unified session data
  availableSessions?: any[];
  mySessions?: any[];
  completedSessions?: any[];
}

const SocialPlaySessionContext = createContext<SocialPlaySessionContextType | undefined>(undefined);

export function SocialPlaySessionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { completeSession } = useRealTimeSessions('my-sessions', user?.id);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [loading, setLoading] = useState(false);

  const startSession = (sessionData: { 
    id: string; 
    sessionType: 'singles' | 'doubles'; 
    location?: string;
    participants?: Array<{ id: string; name: string; role: string; user_id: string }>;
  }) => {
    const newSession: ActiveSession = {
      id: sessionData.id,
      startTime: new Date(),
      sessionType: sessionData.sessionType,
      location: sessionData.location,
      participants: sessionData.participants,
    };
    
    setActiveSession(newSession);
    
    const participantNames = sessionData.participants?.map(p => p.name).join(', ') || 'players';
    
    toast.success('Session Started', {
      description: `Your tennis session with ${participantNames} is now active!`,
    });
  };

  const endSession = async () => {
    if (!activeSession) return;
    
    setLoading(true);
    
    try {
      const durationMinutes = getDurationMinutes();
      
      // Complete session using unified system
      await completeSession(activeSession.id, undefined, durationMinutes);
      
      setActiveSession(null);
      
      // Return session data for reward calculation
      return {
        durationMinutes,
        sessionType: activeSession.sessionType,
        participantCount: activeSession.participants?.length || 0,
        location: activeSession.location
      };
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to end session',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getDurationMinutes = (): number => {
    if (!activeSession) return 0;
    const now = new Date();
    const diffMs = now.getTime() - activeSession.startTime.getTime();
    return Math.floor(diffMs / (1000 * 60));
  };

  return (
    <SocialPlaySessionContext.Provider
      value={{
        activeSession,
        startSession,
        endSession,
        getDurationMinutes,
        loading
      }}
    >
      {children}
    </SocialPlaySessionContext.Provider>
  );
}

export function useSocialPlaySession() {
  const context = useContext(SocialPlaySessionContext);
  if (context === undefined) {
    throw new Error('useSocialPlaySession must be used within a SocialPlaySessionProvider');
  }
  return context;
}
