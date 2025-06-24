import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ActiveMatchSession {
  id: string;
  player_id: string;
  opponent_name: string;
  opponent_id?: string;
  is_doubles: boolean;
  partner_name?: string;
  partner_id?: string;
  opponent_1_name?: string;
  opponent_1_id?: string;
  opponent_2_name?: string;
  opponent_2_id?: string;
  match_type: 'singles' | 'doubles';
  start_time: string;
  status: 'active' | 'paused' | 'completed';
  sets: {
    playerScore: string;
    opponentScore: string;
    completed: boolean;
  }[];
  current_set: number;
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
  opponentId?: string;
  isDoubles: boolean;
  partnerName?: string;
  partnerId?: string;
  opponent1Name?: string;
  opponent1Id?: string;
  opponent2Name?: string;
  opponent2Id?: string;
  matchType: 'singles' | 'doubles';
  startTime: Date;
}

interface UpdateMatchSessionParams {
  sessionId: string;
  sets?: {
    playerScore: string;
    opponentScore: string;
    completed: boolean;
  }[];
  currentSet?: number;
  midMatchMood?: string;
  midMatchNotes?: string;
  finalScore?: string;
  endMood?: string;
  matchNotes?: string;
  result?: 'win' | 'loss';
}

interface CompleteMatchSessionParams {
  finalScore?: string;
  endMood?: string;
  matchNotes?: string;
  result?: 'win' | 'loss';
}

export function useMatchSessions() {
  const { user } = useAuth();
  const [activeSession, setActiveSession] = useState<ActiveMatchSession | null>(null);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<any>(null);
  const subscriptionInitialized = useRef(false);

  const fetchActiveSession = async () => {
    if (!user) return;

    try {
      console.log('Fetching active match session for user:', user.id);
      
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

      console.log('Active session data:', data);
      
      // Type cast the data to ensure proper typing
      if (data) {
        const typedData: ActiveMatchSession = {
          ...data,
          match_type: data.match_type as 'singles' | 'doubles',
          status: data.status as 'active' | 'paused' | 'completed'
        };
        setActiveSession(typedData);
      } else {
        setActiveSession(null);
      }
    } catch (error) {
      console.error('Error in fetchActiveSession:', error);
    }
  };

  const createMatchSession = async (params: CreateMatchSessionParams) => {
    if (!user) return;

    try {
      console.log('Creating match session with params:', params);

      const sessionData = {
        player_id: user.id,
        opponent_name: params.opponentName,
        opponent_id: params.opponentId,
        is_doubles: params.isDoubles,
        partner_name: params.partnerName,
        partner_id: params.partnerId,
        opponent_1_name: params.opponent1Name,
        opponent_1_id: params.opponent1Id,
        opponent_2_name: params.opponent2Name,
        opponent_2_id: params.opponent2Id,
        match_type: params.matchType,
        start_time: params.startTime.toISOString(),
        status: 'active' as const,
        sets: [{ playerScore: '', opponentScore: '', completed: false }],
        current_set: 0
      };

      const { data, error } = await supabase
        .from('active_match_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) {
        console.error('Error creating match session:', error);
        throw error;
      }

      console.log('Match session created successfully:', data);
      
      // Type cast the response
      const typedData: ActiveMatchSession = {
        ...data,
        match_type: data.match_type as 'singles' | 'doubles',
        status: data.status as 'active' | 'paused' | 'completed'
      };
      setActiveSession(typedData);
      return typedData;
    } catch (error) {
      console.error('Error in createMatchSession:', error);
      throw error;
    }
  };

  const updateMatchSession = async (params: UpdateMatchSessionParams) => {
    if (!user) return;

    try {
      console.log('Updating match session with params:', params);

      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (params.sets !== undefined) updateData.sets = params.sets;
      if (params.currentSet !== undefined) updateData.current_set = params.currentSet;
      if (params.midMatchMood !== undefined) updateData.mid_match_mood = params.midMatchMood;
      if (params.midMatchNotes !== undefined) updateData.mid_match_notes = params.midMatchNotes;
      if (params.finalScore !== undefined) updateData.final_score = params.finalScore;
      if (params.endMood !== undefined) updateData.end_mood = params.endMood;
      if (params.matchNotes !== undefined) updateData.match_notes = params.matchNotes;
      if (params.result !== undefined) updateData.result = params.result;

      const { data, error } = await supabase
        .from('active_match_sessions')
        .update(updateData)
        .eq('id', params.sessionId)
        .eq('player_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating match session:', error);
        throw error;
      }

      console.log('Match session updated successfully:', data);
      
      // Type cast the response
      const typedData: ActiveMatchSession = {
        ...data,
        match_type: data.match_type as 'singles' | 'doubles',
        status: data.status as 'active' | 'paused' | 'completed'
      };
      setActiveSession(typedData);
      return typedData;
    } catch (error) {
      console.error('Error in updateMatchSession:', error);
      throw error;
    }
  };

  const completeMatchSession = async (sessionId: string, params: CompleteMatchSessionParams = {}) => {
    if (!user) return;

    try {
      console.log('Completing match session:', sessionId, params);

      const { data, error } = await supabase
        .from('active_match_sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          final_score: params.finalScore,
          end_mood: params.endMood,
          match_notes: params.matchNotes,
          result: params.result,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('player_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error completing match session:', error);
        throw error;
      }

      console.log('Match session completed successfully:', data);
      setActiveSession(null); // Clear the active session
      
      // Type cast the response
      const typedData: ActiveMatchSession = {
        ...data,
        match_type: data.match_type as 'singles' | 'doubles',
        status: data.status as 'active' | 'paused' | 'completed'
      };
      return typedData;
    } catch (error) {
      console.error('Error in completeMatchSession:', error);
      throw error;
    }
  };

  const cleanupChannel = () => {
    if (channelRef.current) {
      console.log('Cleaning up match sessions channel subscription');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      subscriptionInitialized.current = false;
    }
  };

  useEffect(() => {
    if (user && !subscriptionInitialized.current) {
      const loadData = async () => {
        setLoading(true);
        await fetchActiveSession();
        setLoading(false);
      };

      loadData();

      // Clean up any existing channel
      cleanupChannel();

      // Set up real-time subscription
      const channelName = `match-sessions-${user.id}-${Date.now()}`;
      const channel = supabase.channel(channelName);
      
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'active_match_sessions',
          filter: `player_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Match session real-time update:', payload);
          fetchActiveSession();
        }
      );

      channel.subscribe((status) => {
        console.log('Match sessions channel subscription status:', status);
        if (status === 'SUBSCRIBED') {
          subscriptionInitialized.current = true;
        }
      });

      channelRef.current = channel;

      return () => {
        cleanupChannel();
      };
    } else if (!user) {
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
