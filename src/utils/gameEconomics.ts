// Game Mechanics Configuration for Phase 3 Token Economics

// HP loss calculations
export const HP_LOSS = {
  social: { min: 2, max: 5 },
  competitive: { min: 5, max: 10 },
  training: { min: 3, max: 8 }
} as const;

// Token economics with rake system
export const TOKEN_RAKE = {
  competitive: { rako: 0.1, winner: 0.9 },
  social: { rako: 0.1, max_stake: 20 }
} as const;

// Token value configuration
export const TOKEN_CONFIG = {
  value_per_token: 0.007, // $0.007 per token
  max_redemption_percentages: {
    court_booking: 30,
    coaching_lesson: 25,
    group_clinic: 20,
    equipment_rental: 50,
    club_merchandise: 15
  }
} as const;

// Subscription token allocations (monthly)
export const SUBSCRIPTION_TOKENS = {
  player: {
    free: 0,
    basic: 100,
    premium: 250,
    pro: 500
  },
  coach: {
    free: 50,
    standard: 200,
    professional: 500,
    elite: 1000
  },
  club: {
    community: 5000,
    core: 50000,
    plus: 150000,
    pro: 300000
  }
} as const;

/**
 * Calculate HP loss based on activity type and intensity
 */
export function calculateHPLoss(
  activityType: 'social' | 'competitive' | 'training',
  intensity: 'low' | 'medium' | 'high' | 'extreme' = 'medium',
  duration?: number
): number {
  const baseLoss = HP_LOSS[activityType];
  let hpLoss = Math.floor(Math.random() * (baseLoss.max - baseLoss.min + 1)) + baseLoss.min;
  
  // Adjust for intensity
  const intensityMultiplier = {
    low: 0.7,
    medium: 1.0,
    high: 1.3,
    extreme: 1.6
  };
  
  hpLoss = Math.floor(hpLoss * intensityMultiplier[intensity]);
  
  // Adjust for duration (if provided in minutes)
  if (duration) {
    const durationMultiplier = Math.min(1 + (duration - 60) / 120, 2); // Max 2x for very long sessions
    hpLoss = Math.floor(hpLoss * durationMultiplier);
  }
  
  return Math.max(1, hpLoss); // Minimum 1 HP loss
}

/**
 * Calculate token distribution for competitive matches
 */
export function calculateCompetitiveTokens(stakeAmount: number, isWinner: boolean): {
  playerTokens: number;
  rakoTokens: number;
} {
  const rakoTokens = Math.floor(stakeAmount * TOKEN_RAKE.competitive.rako);
  const playerTokens = isWinner ? Math.floor(stakeAmount * TOKEN_RAKE.competitive.winner) : 0;
  
  return { playerTokens, rakoTokens };
}

/**
 * Calculate token distribution for social play
 */
export function calculateSocialTokens(stakeAmount: number): {
  playerTokens: number;
  rakoTokens: number;
  cappedStake: number;
} {
  const cappedStake = Math.min(stakeAmount, TOKEN_RAKE.social.max_stake);
  const rakoTokens = Math.floor(cappedStake * TOKEN_RAKE.social.rako);
  const playerTokens = cappedStake - rakoTokens;
  
  return { playerTokens, rakoTokens, cappedStake };
}

/**
 * Calculate maximum tokens that can be redeemed for a service
 */
export function calculateMaxRedemptionTokens(
  serviceType: keyof typeof TOKEN_CONFIG.max_redemption_percentages,
  totalServiceValue: number
): number {
  const maxPercentage = TOKEN_CONFIG.max_redemption_percentages[serviceType];
  const maxTokenValue = totalServiceValue * (maxPercentage / 100);
  return Math.floor(maxTokenValue / TOKEN_CONFIG.value_per_token);
}

/**
 * Calculate subscription token allocation
 */
export function getSubscriptionTokens(
  userType: 'player' | 'coach' | 'club',
  tier: string
): number {
  const allocations = SUBSCRIPTION_TOKENS[userType] as Record<string, number>;
  return allocations[tier] || 0;
}

/**
 * Calculate club token pool status
 */
export function calculateClubPoolStatus(pool: {
  allocated_tokens: number;
  used_tokens: number;
  overdraft_tokens: number;
  purchased_tokens: number;
  rollover_tokens: number;
}): {
  available_balance: number;
  can_redeem: boolean;
  usage_percentage: number;
  is_low_balance: boolean;
} {
  const totalAllocated = pool.allocated_tokens + pool.rollover_tokens + pool.purchased_tokens;
  const available_balance = totalAllocated - pool.used_tokens + pool.overdraft_tokens;
  const can_redeem = available_balance > 0;
  const usage_percentage = totalAllocated > 0 ? (pool.used_tokens / totalAllocated) * 100 : 0;
  const is_low_balance = available_balance < (totalAllocated * 0.2); // Less than 20% remaining
  
  return {
    available_balance,
    can_redeem,
    usage_percentage,
    is_low_balance
  };
}