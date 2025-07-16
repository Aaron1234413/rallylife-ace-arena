import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TokenTransaction {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  created_at: string;
}

interface TokenSystemData {
  tokens: number;
  dailyStreak: number;
  lifetimeTokensEarned: number;
  lastLogin: string | null;
  transactions: TokenTransaction[];
}

interface SpendTokensResult {
  success: boolean;
  error?: string;
  current_balance?: number;
  transaction_id?: string;
  previous_balance?: number;
  new_balance?: number;
  tokens_spent?: number;
}

interface DailyStreakResult {
  success: boolean;
  already_logged_today?: boolean;
  current_streak?: number;
  new_streak?: number;
  tokens_awarded?: number;
  previous_streak?: number;
  streak_broken?: boolean;
}

export function useTokenSystem() {
  const [tokenData, setTokenData] = useState<TokenSystemData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTokenData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user profile with token data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('tokens, daily_streak, lifetime_tokens_earned, last_login')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        // Initialize with defaults if profile doesn't exist
        setTokenData({
          tokens: 0,
          dailyStreak: 0,
          lifetimeTokensEarned: 0,
          lastLogin: null,
          transactions: []
        });
        return;
      }

      // Fetch recent transactions
      const { data: transactions, error: transactionsError } = await supabase
        .from('token_transactions')
        .select('id, amount, type, description, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (transactionsError) {
        console.error('Transactions error:', transactionsError);
      }

      setTokenData({
        tokens: profile?.tokens || 0,
        dailyStreak: profile?.daily_streak || 0,
        lifetimeTokensEarned: profile?.lifetime_tokens_earned || 0,
        lastLogin: profile?.last_login,
        transactions: transactions || []
      });

    } catch (error) {
      console.error('Error fetching token data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch token data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const awardTokens = async (
    amount: number, 
    type: string, 
    matchId?: string, 
    description?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('award-tokens', {
        body: {
          userId: user.id,
          amount,
          type,
          matchId,
          description
        }
      });

      if (error) throw error;

      // Refresh token data
      await fetchTokenData();

      toast({
        title: "Tokens Awarded!",
        description: `You earned ${amount} tokens for ${type.replace('_', ' ')}`,
      });

      return data.result;
    } catch (error) {
      console.error('Error awarding tokens:', error);
      toast({
        title: "Error",
        description: "Failed to award tokens",
        variant: "destructive"
      });
      throw error;
    }
  };

  const spendTokens = async (amount: number, type: string, description?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('spend_tokens', {
        spender_user_id: user.id,
        token_amount: amount,
        transaction_type: type,
        description_text: description
      }) as { data: SpendTokensResult | null, error: any };

      if (error) throw error;

      if (!data?.success) {
        toast({
          title: "Insufficient Tokens",
          description: `You need ${amount} tokens but only have ${data?.current_balance || 0}`,
          variant: "destructive"
        });
        return false;
      }

      // Refresh token data
      await fetchTokenData();

      toast({
        title: "Tokens Spent",
        description: `You spent ${amount} tokens on ${description || type}`,
      });

      return true;
    } catch (error) {
      console.error('Error spending tokens:', error);
      toast({
        title: "Error",
        description: "Failed to spend tokens",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateDailyStreak = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('update_daily_streak', {
        target_user_id: user.id
      }) as { data: DailyStreakResult | null, error: any };

      if (error) throw error;

      // Refresh token data
      await fetchTokenData();

      if (!data?.already_logged_today && (data?.tokens_awarded || 0) > 0) {
        toast({
          title: "Daily Login Streak!",
          description: `Day ${data?.new_streak}! Earned ${data?.tokens_awarded} tokens`,
        });
      }

      return data;
    } catch (error) {
      console.error('Error updating daily streak:', error);
      return null;
    }
  };

  // Auto-update daily streak on hook initialization
  useEffect(() => {
    const initializeTokenSystem = async () => {
      await fetchTokenData();
      await updateDailyStreak();
    };

    initializeTokenSystem();
  }, []);

  // Real-time updates for token transactions
  useEffect(() => {
    const setupRealtimeUpdates = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const channel = supabase
        .channel('token-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'token_transactions',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchTokenData();
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`
          },
          () => {
            fetchTokenData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtimeUpdates();
  }, []);

  return {
    tokenData,
    loading,
    awardTokens,
    spendTokens,
    updateDailyStreak,
    refreshTokenData: fetchTokenData
  };
}