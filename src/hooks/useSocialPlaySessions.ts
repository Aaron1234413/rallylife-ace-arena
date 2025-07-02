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
  // Temporarily disabled - needs migration to unified sessions system
  return {
    sessions: [] as SocialPlaySession[],
    activeSession: null as SocialPlaySession | null,
    isLoading: false,
    createSession: () => {},
    updateSessionStatus: () => {},
    cleanupExpiredSessions: () => {},
    isCreatingSession: false,
    isUpdatingSession: false,
    isCleaningUp: false,
  };
}