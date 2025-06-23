
import { useMemo } from 'react';
import { usePlayerAchievements } from '@/hooks/usePlayerAchievements';
import { useMeditationProgress } from '@/hooks/useMeditation';
import { useStretchingProgress } from '@/hooks/useStretching';

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
  reward_premium_tokens: number;
  current_progress: number;
  progress_percentage: number;
}

export function useClosestAchievements() {
  const { achievements, playerAchievements, loading } = usePlayerAchievements();
  const { data: meditationProgress } = useMeditationProgress();
  const { data: stretchingProgress } = useStretchingProgress();

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
      switch (achievement.category) {
        case 'meditation':
          if (meditationProgress) {
            switch (achievement.requirement_type) {
              case 'meditation_sessions':
                currentProgress = meditationProgress.total_sessions;
                break;
              case 'meditation_minutes':
                currentProgress = meditationProgress.total_minutes;
                break;
              case 'meditation_streak':
                currentProgress = meditationProgress.current_streak;
                break;
            }
          }
          break;
        
        case 'stretching':
          if (stretchingProgress) {
            switch (achievement.requirement_type) {
              case 'stretching_sessions':
                currentProgress = stretchingProgress.total_sessions;
                break;
              case 'stretching_minutes':
                currentProgress = stretchingProgress.total_minutes;
                break;
              case 'stretching_streak':
                currentProgress = stretchingProgress.current_streak;
                break;
            }
          }
          break;
        
        // Add more categories as needed (progression, gameplay, etc.)
        default:
          currentProgress = 0;
      }

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
        reward_premium_tokens: achievement.reward_premium_tokens,
        current_progress: currentProgress,
        progress_percentage: progressPercentage,
      };
    });

    // Sort by progress percentage (highest first) and return top 3
    return achievementsWithProgress
      .sort((a, b) => b.progress_percentage - a.progress_percentage)
      .slice(0, 3);
  }, [achievements, playerAchievements, meditationProgress, stretchingProgress, loading]);

  return {
    closestAchievements,
    loading,
  };
}
