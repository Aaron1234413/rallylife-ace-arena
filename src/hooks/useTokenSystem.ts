import { usePlayerTokens } from './usePlayerTokens';

export function useTokenSystem() {
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
    return await addTokens(amount, type, matchId || 'system', description);
  };

  const updateDailyStreak = async () => {
    // This would be handled by the existing token system
    // For now, return a mock response
    return {
      success: true,
      already_logged_today: false,
      current_streak: 1,
      new_streak: 1,
      tokens_awarded: 10
    };
  };

  return {
    tokenData: tokenData ? {
      tokens: regularTokens,
      dailyStreak: 0, // Would need to be added to existing system
      lifetimeTokensEarned: lifetimeEarned,
      lastLogin: null, // Would need to be added to existing system
      transactions: transactions || []
    } : null,
    loading,
    awardTokens,
    spendTokens,
    updateDailyStreak,
    refreshTokenData: refreshTokens
  };
}