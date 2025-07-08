import { useUnifiedSessions } from './useUnifiedSessions';

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
  // Use unified sessions hook for social play sessions
  const {
    sessions: unifiedSessions,
    loading: isLoading,
    joinSession,
    leaveSession,
    startSession,
    cancelSession
  } = useUnifiedSessions({
    includeNonClubSessions: true
  });

  // Filter and convert to social play format
  const socialPlaySessions = unifiedSessions
    .filter(session => session.session_type === 'social_play')
    .map(session => ({
      id: session.id,
      created_by: session.creator_id,
      session_type: session.format as 'singles' | 'doubles',
      competitive_level: 'medium' as const,
      status: 'pending' as const,
      start_time: null,
      end_time: null,
      paused_duration: 0,
      location: session.location,
      notes: session.notes,
      mood: null,
      final_score: null,
      created_at: session.created_at,
      updated_at: session.updated_at
    } as SocialPlaySession));

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