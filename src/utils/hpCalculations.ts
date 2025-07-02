// HP and XP calculation utilities for session planning
export interface SessionEstimate {
  xpGain: number;
  hpCost: number;
  isCapApplied: boolean;
  maxDuration: number; // Max duration before cap
}

export interface ActivityRecommendation {
  type: 'match' | 'training' | 'social_play' | 'wellbeing';
  duration: number;
  count: number;
  description: string;
}

// Calculate HP cost and XP gain for a session
export function calculateSessionEstimate(
  sessionType: 'match' | 'training' | 'social_play' | 'wellbeing',
  durationMinutes: number
): SessionEstimate {
  if (sessionType === 'wellbeing') {
    const hpRestored = Math.max(5, Math.min(25, Math.ceil(durationMinutes / 5)));
    return {
      xpGain: durationMinutes * 5,
      hpCost: -hpRestored, // Negative = restoration
      isCapApplied: false,
      maxDuration: 300 // 5 hours max reasonable wellbeing
    };
  }

  // Base costs and caps per session type
  const sessionConfig = {
    match: { baseHpCost: 10, maxHpCost: 60, xpRate: 8, hpRate: 1.5 },
    social_play: { baseHpCost: 5, maxHpCost: 40, xpRate: 8, hpRate: 1.0 },
    training: { baseHpCost: 8, maxHpCost: 35, xpRate: 12, hpRate: 1.2 }
  };

  const config = sessionConfig[sessionType];
  
  // Calculate XP (linear)
  const xpGain = durationMinutes * config.xpRate;

  // Calculate HP cost with diminishing returns
  const minutes1 = Math.min(durationMinutes, 30);  // 0-30 min at 1.0x
  const minutes2 = Math.max(0, Math.min(durationMinutes - 30, 30));  // 31-60 min at 0.7x
  const minutes3 = Math.max(0, Math.min(durationMinutes - 60, 60));  // 61-120 min at 0.4x
  const minutes4 = Math.max(0, durationMinutes - 120);  // 120+ min at 0.2x

  const tier1Cost = Math.round(minutes1 * config.hpRate * 1.0);
  const tier2Cost = Math.round(minutes2 * config.hpRate * 0.7);
  const tier3Cost = Math.round(minutes3 * config.hpRate * 0.4);
  const tier4Cost = Math.round(minutes4 * config.hpRate * 0.2);

  const totalHpCost = config.baseHpCost + tier1Cost + tier2Cost + tier3Cost + tier4Cost;
  const hpCost = Math.min(totalHpCost, config.maxHpCost);
  const isCapApplied = totalHpCost > config.maxHpCost;

  // Calculate duration where cap is reached
  const maxDuration = calculateCapDuration(sessionType);

  return { xpGain, hpCost, isCapApplied, maxDuration };
}

// Calculate when HP cap is reached for a session type
function calculateCapDuration(sessionType: 'match' | 'training' | 'social_play'): number {
  const configs = {
    match: { base: 10, max: 60, rate: 1.5 },
    social_play: { base: 5, max: 40, rate: 1.0 },
    training: { base: 8, max: 35, rate: 1.2 }
  };
  
  const config = configs[sessionType];
  const targetCost = config.max - config.base;
  
  // Simulate until we hit the cap
  let duration = 0;
  let accumulatedCost = 0;
  
  while (accumulatedCost < targetCost && duration < 300) {
    duration += 5; // Check every 5 minutes
    const estimate = calculateSessionEstimate(sessionType, duration);
    accumulatedCost = estimate.hpCost - config.base;
    
    if (estimate.isCapApplied) {
      return duration;
    }
  }
  
  return duration;
}

// Get activity recommendations based on current HP
export function getActivityRecommendations(currentHP: number, maxHP: number): ActivityRecommendation[] {
  const recommendations: ActivityRecommendation[] = [];
  
  // Calculate how many sessions they can handle
  const matchCost = calculateSessionEstimate('match', 90).hpCost; // 90min match
  const trainingCost = calculateSessionEstimate('training', 60).hpCost; // 60min training
  const socialCost = calculateSessionEstimate('social_play', 90).hpCost; // 90min social
  
  const matchCount = Math.floor(currentHP / matchCost);
  const trainingCount = Math.floor(currentHP / trainingCost);
  const socialCount = Math.floor(currentHP / socialCost);
  
  if (matchCount > 0) {
    recommendations.push({
      type: 'match',
      duration: 90,
      count: matchCount,
      description: matchCount === 1 ? '1.5hr competitive match' : `${matchCount} x 1.5hr matches`
    });
  }
  
  if (trainingCount > 0) {
    recommendations.push({
      type: 'training',
      duration: 60,
      count: trainingCount,
      description: trainingCount === 1 ? '1hr training session' : `${trainingCount} x 1hr training`
    });
  }
  
  if (socialCount > 0) {
    recommendations.push({
      type: 'social_play',
      duration: 90,
      count: socialCount,
      description: socialCount === 1 ? '1.5hr social play' : `${socialCount} x 1.5hr social`
    });
  }
  
  return recommendations;
}

// Calculate recovery needed to offset a planned session
export function calculateRecoveryNeeded(
  sessionType: 'match' | 'training' | 'social_play',
  durationMinutes: number
): { wellbeingMinutes: number; description: string } {
  const estimate = calculateSessionEstimate(sessionType, durationMinutes);
  
  if (estimate.hpCost <= 0) {
    return { wellbeingMinutes: 0, description: 'No recovery needed' };
  }
  
  // Wellbeing restores ~1 HP per 5 minutes (minimum 5 HP for any session)
  const wellbeingMinutes = Math.max(15, estimate.hpCost * 5);
  
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  const sessionDurationText = hours > 0 ? `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}` : `${minutes}m`;
  
  const recoveryHours = Math.floor(wellbeingMinutes / 60);
  const recoveryMins = wellbeingMinutes % 60;
  const recoveryText = recoveryHours > 0 ? `${recoveryHours}h${recoveryMins > 0 ? ` ${recoveryMins}m` : ''}` : `${recoveryMins}m`;
  
  return {
    wellbeingMinutes,
    description: `${recoveryText} wellbeing to offset ${sessionDurationText} ${sessionType.replace('_', ' ')}`
  };
}

// Format session estimate for display
export function formatSessionEstimate(
  sessionType: 'match' | 'training' | 'social_play' | 'wellbeing',
  durationMinutes: number
): string {
  const estimate = calculateSessionEstimate(sessionType, durationMinutes);
  
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  const durationText = hours > 0 ? `${hours}h${minutes > 0 ? `${minutes}m` : ''}` : `${minutes}m`;
  
  const sessionName = sessionType === 'social_play' ? 'social play' : sessionType;
  
  if (sessionType === 'wellbeing') {
    return `⚡ ${durationText} ${sessionName} ≈ +${estimate.xpGain} XP, +${Math.abs(estimate.hpCost)} HP`;
  }
  
  const capText = estimate.isCapApplied ? ' (capped)' : '';
  const intensityHint = durationMinutes > 60 ? ' (intensity peaks early)' : '';
  
  return `⚡ ${durationText} ${sessionName} ≈ +${estimate.xpGain} XP, -${estimate.hpCost} HP${capText}${intensityHint}`;
}