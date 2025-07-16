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
  personal_tokens?: number;
  monthly_subscription_tokens?: number;
  regular_tokens: number;
  premium_tokens?: number;
  lifetime_earned: number;
  created_at: string;
  updated_at: string;
}

export interface TokenRedemption {
  id: string;
  club_id: string;
  player_id: string;
  service_type: string;
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

export function usePlayerTokens() {
  const { user } = useAuth();
  const [tokenData, setTokenData] = useState<PlayerTokens | null>(null);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<any>(null);
  const subscriptionInitialized = useRef(false);
  const isSubscribed = useRef(false);

  const fetchTokens = async () => {
    if (!user) return;

    try {
      const response = await supabase
        .from('profiles')
        .select('id, tokens, daily_streak, last_login, lifetime_tokens_earned')
        .eq('id', user.id)
        .single();

      if (response.error) {
        console.error('Error fetching tokens:', response.error);
        return;
      }

      const data = response.data;
      const transformedData: PlayerTokens = {
        id: data.id,
        player_id: data.id,
        regular_tokens: data.tokens || 0,
        personal_tokens: data.tokens || 0,
        monthly_subscription_tokens: 0,
        premium_tokens: 0,
        lifetime_earned: data.lifetime_tokens_earned || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setTokenData(transformedData);
    } catch (error) {
      console.error('Error in fetchTokens:', error);
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      // For now, return empty array - transactions will be added when we use the system
      setTransactions([]);
    } catch (error) {
      console.error('Error in fetchTransactions:', error);
      setTransactions([]);
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
      const { data, error } = await supabase.rpc('award_tokens', {
        target_user_id: user.id,
        token_amount: amount,
        transaction_type: tokenType,
        match_id: null,
        description_text: description
      });

      if (error) {
        console.error('Error adding tokens:', error);
        toast.error('Failed to add tokens');
        return;
      }

      const result = data as any;
      if (result?.success) {
        toast.success(`🪙 +${amount} Tokens earned!`);
        await fetchTokens();
        await fetchTransactions();
      }
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
      const { data, error } = await supabase.rpc('spend_tokens', {
        spender_user_id: user.id,
        token_amount: amount,
        transaction_type: tokenType,
        description_text: description
      });

      if (error) {
        console.error('Error spending tokens:', error);
        toast.error('Failed to spend tokens');
        return false;
      }

      const result = data as any;
      
      if (!result?.success) {
        toast.error(result?.error || 'Insufficient tokens');
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
      isSubscribed.current = false;
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

      const channelName = `tokens-${user.id}-${Date.now()}`;
      const channel = supabase.channel(channelName);
      
      channel
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`
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
            filter: `user_id=eq.${user.id}`
          },
          () => {
            console.log('Token transaction added');
            fetchTransactions();
          }
        );

      // Only subscribe if not already subscribed
      if (!isSubscribed.current) {
        channel.subscribe((status) => {
          console.log('Token Channel subscription status:', status);
          if (status === 'SUBSCRIBED') {
            subscriptionInitialized.current = true;
            isSubscribed.current = true;
          }
        });
      }

      channelRef.current = channel;

      return () => {
        cleanupChannel();
      };
    } else if (!user) {
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
    hasRecentTransaction: (timeWindow = 30000) => {
      const now = Date.now();
      return transactions.some(tx => {
        const txTime = new Date(tx.created_at).getTime();
        return now - txTime < timeWindow;
      });
    },
    getSessionTransactions: () => {
      return transactions.filter(tx => 
        tx.source?.includes('session') || 
        tx.description?.toLowerCase().includes('session')
      );
    },
    hasSufficientBalance: (amount: number) => {
      return (tokenData?.regular_tokens || 0) >= amount;
    }
  };
}