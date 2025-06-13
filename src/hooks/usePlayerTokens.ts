
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PlayerTokens {
  id: string;
  regular_tokens: number;
  premium_tokens: number;
  lifetime_earned: number;
  created_at: string;
  updated_at: string;
}

interface TokenTransaction {
  id: string;
  transaction_type: string;
  token_type: string;
  amount: number;
  balance_before: number;
  balance_after: number;
  source: string;
  description: string;
  created_at: string;
}

interface TokenResult {
  tokens_added?: number;
  tokens_spent?: number;
  token_type: string;
  new_balance: number;
  lifetime_earned?: number;
  success?: boolean;
  error?: string;
  premium_spent?: number;
  regular_earned?: number;
  conversion_rate?: number;
}

export function usePlayerTokens() {
  const { user } = useAuth();
  const [tokenData, setTokenData] = useState<PlayerTokens | null>(null);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [loading, setLoading] = useState(true);

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
      
      if (tokenType === 'premium') {
        toast.success(`💎 +${amount} Rally Points earned!`);
      } else {
        toast.success(`🪙 +${amount} Tokens earned!`);
      }

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

      if (tokenType === 'premium') {
        toast.success(`💎 ${amount} Rally Points spent!`);
      } else {
        toast.success(`🪙 ${amount} Tokens spent!`);
      }

      await fetchTokens();
      await fetchTransactions();
      return true;
    } catch (error) {
      console.error('Error in spendTokens:', error);
      toast.error('An error occurred while spending tokens');
      return false;
    }
  };

  const convertPremiumTokens = async (
    premiumAmount: number,
    conversionRate: number = 10
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .rpc('convert_premium_tokens', {
          user_id: user.id,
          premium_amount: premiumAmount,
          conversion_rate: conversionRate
        });

      if (error) {
        console.error('Error converting tokens:', error);
        toast.error('Failed to convert tokens');
        return false;
      }

      const result = data as unknown as TokenResult;
      
      if (!result.success) {
        toast.error(result.error || 'Conversion failed');
        return false;
      }

      toast.success(`💎 Converted ${premiumAmount} Rally Points to 🪙 ${result.regular_earned} Tokens!`);

      await fetchTokens();
      await fetchTransactions();
      return true;
    } catch (error) {
      console.error('Error in convertPremiumTokens:', error);
      toast.error('An error occurred while converting tokens');
      return false;
    }
  };

  const initializeTokens = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .rpc('initialize_player_tokens', { user_id: user.id });

      if (error) {
        console.error('Error initializing tokens:', error);
        return;
      }

      await fetchTokens();
    } catch (error) {
      console.error('Error in initializeTokens:', error);
    }
  };

  useEffect(() => {
    if (user) {
      const loadData = async () => {
        setLoading(true);
        await fetchTokens();
        await fetchTransactions();
        setLoading(false);
      };

      loadData();

      // Set up real-time subscription for token changes with unique channel name
      const channelName = `token-changes-${user.id}-${Date.now()}`;
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'token_balances',
            filter: `player_id=eq.${user.id}`
          },
          () => {
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
            fetchTransactions();
          }
        )
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    } else {
      setTokenData(null);
      setTransactions([]);
      setLoading(false);
    }
  }, [user]);

  return {
    tokenData,
    transactions,
    loading,
    addTokens,
    spendTokens,
    convertPremiumTokens,
    initializeTokens,
    refreshTokens: fetchTokens
  };
}
