
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

export const BASE_MATCH_REWARDS = {
  win: { xp: 60, hp: 5, tokens: 30 },
  lose: { xp: 50, hp: -10, tokens: 20 }
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

export const calculateMatchRewards = (
  playerLevel: number,
  opponentLevel: number,
  playerSkill: string = 'intermediate',
  opponentSkill: string = 'intermediate',
  isDoubles: boolean = false
): RewardCalculation => {
  const levelMultiplier = calculateLevelDifferenceMultiplier(playerLevel, opponentLevel);
  const skillMultiplier = calculateSkillLevelMultiplier(playerSkill, opponentSkill);
  const doublesMultiplier = isDoubles ? 1.2 : 1.0; // 20% bonus for doubles
  
  const totalMultiplier = levelMultiplier * skillMultiplier * doublesMultiplier;
  
  const winRewards = {
    xp: Math.round(BASE_MATCH_REWARDS.win.xp * totalMultiplier),
    hp: Math.max(1, Math.round(BASE_MATCH_REWARDS.win.hp * (totalMultiplier * 0.8))), // HP less affected
    tokens: Math.round(BASE_MATCH_REWARDS.win.tokens * totalMultiplier)
  };
  
  const loseRewards = {
    xp: Math.round(BASE_MATCH_REWARDS.lose.xp * Math.min(1.5, totalMultiplier)), // Cap lose XP bonus
    hp: Math.round(BASE_MATCH_REWARDS.lose.hp * Math.max(0.5, 1 / totalMultiplier)), // Easier opponents = less HP loss
    tokens: Math.round(BASE_MATCH_REWARDS.lose.tokens * Math.min(1.3, totalMultiplier)) // Cap lose token bonus
  };
  
  return {
    winXP: winRewards.xp,
    winHP: winRewards.hp,
    winTokens: winRewards.tokens,
    loseXP: loseRewards.xp,
    loseHP: loseRewards.hp,
    loseTokens: loseRewards.tokens,
    difficultyMultiplier: totalMultiplier,
    levelDifference: opponentLevel - playerLevel
  };
};
