
import React, { createContext, useContext, ReactNode, useState } from 'react';
import { toast } from 'sonner';
import { useSocialPlaySessions } from '@/hooks/useSocialPlaySessions';

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
  endSession: () => void;
  getDurationMinutes: () => number;
  loading: boolean;
}

const SocialPlaySessionContext = createContext<SocialPlaySessionContextType | undefined>(undefined);

export function SocialPlaySessionProvider({ children }: { children: ReactNode }) {
  const { updateSessionStatus } = useSocialPlaySessions();
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
    
    // Update session status to active
    updateSessionStatus({
      sessionId: sessionData.id,
      status: 'active',
      updates: { start_time: new Date().toISOString() }
    });
    
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
      
      // Update session status to completed
      updateSessionStatus({
        sessionId: activeSession.id,
        status: 'completed',
        updates: { 
          end_time: new Date().toISOString(),
          paused_duration: 0
        }
      });
      
      setActiveSession(null);
      
      // Enhanced completion message with participant count
      const participantCount = activeSession.participants?.length || 0;
      const sessionTypeText = activeSession.sessionType === 'doubles' ? 'doubles' : 'singles';
      
      toast.success('Session Completed', {
        description: `Great ${sessionTypeText} session with ${participantCount} players! You played for ${durationMinutes} minutes.`,
      });
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to end session',
      });
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
