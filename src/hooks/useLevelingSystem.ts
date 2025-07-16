import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LevelUpResult {
  xp_earned: number;
  total_xp: number;
  current_level: number;
  level_up: boolean;
  levels_gained: number;
  xp_to_next_level: number;
  badges_earned: string[];
}

export function useLevelingSystem() {
  const [isAwarding, setIsAwarding] = useState(false);
  const { toast } = useToast();

  const awardXP = useCallback(async (
    xpAmount: number, 
    activityType: string, 
    description?: string
  ): Promise<LevelUpResult | null> => {
    if (isAwarding) return null;
    
    setIsAwarding(true);

    try {
      const { data, error } = await supabase.rpc('add_xp', {
        user_id: (await supabase.auth.getUser()).data.user?.id,
        xp_amount: xpAmount,
        activity_type: activityType,
        description: description
      });

      if (error) {
        console.error('Error awarding XP:', error);
        toast({
          title: 'Error',
          description: 'Failed to award XP. Please try again.',
          variant: 'destructive',
        });
        return null;
      }

      const result = data as unknown as LevelUpResult;

      if (!result || typeof result !== 'object') {
        throw new Error('Invalid response from XP function');
      }

      // Show XP gained notification
      toast({
        title: 'XP Gained! 🏆',
        description: `+${result.xp_earned} XP from ${activityType}`,
        duration: 3000,
      });

      // Show level up notification if applicable
      if (result.level_up) {
        toast({
          title: `Level Up! 🎉`,
          description: `Congratulations! You reached level ${result.current_level}!`,
          duration: 5000,
        });
      }

      // Show badge notifications
      if (result.badges_earned && result.badges_earned.length > 0) {
        for (const badge of result.badges_earned) {
          toast({
            title: 'Badge Earned! 🏅',
            description: `You unlocked the ${badge.replace('_', ' ')} badge!`,
            duration: 4000,
          });
        }
      }

      return result;
    } catch (error) {
      console.error('Unexpected error awarding XP:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong while awarding XP.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsAwarding(false);
    }
  }, [isAwarding, toast]);

  const calculateXPForLevel = useCallback((level: number): number => {
    if (level <= 1) return 0;
    return Math.floor(50 * Math.pow(level, 1.5) + 50 * (level - 1));
  }, []);

  const calculateLevelFromXP = useCallback((totalXP: number): number => {
    let level = 1;
    while (level <= 100) {
      const requiredXP = calculateXPForLevel(level + 1);
      if (totalXP < requiredXP) break;
      level++;
    }
    return level;
  }, [calculateXPForLevel]);

  const getXPProgress = useCallback((currentXP: number, level: number) => {
    const currentLevelXP = calculateXPForLevel(level);
    const nextLevelXP = calculateXPForLevel(level + 1);
    const xpInLevel = currentXP - currentLevelXP;
    const xpRequiredForLevel = nextLevelXP - currentLevelXP;
    const progressPercentage = (xpInLevel / xpRequiredForLevel) * 100;

    return {
      currentLevelXP,
      nextLevelXP,
      xpInLevel,
      xpRequiredForLevel,
      xpToNextLevel: nextLevelXP - currentXP,
      progressPercentage: Math.min(progressPercentage, 100),
    };
  }, [calculateXPForLevel]);

  // Pre-defined XP rewards for common activities
  const XP_REWARDS = {
    MATCH_WIN: 100,
    MATCH_LOSS: 50,
    TRAINING_SESSION: 75,
    DAILY_LOGIN: 10,
    PROFILE_COMPLETE: 25,
    FIRST_MATCH: 150,
    TOURNAMENT_PARTICIPATION: 200,
    SKILL_IMPROVEMENT: 50,
    COACHING_SESSION: 100,
    CHALLENGE_COMPLETE: 80,
  } as const;

  return {
    awardXP,
    calculateXPForLevel,
    calculateLevelFromXP,
    getXPProgress,
    isAwarding,
    XP_REWARDS,
  };
}