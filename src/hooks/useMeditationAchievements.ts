
import { useCallback } from 'react';
import { usePlayerAchievements } from '@/hooks/usePlayerAchievements';
import { useMeditationProgress, useMeditationSessions } from '@/hooks/useMeditation';

export function useMeditationAchievements() {
  const { checkAchievementUnlock, achievements, refreshData } = usePlayerAchievements();
  const { data: meditationProgress } = useMeditationProgress();

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

      try {
        const result = await checkAchievementUnlock(achievement.id);
        console.log('Achievement check result for', achievement.name, ':', result);
        
        if (result.unlocked) {
          console.log('🏆 Achievement unlocked:', achievement.name);
        }
      } catch (error) {
        console.error('Error checking meditation achievement:', achievement.name, error);
        // Continue with other achievements even if one fails
      }
    }

    // Force refresh achievement data after checking all achievements
    try {
      await refreshData();
      console.log('Achievement data refreshed after meditation achievements check');
    } catch (error) {
      console.error('Error refreshing achievement data:', error);
    }
  }, [meditationProgress, achievements, checkAchievementUnlock, refreshData]);

  return {
    checkMeditationAchievements,
    meditationAchievements: achievements.filter(a => a.category === 'meditation')
  };
}
