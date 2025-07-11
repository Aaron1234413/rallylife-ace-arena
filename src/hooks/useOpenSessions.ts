import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { useUnifiedSessions } from './useUnifiedSessions';

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

export function useOpenSessions(clubId?: string) {
  const { user } = useAuth();
  
  // Use unified sessions hook with club filtering
  const {
    sessions: unifiedSessions,
    loading,
    joining,
    joinSession: unifiedJoinSession,
    leaveSession: unifiedLeaveSession,
    getSessionParticipants: unifiedGetParticipants,
    refreshSessions
  } = useUnifiedSessions({
    clubId,
    includeNonClubSessions: false // Only club sessions for this hook
  });

  const {
    sessions: userSessions,
    loading: userSessionsLoading
  } = useUnifiedSessions({
    clubId,
    includeNonClubSessions: false,
    filterUserSessions: true // Only user's sessions
  });

  const [creating, setCreating] = useState(false);

  // Convert unified sessions to OpenSession format for backward compatibility
  const sessions: OpenSession[] = unifiedSessions.map(session => ({
    id: session.id,
    club_id: session.club_id || '',
    creator_id: session.creator_id,
    creator_type: session.session_source === 'coach' ? 'coach' : 'member',
    session_type: session.session_type as any,
    title: `${session.session_type.replace('_', ' ')} Session`,
    description: session.notes,
    scheduled_date: new Date().toISOString().split('T')[0], // Default to today
    start_time: '09:00',
    end_time: '11:00',
    duration_minutes: 120,
    max_participants: session.max_players,
    current_participants: session.participant_count || 0,
    cost_per_person_tokens: session.stakes_amount,
    cost_per_person_money: 0,
    payment_method: 'tokens',
    requires_approval: false,
    is_public: !session.is_private,
    equipment_provided: [],
    status: 'open',
    created_at: session.created_at,
    updated_at: session.updated_at,
    creator: session.creator,
    participants: []
  } as OpenSession));

  // Legacy compatibility - now delegated to unified hook
  const fetchSessions = refreshSessions;

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
      await fetchSessions();
      return true;
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to create session');
      return false;
    } finally {
      setCreating(false);
    }
  };

  // Join a session - delegate to unified hook
  const joinSession = async (sessionId: string, role: string = 'participant') => {
    return await unifiedJoinSession(sessionId);
  };

  // Leave a session - delegate to unified hook
  const leaveSession = async (sessionId: string) => {
    return await unifiedLeaveSession(sessionId);
  };

  // Cancel a session (for creators) with proper refunds
  const cancelSession = async (sessionId: string, reason?: string) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .rpc('cancel_open_session_with_refunds', {
          session_id_param: sessionId,
          canceller_id_param: user.id,
          cancellation_reason_param: reason || 'Cancelled by creator'
        });

      const result = data as any;
      if (!error && result?.success) {
        toast.success(
          `Session cancelled successfully! ${result.creator_tokens_refund > 0 
            ? `${result.creator_tokens_refund} tokens refunded (${result.refund_percentage}% refund rate)`
            : 'No refund applicable'
          }`
        );
        await fetchSessions();
        return true;
      }

      const errorMsg = result?.error || 'Failed to cancel session';
      throw new Error(errorMsg);
    } catch (error) {
      console.error('Error cancelling session:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to cancel session');
      return false;
    }
  };

  // Get session participants - delegate to unified hook but convert types
  const getSessionParticipants = async (sessionId: string): Promise<SessionParticipant[]> => {
    const unifiedParticipants = await unifiedGetParticipants(sessionId);
    return unifiedParticipants.map(p => ({
      id: p.id,
      session_id: p.session_id,
      user_id: p.user_id,
      joined_at: p.joined_at,
      payment_status: p.payment_status as 'pending' | 'paid' | 'refunded' | 'waived',
      attendance_status: p.attendance_status as 'registered' | 'attended' | 'no_show' | 'cancelled',
      role: p.role as 'participant' | 'assistant_coach' | 'observer',
      notes: p.notes,
      tokens_paid: p.tokens_paid,
      money_paid: p.money_paid,
      user: p.user
    } as SessionParticipant));
  };

  // Check if user has joined a session
  const hasUserJoinedSession = async (sessionId: string): Promise<boolean> => {
    const unifiedSession = unifiedSessions.find(s => s.id === sessionId);
    return unifiedSession?.user_has_joined || false;
  };

  return {
    sessions,
    userSessions: userSessions.map(session => ({
      id: session.id,
      club_id: session.club_id || '',
      creator_id: session.creator_id,
      creator_type: session.session_source === 'coach' ? 'coach' : 'member',
      session_type: session.session_type as any,
      title: `${session.session_type.replace('_', ' ')} Session`,
      description: session.notes,
      scheduled_date: new Date().toISOString().split('T')[0],
      start_time: '09:00',
      end_time: '11:00',
      duration_minutes: 120,
      max_participants: session.max_players,
      current_participants: session.participant_count || 0,
      cost_per_person_tokens: session.stakes_amount,
      cost_per_person_money: 0,
      payment_method: 'tokens',
      requires_approval: false,
      is_public: !session.is_private,
      equipment_provided: [],
      status: 'open',
      created_at: session.created_at,
      updated_at: session.updated_at,
      creator: session.creator,
      participants: []
    } as OpenSession)),
    loading: loading || userSessionsLoading,
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