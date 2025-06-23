
import { useCallback } from 'react';
import { usePlayerAchievements } from '@/hooks/usePlayerAchievements';
import { useMeditationProgress, useMeditationSessions } from '@/hooks/useMeditation';

export function useMeditationAchievements() {
  const { checkAchievementUnlock, achievements } = usePlayerAchievements();
  const { data: meditationProgress } = useMeditationProgress();
  const { data: meditationSessions } = useMeditationSessions();

  const checkMeditationAchievements = useCallback(async () => {
    if (!meditationProgress || !achievements.length) {
      console.log('No meditation progress or achievements available for checking');
      return;
    }

    // Get meditation-specific achievements
    const meditationAchievements = achievements.filter(a => a.category === 'meditation');
    console.log('Found meditation achievements:', meditationAchievements.length);

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
          console.log('Unknown requirement type for meditation achievement:', achievement.requirement_type);
          continue;
      }

      console.log(`Checking achievement "${achievement.name}": ${currentValue}/${achievement.requirement_value}`);

      // Check if achievement should be unlocked
      if (currentValue >= achievement.requirement_value) {
        try {
          const result = await checkAchievementUnlock(achievement.id);
          console.log('Achievement check result:', result);
        } catch (error) {
          console.error('Error checking meditation achievement:', achievement.name, error);
          // Continue with other achievements even if one fails
        }
      }
    }
  }, [meditationProgress, achievements, checkAchievementUnlock]);

  return {
    checkMeditationAchievements,
    meditationAchievements: achievements.filter(a => a.category === 'meditation')
  };
}
