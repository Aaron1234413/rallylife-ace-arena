// Game Mechanics Configuration for Level-Balanced Token Economics

// XP base ranges by session type
export const XP_RANGES = {
  social: { min: 10, max: 20 },
  competitive: { min: 20, max: 40 },
  training: { min: 15, max: 30 }
} as const;

// HP loss calculations
export const HP_LOSS = {
  social: { min: 2, max: 5 },
  competitive: { min: 5, max: 10 },
  training: { min: 3, max: 8 }
} as const;

// Level difference thresholds and multipliers
export const LEVEL_BALANCE = {
  max_stake_level_difference: 10, // Can't stake against players >10 levels apart
  xp_multipliers: {
    equal_levels: { higher: 1.0, lower: 1.0 }, // 0-2 level difference
    moderate_diff: { higher: 0.75, lower: 1.5 }, // 3-4 level difference  
    large_diff: { higher: 0.5, lower: 2.0 } // 5+ level difference
  },
  stake_adjustments: {
    equal_levels: 1.0, // 0-2 level difference - normal stakes
    moderate_diff: 0.75, // 3-5 level difference - 75% stakes
    large_diff: 0.5 // 6+ level difference - 50% stakes
  },
  hp_reductions: {
    moderate_diff: 1, // -1 HP when fighting 3+ levels lower
    large_diff: 2 // -2 HP when fighting 6+ levels lower
  }
} as const;

// Token economics with rake system
export const TOKEN_RAKE = {
  competitive: { rako: 0.1, winner: 0.9 },
  social: { rako: 0.1, winner: 0.9 },
  training: { rako: 0.1, winner: 0.9 }
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
 * Calculate level difference category for balancing
 */
export function getLevelDifferenceCategory(playerLevel: number, opponentLevel: number): 'equal_levels' | 'moderate_diff' | 'large_diff' {
  const levelDiff = Math.abs(playerLevel - opponentLevel);
  
  if (levelDiff <= 2) return 'equal_levels';
  if (levelDiff <= 4) return 'moderate_diff';
  return 'large_diff';
}

/**
 * Check if players can stake against each other
 */
export function canPlayersStake(playerLevel: number, opponentLevel: number): boolean {
  return Math.abs(playerLevel - opponentLevel) <= LEVEL_BALANCE.max_stake_level_difference;
}

export interface XPCalculationParams {
  sessionType: 'competitive' | 'social' | 'training' | 'wellbeing';
  playerLevel: number;
  opponentLevel?: number;
  isWinner: boolean;
  sessionDuration: number; // in minutes
  isTeamGame?: boolean;
}

/**
 * Calculate XP gain based on session type, level difference, and performance
 */
export function calculateXPGain(params: XPCalculationParams): number {
  const { sessionType, playerLevel, opponentLevel, isWinner, sessionDuration, isTeamGame } = params;
  
  // Map session types
  const mappedType = sessionType === 'wellbeing' ? 'training' : sessionType;
  const baseXP = XP_RANGES[mappedType as keyof typeof XP_RANGES];
  
  if (!baseXP) {
    return 25; // Fallback for unknown types
  }
  
  let xp = Math.floor(Math.random() * (baseXP.max - baseXP.min + 1)) + baseXP.min;
  
  // XP calculation based on session type and level difference
  if (sessionType === 'competitive') {
    // For competitive: lower level gets more XP
    if (opponentLevel && playerLevel !== opponentLevel) {
      if (playerLevel < opponentLevel) {
        // Lower level player gets bonus XP
        const levelDiff = opponentLevel - playerLevel;
        xp = Math.floor(xp * (1.0 + (levelDiff * 0.2))); // 20% bonus per level difference
      } else {
        // Higher level player gets reduced XP
        const levelDiff = playerLevel - opponentLevel;
        xp = Math.floor(xp * Math.max(0.5, 1.0 - (levelDiff * 0.1))); // 10% reduction per level, min 50%
      }
    }
    xp = isWinner ? Math.floor(xp * 1.3) : Math.floor(xp * 0.8); // Winners get 30% bonus, losers get 80%
  } else if (sessionType === 'social') {
    // For social: everyone gets the same amount regardless of level or outcome
    xp = Math.floor((baseXP.min + baseXP.max) / 2); // Average of range
  } else if (sessionType === 'training') {
    // For training: XP increases with time
    const timeMultiplier = 1.0 + ((sessionDuration - 30) / 30) * 0.3; // 30% increase per 30min over base
    xp = Math.floor(xp * Math.max(0.8, timeMultiplier)); // Min 80% of base XP
  } else if (sessionType === 'wellbeing') {
    xp = Math.floor(xp * 0.6); // Reduced XP for wellbeing
  }
  
  // Team game modifier
  const teamMultiplier = isTeamGame ? 0.9 : 1.0; // Slight reduction for team games
  
  const finalXP = Math.round(xp * teamMultiplier);
  return Math.max(1, finalXP); // Minimum 1 XP
}

export interface HPCalculationParams {
  sessionType: 'competitive' | 'social' | 'training' | 'wellbeing';
  playerLevel: number;
  opponentLevel?: number;
  sessionDuration: number; // in minutes
  isWinner?: boolean;
}

export interface StakeCalculationParams {
  playerLevel: number;
  opponentLevel: number;
  baseStake: number;
}

export interface StakingEligibilityParams {
  playerLevel: number;
  playerTokens: number;
  opponentLevel: number;
  opponentTokens: number;
  requestedStake: number;
}

/**
 * Calculate HP loss based on session type, level difference, and performance
 * Higher level players lose less HP compared to lower level players. Max 10 HP loss.
 */
export function calculateHPLoss(params: HPCalculationParams): number {
  const { sessionType, playerLevel, opponentLevel, sessionDuration, isWinner } = params;
  
  if (sessionType === 'wellbeing') {
    // Wellbeing sessions restore HP
    return -Math.floor(Math.random() * 3 + 2); // Restore 2-4 HP
  }
  
  // Start with base HP loss calculation based on time
  let hpLoss = Math.floor(sessionDuration / 15); // 1 HP per 15 minutes
  hpLoss = Math.max(1, hpLoss); // Minimum 1 HP loss
  
  // Higher level players lose less HP (more efficient)
  if (sessionType === 'competitive' || sessionType === 'training' || sessionType === 'social') {
    const levelReduction = Math.floor(playerLevel / 3); // 1 HP reduction per 3 levels
    hpLoss = Math.max(1, hpLoss - levelReduction);
  }
  
  // Cap at maximum 10 HP loss
  hpLoss = Math.min(10, hpLoss);
  
  return hpLoss;
}

/**
 * Calculate adjusted stake based on level difference to balance fairness
 */
export function calculateAdjustedStake(params: StakeCalculationParams): {
  playerStake: number;
  opponentStake: number;
  multiplier: number;
} {
  const { playerLevel, opponentLevel, baseStake } = params;
  
  const levelDiff = Math.abs(playerLevel - opponentLevel);
  
  if (levelDiff <= 1) {
    // Equal or close levels: equal stakes
    return {
      playerStake: baseStake,
      opponentStake: baseStake,
      multiplier: 1.0
    };
  }
  
  // Determine who is higher level
  const isPlayerHigher = playerLevel > opponentLevel;
  
  // Calculate adjustment factor (higher level player stakes more)
  const adjustmentFactor = 1 + (levelDiff * 0.15); // 15% more per level difference
  const maxAdjustment = 2.0; // Cap at 2x stake difference
  
  const finalAdjustment = Math.min(maxAdjustment, adjustmentFactor);
  
  let playerStake: number;
  let opponentStake: number;
  
  if (isPlayerHigher) {
    playerStake = Math.round(baseStake * finalAdjustment);
    opponentStake = baseStake;
  } else {
    playerStake = baseStake;
    opponentStake = Math.round(baseStake * finalAdjustment);
  }
  
  return {
    playerStake,
    opponentStake,
    multiplier: finalAdjustment
  };
}

/**
 * Validate if players can participate in staking (enhanced version)
 */
export function canPlayersStakeAdvanced(params: StakingEligibilityParams): {
  canStake: boolean;
  reason?: string;
  suggestedMaxStake?: number;
} {
  const { playerLevel, playerTokens, opponentLevel, opponentTokens, requestedStake } = params;
  
  // Minimum level requirement for staking
  const MIN_LEVEL_FOR_STAKING = 3;
  if (playerLevel < MIN_LEVEL_FOR_STAKING || opponentLevel < MIN_LEVEL_FOR_STAKING) {
    return {
      canStake: false,
      reason: `Players must be at least level ${MIN_LEVEL_FOR_STAKING} to participate in staking`
    };
  }
  
  // Maximum level difference for staking
  const MAX_LEVEL_DIFF = 10;
  const levelDiff = Math.abs(playerLevel - opponentLevel);
  if (levelDiff > MAX_LEVEL_DIFF) {
    return {
      canStake: false,
      reason: `Level difference too large (${levelDiff}). Maximum allowed: ${MAX_LEVEL_DIFF}`
    };
  }
  
  // Calculate adjusted stakes
  const { playerStake, opponentStake } = calculateAdjustedStake({
    playerLevel,
    opponentLevel,
    baseStake: requestedStake
  });
  
  // Check if players have enough tokens
  if (playerTokens < playerStake) {
    return {
      canStake: false,
      reason: `Insufficient tokens. You need ${playerStake} tokens but have ${playerTokens}`,
      suggestedMaxStake: Math.floor(playerTokens / (playerStake / requestedStake))
    };
  }
  
  if (opponentTokens < opponentStake) {
    return {
      canStake: false,
      reason: `Opponent has insufficient tokens. They need ${opponentStake} tokens but have ${opponentTokens}`,
      suggestedMaxStake: Math.floor(opponentTokens / (opponentStake / requestedStake))
    };
  }
  
  // Minimum stake validation
  const MIN_STAKE = 10;
  if (requestedStake < MIN_STAKE) {
    return {
      canStake: false,
      reason: `Minimum stake is ${MIN_STAKE} tokens`
    };
  }
  
  // Maximum stake based on player levels and token balance
  const maxStakeByLevel = Math.min(playerLevel, opponentLevel) * 50; // 50 tokens per level
  const maxStakeByBalance = Math.min(
    Math.floor(playerTokens * 0.3), // Max 30% of tokens
    Math.floor(opponentTokens * 0.3)
  );
  const maxStake = Math.min(maxStakeByLevel, maxStakeByBalance);
  
  if (requestedStake > maxStake) {
    return {
      canStake: false,
      reason: `Stake too high. Maximum allowed: ${maxStake} tokens`,
      suggestedMaxStake: maxStake
    };
  }
  
  return {
    canStake: true
  };
}

/**
 * Calculate token distribution for competitive, social, and training sessions
 */
export function calculateSessionTokens(sessionType: 'competitive' | 'social' | 'training', stakeAmount: number, isWinner: boolean): {
  playerTokens: number;
  rakoTokens: number;
} {
  const rakoTokens = Math.floor(stakeAmount * TOKEN_RAKE[sessionType].rako);
  const playerTokens = isWinner ? Math.floor(stakeAmount * TOKEN_RAKE[sessionType].winner) : 0;
  
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
  const cappedStake = Math.min(stakeAmount, 20); // Max 20 tokens for social stakes
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