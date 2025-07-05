
import { useMemo } from 'react';
import { usePlayerAchievements } from '@/hooks/usePlayerAchievements';
// Meditation and stretching hooks removed - migrated to wellbeing sessions

interface ClosestAchievement {
  id: string;
  name: string;
  description: string;
  category: string;
  tier: string;
  requirement_type: string;
  requirement_value: number;
  reward_xp: number;
  reward_tokens: number;
  current_progress: number;
  progress_percentage: number;
}

export function useClosestAchievements() {
  const { achievements, playerAchievements, loading } = usePlayerAchievements();
  // Meditation and stretching progress removed - migrated to wellbeing sessions

  const closestAchievements = useMemo(() => {
    if (loading || !achievements.length) return [];

    // Get IDs of already unlocked achievements
    const unlockedIds = new Set(playerAchievements.map(pa => pa.achievement_id));
    
    // Filter to only unachieved achievements
    const unachievedAchievements = achievements.filter(a => !unlockedIds.has(a.id));

    // Calculate progress for each unachieved achievement
    const achievementsWithProgress: ClosestAchievement[] = unachievedAchievements.map(achievement => {
      let currentProgress = 0;

      // Get current progress based on category and requirement type
      // Note: meditation and stretching migrated to wellbeing sessions
      currentProgress = 0;

      const progressPercentage = Math.min((currentProgress / achievement.requirement_value) * 100, 100);

      return {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        category: achievement.category,
        tier: achievement.tier,
        requirement_type: achievement.requirement_type,
        requirement_value: achievement.requirement_value,
        reward_xp: achievement.reward_xp,
        reward_tokens: achievement.reward_tokens,
        current_progress: currentProgress,
        progress_percentage: progressPercentage,
      };
    });

    // Sort by progress percentage (highest first) and return top 3
    return achievementsWithProgress
      .sort((a, b) => b.progress_percentage - a.progress_percentage)
      .slice(0, 3);
  }, [achievements, playerAchievements, loading]);

  return {
    closestAchievements,
    loading,
  };
}
