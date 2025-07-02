/**
 * Session HP/XP calculation utilities that mirror the database logic
 * from supabase/migrations/20250702165452-68076687-45d7-4bc3-a5ad-49368d320292.sql
 */

export interface SessionCostCalculation {
  sessionType: string;
  durationMinutes: number;
  hpCost: number;
  xpGain: number;
  baseHpCost: number;
  maxHpCost: number;
  tier1Cost: number;
  tier2Cost: number;
  tier3Cost: number;
  tier4Cost: number;
  capReached: boolean;
  breakdown: {
    tier1Minutes: number;
    tier2Minutes: number;
    tier3Minutes: number;
    tier4Minutes: number;
  };
}

export interface SessionPreview {
  preSessionText: string;
  smartWarnings: string[];
  recommendations: string[];
  recoveryAdvice: string;
  costBreakdown: SessionCostCalculation;
}

/**
 * Calculate HP cost and XP gain for a session using exact database logic
 */
export function calculateSessionCosts(sessionType: string, durationMinutes: number): SessionCostCalculation {
  // XP Calculation (linear, no diminishing returns) - from database
  let xpGain = 0;
  switch (sessionType) {
    case 'training':
      xpGain = durationMinutes * 12; // 12 XP per minute
      break;
    case 'match':
      xpGain = durationMinutes * 8; // 8 XP per minute
      break;
    case 'social_play':
      xpGain = durationMinutes * 8; // 8 XP per minute
      break;
    case 'wellbeing':
      xpGain = durationMinutes * 5; // 5 XP per minute
      break;
    default:
      xpGain = durationMinutes * 5; // Default
  }

  // For wellbeing sessions, return HP restoration instead of cost
  if (sessionType === 'wellbeing') {
    const hpRestored = Math.max(5, Math.min(25, Math.ceil(durationMinutes / 5)));
    return {
      sessionType,
      durationMinutes,
      hpCost: -hpRestored, // Negative = restoration
      xpGain,
      baseHpCost: 0,
      maxHpCost: 25,
      tier1Cost: 0,
      tier2Cost: 0,
      tier3Cost: 0,
      tier4Cost: 0,
      capReached: false,
      breakdown: { tier1Minutes: 0, tier2Minutes: 0, tier3Minutes: 0, tier4Minutes: 0 }
    };
  }

  // HP Calculation with diminishing returns (exact database logic)
  let baseHpCost = 0;
  let maxHpCost = 0;
  let hpPerMinute = 0;

  // Set base costs and caps per session type
  switch (sessionType) {
    case 'match':
      baseHpCost = 10;
      maxHpCost = 60;
      hpPerMinute = 1.5;
      break;
    case 'social_play':
      baseHpCost = 5;
      maxHpCost = 40;
      hpPerMinute = 1.0;
      break;
    case 'training':
      baseHpCost = 8;
      maxHpCost = 35;
      hpPerMinute = 1.2;
      break;
    default:
      baseHpCost = 5;
      maxHpCost = 30;
      hpPerMinute = 1.0;
  }

  // Calculate minutes in each tier with diminishing returns
  const tier1Minutes = Math.min(durationMinutes, 30); // First 30 minutes at full intensity
  const tier2Minutes = durationMinutes > 30 ? Math.min(durationMinutes - 30, 30) : 0; // Minutes 31-60 at 0.7x
  const tier3Minutes = durationMinutes > 60 ? Math.min(durationMinutes - 60, 60) : 0; // Minutes 61-120 at 0.4x
  const tier4Minutes = durationMinutes > 120 ? durationMinutes - 120 : 0; // Minutes 120+ at 0.2x

  // Calculate HP cost for each tier
  const tier1Cost = Math.round(tier1Minutes * hpPerMinute * 1.0); // Full intensity
  const tier2Cost = Math.round(tier2Minutes * hpPerMinute * 0.7); // 0.7x multiplier
  const tier3Cost = Math.round(tier3Minutes * hpPerMinute * 0.4); // 0.4x multiplier
  const tier4Cost = Math.round(tier4Minutes * hpPerMinute * 0.2); // 0.2x multiplier

  // Total HP cost with base cost and cap
  const uncappedHpCost = baseHpCost + tier1Cost + tier2Cost + tier3Cost + tier4Cost;
  const hpCost = Math.min(uncappedHpCost, maxHpCost);
  const capReached = uncappedHpCost > maxHpCost;

  return {
    sessionType,
    durationMinutes,
    hpCost,
    xpGain,
    baseHpCost,
    maxHpCost,
    tier1Cost,
    tier2Cost,
    tier3Cost,
    tier4Cost,
    capReached,
    breakdown: {
      tier1Minutes,
      tier2Minutes,
      tier3Minutes,
      tier4Minutes
    }
  };
}

/**
 * Generate smart warnings based on session duration and HP cost
 */
export function getSmartWarnings(durationMinutes: number, calculation: SessionCostCalculation): string[] {
  const warnings: string[] = [];

  // Diminishing returns warning
  if (durationMinutes > 30) {
    warnings.push(`💡 After 30min, additional time has minimal HP cost (${calculation.breakdown.tier2Minutes > 0 ? '30% less' : ''}${calculation.breakdown.tier3Minutes > 0 ? ', then 60% less' : ''}${calculation.breakdown.tier4Minutes > 0 ? ', then 80% less' : ''})`);
  }

  // Cap reached warning
  if (calculation.capReached) {
    warnings.push(`⚡ Intensity peaks early - HP cost capped at ${calculation.maxHpCost} HP`);
  }

  // Long session efficiency warning
  if (durationMinutes > 60) {
    const efficiency = Math.round((calculation.hpCost / durationMinutes) * 100) / 100;
    warnings.push(`⏱️ ${durationMinutes}min session has ${efficiency} HP cost per minute (most cost in first 30min)`);
  }

  return warnings;
}

/**
 * Generate HP-based recommendations for session capacity
 */
export function getHPRecommendations(currentHP: number, sessionType: string): string[] {
  const recommendations: string[] = [];

  // Calculate how many sessions of each type they can handle
  const matchCost = calculateSessionCosts('match', 90).hpCost;
  const trainingCost = calculateSessionCosts('training', 60).hpCost;
  const socialCost = calculateSessionCosts('social_play', 45).hpCost;

  const matchCapacity = Math.floor(currentHP / matchCost);
  const trainingCapacity = Math.floor(currentHP / trainingCost);
  const socialCapacity = Math.floor(currentHP / socialCost);

  if (currentHP >= matchCost) {
    recommendations.push(`✅ Current HP supports ${matchCapacity} match${matchCapacity > 1 ? 'es' : ''} (90min each)`);
  }
  
  if (currentHP >= trainingCost) {
    recommendations.push(`✅ Current HP supports ${trainingCapacity} training session${trainingCapacity > 1 ? 's' : ''} (60min each)`);
  }

  if (currentHP >= socialCost) {
    recommendations.push(`✅ Current HP supports ${socialCapacity} social session${socialCapacity > 1 ? 's' : ''} (45min each)`);
  }

  // Low HP warnings
  if (currentHP < matchCost && currentHP >= trainingCost) {
    recommendations.push(`⚠️ HP too low for matches - stick to training/social sessions`);
  } else if (currentHP < trainingCost && currentHP >= socialCost) {
    recommendations.push(`⚠️ HP too low for intense activities - social sessions recommended`);
  } else if (currentHP < socialCost) {
    recommendations.push(`🔋 HP critically low - prioritize wellbeing sessions for recovery`);
  }

  return recommendations;
}

/**
 * Calculate recovery advice based on HP cost
 */
export function getRecoveryAdvice(hpCost: number): string {
  if (hpCost <= 0) return ''; // Wellbeing sessions don't need recovery advice

  // Calculate wellbeing time needed to offset this cost
  const wellbeingMinutesNeeded = Math.ceil(hpCost / 5) * 5; // 1 HP per 5 minutes roughly
  
  if (hpCost <= 15) {
    return `🔋 Light recovery: ${wellbeingMinutesNeeded}min wellbeing session will offset this activity`;
  } else if (hpCost <= 35) {
    return `🔋 Moderate recovery: ${wellbeingMinutesNeeded}min wellbeing session recommended after this activity`;
  } else {
    return `🔋 Significant recovery: Plan ${wellbeingMinutesNeeded}min+ wellbeing session to fully recover from this intensive activity`;
  }
}

/**
 * Generate complete session preview with contextual messaging
 */
export function formatSessionPreview(
  sessionType: string, 
  durationMinutes: number, 
  currentHP: number
): SessionPreview {
  const calculation = calculateSessionCosts(sessionType, durationMinutes);
  const warnings = getSmartWarnings(durationMinutes, calculation);
  const recommendations = getHPRecommendations(currentHP, sessionType);
  const recoveryAdvice = getRecoveryAdvice(calculation.hpCost);

  // Format session type name
  const sessionName = sessionType === 'social_play' ? 'social session' : 
                     sessionType === 'wellbeing' ? 'wellbeing session' : 
                     sessionType;

  // Format duration
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  const durationText = hours > 0 ? `${hours}h${minutes > 0 ? `${minutes}m` : ''}` : `${durationMinutes}min`;

  // Create pre-session text
  let preSessionText = '';
  if (calculation.hpCost <= 0) {
    preSessionText = `🔋 ${durationText} ${sessionName} ≈ +${calculation.xpGain} XP, +${Math.abs(calculation.hpCost)} HP restored`;
  } else {
    preSessionText = `⚡ ${durationText} ${sessionName} ≈ +${calculation.xpGain} XP, -${calculation.hpCost} HP${calculation.capReached ? ' (intensity peaks early)' : ''}`;
  }

  return {
    preSessionText,
    smartWarnings: warnings,
    recommendations,
    recoveryAdvice,
    costBreakdown: calculation
  };
}

/**
 * Check if a session would be too costly for current HP
 */
export function isSessionTooRisky(currentHP: number, sessionType: string, durationMinutes: number): boolean {
  const calculation = calculateSessionCosts(sessionType, durationMinutes);
  const hpAfter = currentHP - calculation.hpCost;
  
  // Too risky if it would drop below 10% HP
  return hpAfter < 10;
}

/**
 * Suggest alternative durations when a session is too costly
 */
export function suggestAlternativeDurations(currentHP: number, sessionType: string, originalDuration: number): number[] {
  const alternatives: number[] = [];
  const durations = [15, 30, 45, 60, 90, 120];
  
  for (const duration of durations) {
    if (duration >= originalDuration) break; // Only suggest shorter durations
    
    const calculation = calculateSessionCosts(sessionType, duration);
    const hpAfter = currentHP - calculation.hpCost;
    
    if (hpAfter >= 20) { // Keep at least 20% HP buffer
      alternatives.push(duration);
    }
  }
  
  return alternatives.slice(-2); // Return up to 2 best alternatives
}