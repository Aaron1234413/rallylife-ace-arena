import { useSessionManager, SessionData } from './useSessionManager';

interface SocialPlaySession {
  id: string;
  created_by: string;
  session_type: 'singles' | 'doubles';
  competitive_level: 'low' | 'medium' | 'high';
  status: 'pending' | 'active' | 'paused' | 'completed' | 'cancelled';
  start_time: string | null;
  end_time: string | null;
  paused_duration: number;
  location: string | null;
  notes: string | null;
  mood: string | null;
  final_score: string | null;
  created_at: string;
  updated_at: string;
}

export function useSocialPlaySessions() {
  // Use unified session manager for social play sessions
  const {
    sessions,
    loading: isLoading,
    joinSession,
    leaveSession,
    startSession,
    cancelSession
  } = useSessionManager({
    sessionType: 'social_play',
    includeNonClubSessions: true
  });

  // Convert unified sessions to social play format for backward compatibility
  const socialPlaySessions: SocialPlaySession[] = sessions.map(session => ({
    id: session.id,
    created_by: session.creator_id,
    session_type: (session.format || 'singles') as 'singles' | 'doubles',
    competitive_level: 'medium' as const,
    status: 'pending' as const, // Could be enhanced with real status from session
    start_time: null,
    end_time: null,
    paused_duration: 0,
    location: session.location,
    notes: session.notes,
    mood: null,
    final_score: null,
    created_at: session.created_at,
    updated_at: session.updated_at
  }));

  const activeSession = socialPlaySessions.find(s => s.status === 'active') || null;

  return {
    sessions: socialPlaySessions,
    activeSession,
    isLoading,
    createSession: () => {}, // Session creation handled by CreateSocialPlayDialog
    updateSessionStatus: startSession,
    cleanupExpiredSessions: () => {},
    isCreatingSession: false,
    isUpdatingSession: false,
    isCleaningUp: false,
  };
}