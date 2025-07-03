// Streak Bonus System Utilities

export interface StreakBonus {
  day: number;
  bonusTokens: number;
  title: string;
  description: string;
  icon: string;
}

export const STREAK_BONUSES: StreakBonus[] = [
  {
    day: 3,
    bonusTokens: 2,
    title: "Getting Started",
    description: "3 days of dedication!",
    icon: "🌱"
  },
  {
    day: 7,
    bonusTokens: 5,
    title: "Week Warrior",
    description: "A full week of learning!",
    icon: "🔥"
  },
  {
    day: 14,
    bonusTokens: 10,
    title: "Two-Week Champion",
    description: "Incredible consistency!",
    icon: "⚡"
  },
  {
    day: 30,
    bonusTokens: 25,
    title: "Monthly Master",
    description: "Ultimate dedication!",
    icon: "🏆"
  }
];

/**
 * Calculate bonus tokens for a given streak day
 */
export function calculateStreakBonus(streakDay: number): number {
  if (streakDay >= 30) return 25;
  if (streakDay >= 14) return 10;
  if (streakDay >= 7) return 5;
  if (streakDay >= 3) return 2;
  return 0;
}

/**
 * Get the next streak milestone
 */
export function getNextStreakMilestone(currentStreak: number): StreakBonus | null {
  for (const bonus of STREAK_BONUSES) {
    if (currentStreak < bonus.day) {
      return bonus;
    }
  }
  return null; // Already at max streak
}

/**
 * Get all achieved streak bonuses
 */
export function getAchievedStreakBonuses(currentStreak: number): StreakBonus[] {
  return STREAK_BONUSES.filter(bonus => currentStreak >= bonus.day);
}

/**
 * Calculate total bonus tokens earned from streaks
 */
export function calculateTotalStreakBonuses(streakDays: number[]): number {
  return streakDays.reduce((total, day) => {
    return total + calculateStreakBonus(day);
  }, 0);
}

/**
 * Get streak level name based on current streak
 */
export function getStreakLevel(streakDay: number): string {
  if (streakDay >= 30) return "Monthly Master";
  if (streakDay >= 14) return "Two-Week Champion";
  if (streakDay >= 7) return "Week Warrior";
  if (streakDay >= 3) return "Getting Started";
  return "Beginner";
}

/**
 * Check if today is a streak bonus day
 */
export function isStreakBonusDay(streakDay: number): boolean {
  return STREAK_BONUSES.some(bonus => bonus.day === streakDay);
}

/**
 * Get motivational message based on streak
 */
export function getStreakMotivationalMessage(streakDay: number): string {
  if (streakDay === 0) {
    return "Start your learning journey today! 🎯";
  }
  
  if (streakDay < 3) {
    return `Great start! ${3 - streakDay} more days to unlock streak bonuses! 🌟`;
  }
  
  if (streakDay < 7) {
    return `You're building momentum! ${7 - streakDay} more days for the week bonus! 🔥`;
  }
  
  if (streakDay < 14) {
    return `Incredible consistency! ${14 - streakDay} more days for an even bigger bonus! ⚡`;
  }
  
  if (streakDay < 30) {
    return `You're a learning champion! ${30 - streakDay} more days to maximum bonus! 🏆`;
  }
  
  return "You've achieved the ultimate learning streak! Keep it up! 🎉";
}

/**
 * Get days until next milestone
 */
export function getDaysToNextMilestone(currentStreak: number): number {
  const nextMilestone = getNextStreakMilestone(currentStreak);
  return nextMilestone ? nextMilestone.day - currentStreak : 0;
}