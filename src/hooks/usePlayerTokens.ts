import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface CoachTokens {
  id: string;
  coach_id: string;
  current_tokens: number;
  lifetime_earned: number;
  created_at: string;
  updated_at: string;
}

export interface PlayerTokens {
  id: string;
  player_id: string;
  personal_tokens?: number; // Accumulating balance (renamed from regular_tokens)
  monthly_subscription_tokens?: number; // Added monthly based on subscription
  regular_tokens: number; // For backward compatibility
  premium_tokens?: number;
  lifetime_earned: number;
  created_at: string;
  updated_at: string;
}

export interface TokenRedemption {
  id: string;
  club_id: string;
  player_id: string;
  service_type: string; // 'lesson', 'court_time', 'clinic'
  cash_amount: number;
  tokens_used: number;
  redemption_percentage: number;
  club_pool_deducted: number;
  service_details: any;
  total_service_value: number;
  created_at: string;
}

export interface CoachTokenTransaction {
  id: string;
  coach_id: string;
  transaction_type: string;
  amount: number;
  source: string;
  description: string | null;
  balance_before: number;
  balance_after: number;
  metadata: any;
  created_at: string;
}

export interface TokenTransaction {
  id: string;
  player_id: string;
  transaction_type: string;
  token_type: string;
  amount: number;
  source: string;
  description: string | null;
  balance_before: number;
  balance_after: number;
  metadata: any;
  created_at: string;
}

interface TokenResult {
  tokens_added?: number;
  tokens_spent?: number;
  new_balance: number;
  lifetime_earned?: number;
  success?: boolean;
  error?: string;
  tokens_earned?: number;
}

export function usePlayerTokens() {
  const { user } = useAuth();
  const [tokenData, setTokenData] = useState<PlayerTokens | null>(null);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<any>(null);
  const subscriptionInitialized = useRef(false);

  const fetchTokens = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('token_balances')
        .select('*')
        .eq('player_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching tokens:', error);
        return;
      }

      setTokenData(data);
    } catch (error) {
      console.error('Error in fetchTokens:', error);
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('token_transactions')
        .select('*')
        .eq('player_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching token transactions:', error);
        return;
      }

      setTransactions(data || []);
    } catch (error) {
      console.error('Error in fetchTransactions:', error);
    }
  };

  const addTokens = async (
    amount: number,
    tokenType: string = 'regular',
    source: string = 'manual',
    description?: string
  ): Promise<void> => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .rpc('add_tokens', {
          user_id: user.id,
          amount: amount,
          token_type: tokenType,
          source: source,
          description: description
        });

      if (error) {
        console.error('Error adding tokens:', error);
        toast.error('Failed to add tokens');
        return;
      }

      const result = data as unknown as TokenResult;
      toast.success(`🪙 +${amount} Tokens earned!`);

      await fetchTokens();
      await fetchTransactions();
    } catch (error) {
      console.error('Error in addTokens:', error);
      toast.error('An error occurred while adding tokens');
    }
  };

  const spendTokens = async (
    amount: number,
    tokenType: string = 'regular',
    source: string = 'purchase',
    description?: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .rpc('spend_tokens', {
          user_id: user.id,
          amount: amount,
          token_type: tokenType,
          source: source,
          description: description
        });

      if (error) {
        console.error('Error spending tokens:', error);
        toast.error('Failed to spend tokens');
        return false;
      }

      const result = data as unknown as TokenResult;
      
      if (!result.success) {
        toast.error(result.error || 'Insufficient tokens');
        return false;
      }

      toast.success(`🪙 ${amount} Tokens spent!`);

      await fetchTokens();
      await fetchTransactions();
      return true;
    } catch (error) {
      console.error('Error in spendTokens:', error);
      toast.error('An error occurred while spending tokens');
      return false;
    }
  };

  const cleanupChannel = () => {
    if (channelRef.current) {
      console.log('Cleaning up token channel subscription');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      subscriptionInitialized.current = false;
    }
  };

  useEffect(() => {
    if (user && !subscriptionInitialized.current) {
      const loadData = async () => {
        setLoading(true);
        await fetchTokens();
        await fetchTransactions();
        setLoading(false);
      };

      loadData();

      // Clean up any existing channel first
      cleanupChannel();

      // Only create new subscription if not already subscribed
      const channelName = `tokens-${user.id}-${Date.now()}`;
      const channel = supabase.channel(channelName);
      
      channel
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'token_balances',
            filter: `player_id=eq.${user.id}`
          },
          () => {
            console.log('Token balance updated');
            fetchTokens();
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'token_transactions',
            filter: `player_id=eq.${user.id}`
          },
          () => {
            console.log('Token transaction added');
            fetchTransactions();
          }
        )
        // TEMPORARILY DISABLED: Real-time subscription to fix Play page loading
        // .subscribe((status) => {
        //   console.log('Token Channel subscription status:', status);
        //   if (status === 'SUBSCRIBED') {
        //     subscriptionInitialized.current = true;
        //   }
        // });

      channelRef.current = channel;

      return () => {
        cleanupChannel();
      };
    } else if (!user) {
      // Clean up when no user
      cleanupChannel();
      setTokenData(null);
      setTransactions([]);
      setLoading(false);
    }
  }, [user]);

  return {
    tokenData,
    transactions,
    loading,
    regularTokens: tokenData?.regular_tokens || 0,
    personalTokens: tokenData?.personal_tokens || tokenData?.regular_tokens || 0,
    monthlySubscriptionTokens: tokenData?.monthly_subscription_tokens || 0,
    premiumTokens: tokenData?.premium_tokens || 0,
    lifetimeEarned: tokenData?.lifetime_earned || 0,
    addTokens,
    spendTokens,
    refreshTokens: fetchTokens,
    // Real-time balance updates
    hasRecentTransaction: (timeWindow = 30000) => {
      const now = Date.now();
      return transactions.some(tx => {
        const txTime = new Date(tx.created_at).getTime();
        return now - txTime < timeWindow;
      });
    },
    // Get session-related transactions
    getSessionTransactions: () => {
      return transactions.filter(tx => 
        tx.source?.includes('session') || 
        tx.description?.toLowerCase().includes('session')
      );
    },
    // Check if user has sufficient balance
    hasSufficientBalance: (amount: number) => {
      return (tokenData?.regular_tokens || 0) >= amount;
    }
  };
}