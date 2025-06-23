
import { useCallback } from 'react';
import { usePlayerAchievements } from '@/hooks/usePlayerAchievements';
import { useStretchingProgress } from '@/hooks/useStretching';

export function useStretchingAchievements() {
  const { checkAchievementUnlock, achievements } = usePlayerAchievements();
  const { data: stretchingProgress } = useStretchingProgress();

  const checkStretchingAchievements = useCallback(async () => {
    if (!stretchingProgress || !achievements.length) return;

    // Get stretching-specific achievements
    const stretchingAchievements = achievements.filter(a => a.category === 'stretching');

    for (const achievement of stretchingAchievements) {
      let currentValue = 0;

      switch (achievement.requirement_type) {
        case 'stretching_sessions':
          currentValue = stretchingProgress.total_sessions;
          break;
        case 'stretching_minutes':
          currentValue = stretchingProgress.total_minutes;
          break;
        case 'stretching_streak':
          currentValue = stretchingProgress.current_streak;
          break;
        default:
          continue;
      }

      // Check if achievement should be unlocked
      if (currentValue >= achievement.requirement_value) {
        try {
          await checkAchievementUnlock(achievement.id);
        } catch (error) {
          console.error('Error checking stretching achievement:', error);
        }
      }
    }
  }, [stretchingProgress, achievements, checkAchievementUnlock]);

  return {
    checkStretchingAchievements,
    stretchingAchievements: achievements.filter(a => a.category === 'stretching')
  };
}
