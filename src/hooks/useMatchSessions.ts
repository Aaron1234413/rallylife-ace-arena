
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MatchSession {
  id: string;
  player_id: string;
  opponent_name: string;
  is_doubles: boolean;
  partner_name?: string;
  opponent_1_name?: string;
  opponent_2_name?: string;
  match_type: 'singles' | 'doubles';
  status: 'active' | 'paused' | 'completed' | 'abandoned';
  current_set: number;
  sets: {
    playerScore: string;
    opponentScore: string;
    completed: boolean;
  }[];
  start_time: string;
  pause_start_time?: string;
  total_paused_duration: number;
  completed_at?: string;
  mid_match_mood?: string;
  mid_match_notes?: string;
  final_score?: string;
  end_mood?: string;
  match_notes?: string;
  result?: 'win' | 'loss';
  created_at: string;
  updated_at: string;
}

interface CreateMatchSessionParams {
  opponentName: string;
  isDoubles: boolean;
  partnerName?: string;
  opponent1Name?: string;
  opponent2Name?: string;
  matchType: 'singles' | 'doubles';
  startTime: Date;
}

interface UpdateMatchSessionParams {
  sessionId: string;
  sets?: any[];
  currentSet?: number;
  status?: 'active' | 'paused' | 'completed' | 'abandoned';
  midMatchMood?: string;
  midMatchNotes?: string;
  finalScore?: string;
  endMood?: string;
  matchNotes?: string;
  result?: 'win' | 'loss';
}

export function useMatchSessions() {
  const { user } = useAuth();
  const [activeSession, setActiveSession] = useState<MatchSession | null>(null);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  const fetchActiveSession = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('active_match_sessions')
        .select('*')
        .eq('player_id', user.id)
        .in('status', ['active', 'paused'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching active session:', error);
        return;
      }

      setActiveSession(data);
    } catch (error) {
      console.error('Error in fetchActiveSession:', error);
    }
  };

  const createMatchSession = async (params: CreateMatchSessionParams): Promise<MatchSession | null> => {
    if (!user) return null;

    try {
      const sessionData = {
        player_id: user.id,
        opponent_name: params.opponentName,
        is_doubles: params.isDoubles,
        partner_name: params.partnerName,
        opponent_1_name: params.opponent1Name,
        opponent_2_name: params.opponent2Name,
        match_type: params.matchType,
        start_time: params.startTime.toISOString(),
        sets: JSON.stringify([{ playerScore: '', opponentScore: '', completed: false }]),
        current_set: 0,
        status: 'active'
      };

      const { data, error } = await supabase
        .from('active_match_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) {
        console.error('Error creating match session:', error);
        toast.error('Failed to create match session');
        return null;
      }

      // Parse the sets JSON back to object
      const session = {
        ...data,
        sets: JSON.parse(data.sets as string)
      } as MatchSession;

      setActiveSession(session);
      toast.success('Match session created successfully!');
      return session;
    } catch (error) {
      console.error('Error in createMatchSession:', error);
      toast.error('An error occurred while creating match session');
      return null;
    }
  };

  const updateMatchSession = async (params: UpdateMatchSessionParams): Promise<boolean> => {
    if (!user || !activeSession) return false;

    try {
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (params.sets !== undefined) {
        updateData.sets = JSON.stringify(params.sets);
      }
      if (params.currentSet !== undefined) {
        updateData.current_set = params.currentSet;
      }
      if (params.status !== undefined) {
        updateData.status = params.status;
        if (params.status === 'completed') {
          updateData.completed_at = new Date().toISOString();
        }
      }
      if (params.midMatchMood !== undefined) {
        updateData.mid_match_mood = params.midMatchMood;
      }
      if (params.midMatchNotes !== undefined) {
        updateData.mid_match_notes = params.midMatchNotes;
      }
      if (params.finalScore !== undefined) {
        updateData.final_score = params.finalScore;
      }
      if (params.endMood !== undefined) {
        updateData.end_mood = params.endMood;
      }
      if (params.matchNotes !== undefined) {
        updateData.match_notes = params.matchNotes;
      }
      if (params.result !== undefined) {
        updateData.result = params.result;
      }

      const { data, error } = await supabase
        .from('active_match_sessions')
        .update(updateData)
        .eq('id', params.sessionId)
        .select()
        .single();

      if (error) {
        console.error('Error updating match session:', error);
        toast.error('Failed to update match session');
        return false;
      }

      // Parse the sets JSON back to object
      const updatedSession = {
        ...data,
        sets: JSON.parse(data.sets as string)
      } as MatchSession;

      setActiveSession(updatedSession);
      return true;
    } catch (error) {
      console.error('Error in updateMatchSession:', error);
      toast.error('An error occurred while updating match session');
      return false;
    }
  };

  const completeMatchSession = async (sessionId: string, finalData: {
    finalScore: string;
    endMood?: string;
    matchNotes?: string;
    result: 'win' | 'loss';
  }): Promise<boolean> => {
    const success = await updateMatchSession({
      sessionId,
      status: 'completed',
      ...finalData
    });

    if (success) {
      setActiveSession(null);
      toast.success('Match completed successfully!');
    }

    return success;
  };

  const cleanupChannel = () => {
    if (channelRef.current && isSubscribedRef.current) {
      console.log('Cleaning up match session channel subscription');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      isSubscribedRef.current = false;
    }
  };

  useEffect(() => {
    if (user) {
      const loadData = async () => {
        setLoading(true);
        await fetchActiveSession();
        setLoading(false);
      };

      loadData();

      // Clean up any existing channel first
      cleanupChannel();

      // Set up real-time subscription for match session updates
      if (!isSubscribedRef.current) {
        const channelName = `match-session-${user.id}-${Date.now()}`;
        const channel = supabase.channel(channelName);
        
        channel
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'active_match_sessions',
              filter: `player_id=eq.${user.id}`
            },
            (payload) => {
              console.log('Match session real-time update received:', payload);
              fetchActiveSession();
            }
          )
          .subscribe((status) => {
            console.log('Match Session Channel subscription status:', status);
            if (status === 'SUBSCRIBED') {
              isSubscribedRef.current = true;
            } else if (status === 'CLOSED') {
              isSubscribedRef.current = false;
            }
          });

        channelRef.current = channel;
      }

      return () => {
        cleanupChannel();
      };
    } else {
      // Clean up when no user
      cleanupChannel();
      setActiveSession(null);
      setLoading(false);
    }
  }, [user]);

  return {
    activeSession,
    loading,
    createMatchSession,
    updateMatchSession,
    completeMatchSession,
    refreshActiveSession: fetchActiveSession
  };
}
