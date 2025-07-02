interface SocialPlayEvent {
  id: string;
  created_by: string;
  title: string;
  session_type: 'singles' | 'doubles';
  location: string;
  scheduled_time: string;
  description: string | null;
  max_participants: number;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  creator?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  participants?: Array<{
    id: string;
    user_id: string;
    status: 'joined' | 'declined';
    user?: {
      id: string;
      full_name: string;
      avatar_url: string | null;
    };
  }>;
}

export function useSocialPlayEvents() {
  // Temporarily disabled - needs migration to unified sessions system
  return {
    events: [] as SocialPlayEvent[],
    isLoading: false,
    createEvent: async () => {},
    joinEvent: async () => {},
    isCreatingEvent: false,
    isJoiningEvent: false,
  };
}