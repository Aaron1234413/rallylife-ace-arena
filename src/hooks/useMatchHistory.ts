import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface MatchHistory {
  totalMatches: number;
  matchesWon: number;
  matchesLost: number;
  winRate: number;
  recentMatches: Array<{
    id: string;
    result: 'won' | 'lost' | 'draw';
    opponent_name: string;
    final_score: string;
    completed_at: string;
    match_type: string;
  }>;
}

export function useMatchHistory() {
  const { user } = useAuth();
  const [matchHistory, setMatchHistory] = useState<MatchHistory>({
    totalMatches: 0,
    matchesWon: 0,
    matchesLost: 0,
    winRate: 0,
    recentMatches: []
  });
  const [loading, setLoading] = useState(true);

  const refreshMatchHistory = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get completed matches from activity logs
      const { data: matches, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('player_id', user.id)
        .eq('activity_category', 'match')
        .not('result', 'is', null)
        .order('logged_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const totalMatches = matches?.length || 0;
      const wins = matches?.filter(match => match.result === 'win').length || 0;
      const losses = totalMatches - wins;
      const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;

      const recentMatches = matches?.slice(0, 5).map(match => ({
        id: match.id,
        result: match.result === 'win' ? 'won' as const : 'lost' as const,
        opponent_name: match.opponent_name || 'Unknown',
        final_score: match.score || '',
        completed_at: match.logged_at,
        match_type: match.activity_type || 'casual'
      })) || [];

      setMatchHistory({
        totalMatches,
        matchesWon: wins,
        matchesLost: losses,
        winRate,
        recentMatches
      });
    } catch (error) {
      console.error('Error fetching match history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshMatchHistory();
    }
  }, [user]);

  return {
    matchHistory,
    loading,
    refreshMatchHistory
  };
}