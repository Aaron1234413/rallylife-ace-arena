
import { calculateXPGain, calculateHPLoss, calculateAdjustedStake, canPlayersStake } from './gameEconomics';

export interface RewardCalculation {
  winXP: number;
  winHP: number;
  winTokens: number;
  loseXP: number;
  loseHP: number;
  loseTokens: number;
  difficultyMultiplier: number;
  levelDifference: number;
}

export interface BaseRewards {
  xp: number;
  hp: number;
  tokens: number;
}

export const BASE_SESSION_REWARDS = {
  social: { base_tokens: 15 },
  competitive: { base_tokens: 30 },
  training: { coach_fee: 12 }
} as const;

export const calculateLevelDifferenceMultiplier = (playerLevel: number, opponentLevel: number): number => {
  const levelDiff = opponentLevel - playerLevel;
  
  // Base multiplier is 1.0 for equal levels
  let multiplier = 1.0;
  
  if (levelDiff > 0) {
    // Opponent is higher level - increase rewards
    multiplier = 1.0 + (levelDiff * 0.15); // 15% bonus per level higher
  } else if (levelDiff < 0) {
    // Opponent is lower level - decrease rewards
    multiplier = Math.max(0.5, 1.0 + (levelDiff * 0.1)); // 10% penalty per level lower, min 50%
  }
  
  // Cap the multiplier between 0.5x and 3.0x
  return Math.min(3.0, Math.max(0.5, multiplier));
};

export const calculateSkillLevelMultiplier = (playerSkill: string, opponentSkill: string): number => {
  const skillLevels = ['beginner', 'intermediate', 'advanced', 'professional'];
  const playerIndex = skillLevels.indexOf(playerSkill.toLowerCase());
  const opponentIndex = skillLevels.indexOf(opponentSkill.toLowerCase());
  
  if (playerIndex === -1 || opponentIndex === -1) return 1.0;
  
  const skillDiff = opponentIndex - playerIndex;
  
  if (skillDiff > 0) {
    return 1.0 + (skillDiff * 0.2); // 20% bonus per skill level higher
  } else if (skillDiff < 0) {
    return Math.max(0.6, 1.0 + (skillDiff * 0.15)); // 15% penalty per skill level lower, min 60%
  }
  
  return 1.0;
};

export const calculateSessionRewards = (
  sessionType: 'social' | 'competitive' | 'training' | 'match',
  playerLevel: number,
  opponentLevel: number,
  isWinner: boolean,
  stakesAmount: number = 0,
  sessionDuration: number = 60
): RewardCalculation => {
  // Map match sessions to competitive for reward calculations
  const rewardSessionType = sessionType === 'match' ? 'competitive' : sessionType;
  
  // Validate inputs and handle errors gracefully
  try {
    // Calculate XP with level balancing using gameEconomics functions
    const xpGained = calculateXPGain({
      sessionType: rewardSessionType as 'competitive' | 'social' | 'training',
      playerLevel,
      opponentLevel,
      isWinner,
      sessionDuration
    });
    
    // Calculate HP loss with level balancing
    const hpLoss = calculateHPLoss({
      sessionType: rewardSessionType as 'competitive' | 'social' | 'training',
      playerLevel,
      opponentLevel,
      sessionDuration,
      isWinner
    });
    
    // Calculate token rewards based on session type
    let tokenRewards = 0;
    if (rewardSessionType === 'training') {
      tokenRewards = BASE_SESSION_REWARDS.training.coach_fee;
    } else if (stakesAmount > 0 && canPlayersStake(playerLevel, opponentLevel)) {
      const adjustedStakeResult = calculateAdjustedStake({
        baseStake: stakesAmount,
        playerLevel,
        opponentLevel
      });
      const adjustedStake = adjustedStakeResult.playerStake;
      if (rewardSessionType === 'competitive' || sessionType === 'match') {
        // 10% rake, 90% to winner
        tokenRewards = isWinner ? Math.floor(adjustedStake * 0.9) : 0;
      } else if (rewardSessionType === 'social') {
        // 10% rake, 90% distributed, max 20 token stakes
        const cappedStake = Math.min(adjustedStake, 20);
        tokenRewards = isWinner ? Math.floor(cappedStake * 0.9) : 0;
      }
    } else {
      // Base participation rewards when no stakes
      const baseRewards = BASE_SESSION_REWARDS[rewardSessionType as keyof typeof BASE_SESSION_REWARDS];
      tokenRewards = baseRewards && 'base_tokens' in baseRewards ? baseRewards.base_tokens : 0;
    }
    
    const levelMultiplier = calculateLevelDifferenceMultiplier(playerLevel, opponentLevel);
    
    return {
      winXP: isWinner ? xpGained : Math.floor(xpGained * 0.7), // Losers get 70% XP
      winHP: isWinner ? Math.max(1, -hpLoss + 2) : -hpLoss, // Winners get slight HP bonus
      winTokens: tokenRewards,
      loseXP: Math.floor(xpGained * 0.7),
      loseHP: -hpLoss,
      loseTokens: Math.floor(tokenRewards * 0.3), // Participation reward
      difficultyMultiplier: levelMultiplier,
      levelDifference: opponentLevel - playerLevel
    };
  } catch (error) {
    console.error('Error calculating session rewards:', error);
    
    // Fallback calculation if gameEconomics functions fail
    const baseXP = rewardSessionType === 'competitive' ? 25 : rewardSessionType === 'training' ? 20 : 15;
    const xpGained = isWinner ? Math.floor(baseXP * 1.5) : baseXP;
    const hpLoss = rewardSessionType === 'competitive' ? 5 : rewardSessionType === 'training' ? 4 : 3;
    const baseTokens = rewardSessionType === 'competitive' ? 30 : rewardSessionType === 'training' ? 12 : 15;
    const tokenRewards = stakesAmount > 0 && isWinner ? Math.floor(stakesAmount * 0.9) : baseTokens;
    
    const levelMultiplier = calculateLevelDifferenceMultiplier(playerLevel, opponentLevel);
    
    return {
      winXP: isWinner ? xpGained : Math.floor(xpGained * 0.7),
      winHP: isWinner ? Math.max(1, -hpLoss + 2) : -hpLoss,
      winTokens: tokenRewards,
      loseXP: Math.floor(xpGained * 0.7),
      loseHP: -hpLoss,
      loseTokens: Math.floor(tokenRewards * 0.3),
      difficultyMultiplier: levelMultiplier,
      levelDifference: opponentLevel - playerLevel
    };
  }
};
