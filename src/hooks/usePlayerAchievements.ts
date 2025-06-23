
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  tier: string;
  icon_url: string | null;
  requirement_type: string;
  requirement_value: number;
  requirement_data: any;
  reward_xp: number;
  reward_tokens: number;
  reward_premium_tokens: number;
  reward_avatar_item_id: string | null;
  is_hidden: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PlayerAchievement {
  id: string;
  player_id: string;
  achievement_id: string;
  unlocked_at: string;
  progress_value: number;
  is_claimed: boolean;
  claimed_at: string | null;
  achievement?: Achievement;
}

interface AchievementProgress {
  id: string;
  player_id: string;
  achievement_id: string;
  current_progress: number;
  last_updated: string;
  achievement?: Achievement;
}

interface AchievementCheckResult {
  success: boolean;
  unlocked?: boolean;
  current_progress?: number;
  required_progress?: number;
  achievement_name?: string;
  achievement_tier?: string;
  error?: string;
}

interface ClaimRewardResult {
  success: boolean;
  achievement_name?: string;
  xp_earned?: number;
  tokens_earned?: number;
  premium_tokens_earned?: number;
  avatar_item_unlocked?: boolean;
  error?: string;
}

export function usePlayerAchievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [playerAchievements, setPlayerAchievements] = useState<PlayerAchievement[]>([]);
  const [achievementProgress, setAchievementProgress] = useState<AchievementProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<any>(null);
  const subscriptionStatusRef = useRef<string>('unsubscribed');

  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .order('tier', { ascending: true })
        .order('category', { ascending: true });

      if (error) {
        console.error('Error fetching achievements:', error);
        return;
      }

      setAchievements(data || []);
    } catch (error) {
      console.error('Error in fetchAchievements:', error);
    }
  };

  const fetchPlayerAchievements = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('player_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('player_id', user.id)
        .order('unlocked_at', { ascending: false });

      if (error) {
        console.error('Error fetching player achievements:', error);
        return;
      }

      setPlayerAchievements(data || []);
    } catch (error) {
      console.error('Error in fetchPlayerAchievements:', error);
    }
  };

  const fetchAchievementProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('achievement_progress')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('player_id', user.id)
        .order('last_updated', { ascending: false });

      if (error) {
        console.error('Error fetching achievement progress:', error);
        return;
      }

      setAchievementProgress(data || []);
    } catch (error) {
      console.error('Error in fetchAchievementProgress:', error);
    }
  };

  const checkAchievementUnlock = async (achievementId: string): Promise<AchievementCheckResult> => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      // First get meditation progress for meditation achievements
      const achievement = achievements.find(a => a.id === achievementId);
      if (achievement?.category === 'meditation') {
        const { data: meditationProgress } = await supabase
          .from('meditation_progress')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (meditationProgress) {
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
          }

          // Update progress first
          await supabase
            .from('achievement_progress')
            .upsert({
              player_id: user.id,
              achievement_id: achievementId,
              current_progress: currentValue,
              last_updated: new Date().toISOString()
            });

          // Check if should unlock
          if (currentValue >= achievement.requirement_value) {
            // Check if already unlocked
            const { data: existing } = await supabase
              .from('player_achievements')
              .select('id')
              .eq('player_id', user.id)
              .eq('achievement_id', achievementId)
              .single();

            if (!existing) {
              // Unlock the achievement
              await supabase
                .from('player_achievements')
                .insert({
                  player_id: user.id,
                  achievement_id: achievementId,
                  progress_value: currentValue
                });

              toast.success(`🏆 Achievement Unlocked: ${achievement.name}!`);
              
              // Refresh data
              await fetchPlayerAchievements();
              await fetchAchievementProgress();

              return {
                success: true,
                unlocked: true,
                current_progress: currentValue,
                required_progress: achievement.requirement_value,
                achievement_name: achievement.name,
                achievement_tier: achievement.tier
              };
            }
          }

          return {
            success: true,
            unlocked: false,
            current_progress: currentValue,
            required_progress: achievement.requirement_value,
            achievement_name: achievement.name,
            achievement_tier: achievement.tier
          };
        }
      }

      // Fallback to original RPC function for other achievements
      const { data, error } = await supabase
        .rpc('check_achievement_unlock', {
          user_id: user.id,
          achievement_id: achievementId
        });

      if (error) {
        console.error('Error checking achievement unlock:', error);
        return { success: false, error: error.message };
      }

      const result = data as unknown as AchievementCheckResult;
      
      if (result.unlocked) {
        toast.success(`🏆 Achievement Unlocked: ${result.achievement_name}!`);
        // Refresh data
        await fetchPlayerAchievements();
        await fetchAchievementProgress();
      }

      return result;
    } catch (error) {
      console.error('Error in checkAchievementUnlock:', error);
      return { success: false, error: 'An error occurred while checking achievement' };
    }
  };

  const checkAllAchievements = async () => {
    if (!user || achievements.length === 0) return;

    // Check all achievements that the player hasn't unlocked yet
    const unlockedIds = new Set(playerAchievements.map(pa => pa.achievement_id));
    const achievementsToCheck = achievements.filter(a => !unlockedIds.has(a.id));

    for (const achievement of achievementsToCheck) {
      await checkAchievementUnlock(achievement.id);
    }
  };

  const claimAchievementReward = async (achievementId: string): Promise<ClaimRewardResult> => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .rpc('claim_achievement_reward', {
          user_id: user.id,
          achievement_id: achievementId
        });

      if (error) {
        console.error('Error claiming achievement reward:', error);
        return { success: false, error: error.message };
      }

      const result = data as unknown as ClaimRewardResult;
      
      if (result.success) {
        let rewardMessage = `🎉 Claimed rewards for "${result.achievement_name}"!`;
        const rewards = [];
        
        if (result.xp_earned && result.xp_earned > 0) {
          rewards.push(`+${result.xp_earned} XP`);
        }
        if (result.tokens_earned && result.tokens_earned > 0) {
          rewards.push(`+${result.tokens_earned} Tokens`);
        }
        if (result.premium_tokens_earned && result.premium_tokens_earned > 0) {
          rewards.push(`+${result.premium_tokens_earned} Rally Points`);
        }
        if (result.avatar_item_unlocked) {
          rewards.push('Avatar Item');
        }
        
        if (rewards.length > 0) {
          rewardMessage += ` (${rewards.join(', ')})`;
        }
        
        toast.success(rewardMessage);
        
        // Refresh data
        await fetchPlayerAchievements();
      }

      return result;
    } catch (error) {
      console.error('Error in claimAchievementReward:', error);
      return { success: false, error: 'An error occurred while claiming reward' };
    }
  };

  useEffect(() => {
    const cleanupChannel = () => {
      if (channelRef.current && subscriptionStatusRef.current !== 'unsubscribed') {
        channelRef.current.unsubscribe();
        subscriptionStatusRef.current = 'unsubscribed';
        channelRef.current = null;
      }
    };

    const loadData = async () => {
      setLoading(true);
      await fetchAchievements();
      if (user) {
        await fetchPlayerAchievements();
        await fetchAchievementProgress();
      }
      setLoading(false);
    };

    loadData();

    // Set up real-time subscription for achievement changes
    if (user) {
      // Clean up any existing channel
      cleanupChannel();

      const channelName = `achievement-changes-${user.id}-${Date.now()}-${Math.random()}`;
      const channel = supabase.channel(channelName);
      
      channel
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'player_achievements',
            filter: `player_id=eq.${user.id}`
          },
          () => {
            fetchPlayerAchievements();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'achievement_progress',
            filter: `player_id=eq.${user.id}`
          },
          () => {
            fetchAchievementProgress();
          }
        );

      // Only subscribe if not already subscribed
      if (subscriptionStatusRef.current === 'unsubscribed') {
        subscriptionStatusRef.current = 'subscribing';
        channel.subscribe((status) => {
          subscriptionStatusRef.current = status;
          console.log('Achievement Channel subscription status:', status);
        });
        channelRef.current = channel;
      }

      return () => {
        cleanupChannel();
      };
    } else {
      // Clean up when no user
      cleanupChannel();
    }
  }, [user]);

  // Check achievements when user data changes (XP, tokens, etc.)
  useEffect(() => {
    if (user && achievements.length > 0 && playerAchievements.length >= 0) {
      // Small delay to ensure other systems have updated
      const timer = setTimeout(() => {
        checkAllAchievements();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [user, achievements.length]);

  return {
    achievements,
    playerAchievements,
    achievementProgress,
    loading,
    checkAchievementUnlock,
    checkAllAchievements,
    claimAchievementReward,
    refreshData: async () => {
      await fetchAchievements();
      if (user) {
        await fetchPlayerAchievements();
        await fetchAchievementProgress();
      }
    }
  };
}
