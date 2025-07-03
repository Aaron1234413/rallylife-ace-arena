import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'technique' | 'strategy' | 'equipment' | 'knowledge';
  content: string;
  action_text: string;
  tokens_reward: number;
  is_completed: boolean;
}

export function useDailyChallenge() {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodaysChallenge = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase.rpc('get_todays_challenge');
      
      if (error) throw error;
      
      const result = data as any;
      if (result?.success) {
        setChallenge(result.challenge);
      } else {
        setError(result?.error || 'Failed to fetch challenge');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching challenge:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const completeChallenge = async (challengeId: string) => {
    if (!challenge || challenge.is_completed) return { success: false, error: 'Invalid challenge state' };
    
    try {
      const { data, error } = await supabase.rpc('complete_daily_challenge', {
        challenge_id_param: challengeId
      });
      
      if (error) throw error;
      
      const result = data as any;
      if (result?.success) {
        setChallenge(prev => prev ? { ...prev, is_completed: true } : null);
        return { success: true, tokens_earned: result.tokens_earned };
      } else {
        return { success: false, error: result?.error || 'Failed to complete challenge' };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error completing challenge:', err);
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    fetchTodaysChallenge();
  }, []);

  return {
    challenge,
    isLoading,
    error,
    completeChallenge,
    refetch: fetchTodaysChallenge
  };
}