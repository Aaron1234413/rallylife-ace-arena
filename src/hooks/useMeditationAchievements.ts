
import { useCallback } from 'react';
import { usePlayerAchievements } from '@/hooks/usePlayerAchievements';
import { useMeditationProgress, useMeditationSessions } from '@/hooks/useMeditation';

export function useMeditationAchievements() {
  const { checkAchievementUnlock, achievements } = usePlayerAchievements();
  const { data: meditationProgress } = useMeditationProgress();
  const { data: meditationSessions } = useMeditationSessions();

  const checkMeditationAchievements = useCallback(async () => {
    if (!meditationProgress || !achievements.length) return;

    // Get meditation-specific achievements
    const meditationAchievements = achievements.filter(a => a.category === 'meditation');

    for (const achievement of meditationAchievements) {
      let currentValue = 0;

      switch (achievement.requirement_type) {
        case 'meditation_sessions':
          currentValue = meditationProgress.total_sessions;
          break;
        case 'meditation_minutes':
          currentValue = meditationProgress.total_minutes;
          break;
        case 'meditation_streak':
          currentValue = meditationProgress.current_streak;
          break;
        default:
          continue;
      }

      // Check if achievement should be unlocked
      if (currentValue >= achievement.requirement_value) {
        try {
          await checkAchievementUnlock(achievement.id);
        } catch (error) {
          console.error('Error checking meditation achievement:', error);
        }
      }
    }
  }, [meditationProgress, achievements, checkAchievementUnlock]);

  return {
    checkMeditationAchievements,
    meditationAchievements: achievements.filter(a => a.category === 'meditation')
  };
}
