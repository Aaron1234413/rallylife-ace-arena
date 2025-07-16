import { usePlayerTokens } from './usePlayerTokens';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function useTokenSystem() {
  const { user } = useAuth();
  const { 
    tokenData, 
    transactions, 
    loading,
    regularTokens,
    personalTokens,
    monthlySubscriptionTokens,
    premiumTokens,
    lifetimeEarned,
    addTokens,
    spendTokens,
    refreshTokens,
    hasRecentTransaction,
    getSessionTransactions,
    hasSufficientBalance
  } = usePlayerTokens();

  // Alias methods for backward compatibility with token system
  const awardTokens = async (
    amount: number,
    type: string,
    matchId?: string,
    description?: string
  ) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      const { data, error } = await supabase.rpc('award_tokens', {
        target_user_id: user.id,
        token_amount: amount,
        transaction_type: type,
        match_id: matchId || null,
        description_text: description
      });

      if (error) {
        console.error('Error awarding tokens:', error);
        return { success: false, error: error.message };
      }

      const result = data as any;
      if (result?.tokens_awarded > 0) {
        toast.success(`🪙 +${result.tokens_awarded} tokens earned!`);
        await refreshTokens();
      }

      return data;
    } catch (error) {
      console.error('Error in awardTokens:', error);
      return { success: false, error: 'Failed to award tokens' };
    }
  };

  const updateDailyStreak = async () => {
    try {
      const { data, error } = await supabase.rpc('handle_daily_login', {
        user_id: user?.id
      });

      if (error) {
        console.error('Error updating daily streak:', error);
        return { success: false, error: error.message };
      }

      const result = data as any;
      if (result?.tokens_awarded > 0) {
        toast.success(`🎯 Daily login streak! +${result.tokens_awarded} tokens`);
        await refreshTokens();
      }

      return data;
    } catch (error) {
      console.error('Error in updateDailyStreak:', error);
      return { success: false, error: 'Failed to update daily streak' };
    }
  };

  return {
    tokenData: tokenData ? {
      tokens: regularTokens,
      dailyStreak: 0, // Will be fetched from profiles table
      lifetimeTokensEarned: lifetimeEarned,
      lastLogin: null, // Will be fetched from profiles table
      transactions: transactions || []
    } : null,
    loading,
    awardTokens,
    spendTokens,
    updateDailyStreak,
    refreshTokenData: refreshTokens
  };
}