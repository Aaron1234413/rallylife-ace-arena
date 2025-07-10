import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface MatchHistory {
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

  const fetchMatchHistory = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch completed match sessions
      const { data: matches, error } = await supabase
        .from('active_match_sessions')
        .select('*')
        .eq('player_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching match history:', error);
        return;
      }

      const matchData = matches || [];
      
      // Calculate statistics
      let matchesWon = 0;
      let matchesLost = 0;
      
      const recentMatches = matchData.slice(0, 10).map(match => {
        // Parse result to determine win/loss
        const result = match.result;
        let matchResult: 'won' | 'lost' | 'draw' = 'draw';
        
        if (result === 'won' || result === 'win') {
          matchResult = 'won';
          matchesWon++;
        } else if (result === 'lost' || result === 'loss') {
          matchResult = 'lost';
          matchesLost++;
        }
        
        return {
          id: match.id,
          result: matchResult,
          opponent_name: match.opponent_name || 'Unknown',
          final_score: match.final_score || 'N/A',
          completed_at: match.completed_at,
          match_type: match.match_type || 'casual'
        };
      });

      const totalMatches = matchData.length;
      const winRate = totalMatches > 0 ? Math.round((matchesWon / totalMatches) * 100) : 0;

      setMatchHistory({
        totalMatches,
        matchesWon,
        matchesLost,
        winRate,
        recentMatches
      });

    } catch (error) {
      console.error('Error in fetchMatchHistory:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMatchHistory();
    } else {
      setLoading(false);
    }
  }, [user]);

  return {
    matchHistory,
    loading,
    refreshMatchHistory: fetchMatchHistory
  };
}