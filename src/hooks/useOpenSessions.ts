import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface OpenSession {
  id: string;
  club_id: string;
  creator_id: string;
  creator_type: 'member' | 'coach';
  session_type: 'practice' | 'lesson' | 'tournament' | 'casual' | 'clinic';
  title: string;
  description?: string;
  court_id?: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  skill_level_min?: number;
  skill_level_max?: number;
  max_participants: number;
  current_participants: number;
  cost_per_person_tokens: number;
  cost_per_person_money: number;
  payment_method: 'tokens' | 'money' | 'hybrid';
  requires_approval: boolean;
  is_public: boolean;
  session_notes?: string;
  equipment_provided: string[];
  status: 'open' | 'full' | 'in_progress' | 'completed' | 'cancelled';
  cancelled_reason?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
  
  // Related data
  creator?: {
    full_name: string;
    avatar_url?: string;
  };
  court?: {
    name: string;
    surface_type: string;
  };
  participants?: SessionParticipant[];
}

export interface SessionParticipant {
  id: string;
  session_id: string;
  user_id: string;
  joined_at: string;
  payment_status: 'pending' | 'paid' | 'refunded' | 'waived';
  attendance_status: 'registered' | 'attended' | 'no_show' | 'cancelled';
  role: 'participant' | 'assistant_coach' | 'observer';
  notes?: string;
  tokens_paid: number;
  money_paid: number;
  
  // Related data
  user?: {
    full_name: string;
    avatar_url?: string;
  };
}

export function useOpenSessions(clubId: string) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<OpenSession[]>([]);
  const [userSessions, setUserSessions] = useState<OpenSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Fetch open sessions for the club
  const fetchSessions = async () => {
    if (!user || !clubId) return;

    try {
      const { data, error } = await supabase
        .from('open_sessions')
        .select(`
          *,
          creator:creator_id (
            full_name,
            avatar_url
          ),
          court:court_id (
            name,
            surface_type
          )
        `)
        .eq('club_id', clubId)
        .in('status', ['open', 'full', 'in_progress'])
        .gte('scheduled_date', new Date().toISOString().split('T')[0])
        .order('scheduled_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      setSessions((data as any) || []);
    } catch (error) {
      console.error('Error fetching open sessions:', error);
      toast.error('Failed to load sessions');
    }
  };

  // Fetch user's own sessions
  const fetchUserSessions = async () => {
    if (!user || !clubId) return;

    try {
      const { data, error } = await supabase
        .from('open_sessions')
        .select(`
          *,
          creator:creator_id (
            full_name,
            avatar_url
          ),
          court:court_id (
            name,
            surface_type
          )
        `)
        .eq('club_id', clubId)
        .eq('creator_id', user.id)
        .order('scheduled_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      setUserSessions((data as any) || []);
    } catch (error) {
      console.error('Error fetching user sessions:', error);
    }
  };

  // Create a new open session
  const createSession = async (sessionData: Partial<OpenSession>) => {
    if (!user || !clubId) return false;

    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('open_sessions')
        .insert({
          club_id: clubId,
          creator_id: user.id,
          creator_type: sessionData.creator_type || 'member',
          session_type: sessionData.session_type,
          title: sessionData.title,
          description: sessionData.description,
          court_id: sessionData.court_id,
          scheduled_date: sessionData.scheduled_date,
          start_time: sessionData.start_time,
          end_time: sessionData.end_time,
          duration_minutes: sessionData.duration_minutes,
          skill_level_min: sessionData.skill_level_min,
          skill_level_max: sessionData.skill_level_max,
          max_participants: sessionData.max_participants || 4,
          cost_per_person_tokens: sessionData.cost_per_person_tokens || 0,
          cost_per_person_money: sessionData.cost_per_person_money || 0,
          payment_method: sessionData.payment_method || 'tokens',
          requires_approval: sessionData.requires_approval || false,
          is_public: sessionData.is_public !== false,
          session_notes: sessionData.session_notes,
          equipment_provided: sessionData.equipment_provided || []
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Session created successfully!');
      await Promise.all([fetchSessions(), fetchUserSessions()]);
      return true;
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to create session');
      return false;
    } finally {
      setCreating(false);
    }
  };

  // Join a session
  const joinSession = async (sessionId: string, role: string = 'participant') => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .rpc('join_open_session', {
          session_id_param: sessionId,
          role_param: role
        });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; tokens_paid?: number };
      
      if (result.success) {
        toast.success(`Successfully joined session! ${result.tokens_paid ? `${result.tokens_paid} tokens charged.` : ''}`);
        await fetchSessions();
        return true;
      } else {
        toast.error(result.error || 'Failed to join session');
        return false;
      }
    } catch (error) {
      console.error('Error joining session:', error);
      toast.error('Failed to join session');
      return false;
    }
  };

  // Leave a session
  const leaveSession = async (sessionId: string) => {
    if (!user) return false;

    try {
      // For now, directly delete from session_participants until the function is available
      const { error } = await supabase
        .from('session_participants')
        .delete()
        .eq('session_id', sessionId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Left session successfully!');
      await fetchSessions();
      return true;
    } catch (error) {
      console.error('Error leaving session:', error);
      toast.error('Failed to leave session');
      return false;
    }
  };

  // Cancel a session (for creators)
  const cancelSession = async (sessionId: string, reason?: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('open_sessions')
        .update({
          status: 'cancelled',
          cancelled_reason: reason,
          cancelled_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('creator_id', user.id);

      if (error) throw error;

      toast.success('Session cancelled successfully');
      await Promise.all([fetchSessions(), fetchUserSessions()]);
      return true;
    } catch (error) {
      console.error('Error cancelling session:', error);
      toast.error('Failed to cancel session');
      return false;
    }
  };

  // Get session participants
  const getSessionParticipants = async (sessionId: string): Promise<SessionParticipant[]> => {
    try {
      const { data, error } = await supabase
        .from('session_participants')
        .select(`
          *,
          user:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('session_id', sessionId)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      return (data as any) || [];
    } catch (error) {
      console.error('Error fetching session participants:', error);
      return [];
    }
  };

  // Check if user has joined a session
  const hasUserJoinedSession = async (sessionId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('session_participants')
        .select('id')
        .eq('session_id', sessionId)
        .eq('user_id', user.id)
        .single();

      return !error && !!data;
    } catch (error) {
      return false;
    }
  };

  // Load initial data
  useEffect(() => {
    if (!user || !clubId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchSessions(), fetchUserSessions()]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, clubId]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user || !clubId) return;

    const channel = supabase
      .channel(`open_sessions_${clubId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'open_sessions',
          filter: `club_id=eq.${clubId}`
        },
        () => {
          fetchSessions();
          fetchUserSessions();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_participants'
        },
        () => {
          fetchSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, clubId]);

  return {
    sessions,
    userSessions,
    loading,
    creating,
    createSession,
    joinSession,
    leaveSession,
    cancelSession,
    getSessionParticipants,
    hasUserJoinedSession,
    refreshSessions: fetchSessions
  };
}