
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
  is_claimed: boolean;
  claimed_at: string | null;
  progress_value: number;
}

interface AchievementProgress {
  id: string;
  player_id: string;
  achievement_id: string;
  current_progress: number;
  last_updated: string;
}

export function usePlayerAchievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [playerAchievements, setPlayerAchievements] = useState<PlayerAchievement[]>([]);
  const [achievementProgress, setAchievementProgress] = useState<AchievementProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  const fetchData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Fetch all achievements
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .order('tier', { ascending: true });

      if (achievementsError) throw achievementsError;

      // Fetch player achievements
      const { data: playerAchievementsData, error: playerAchievementsError } = await supabase
        .from('player_achievements')
        .select('*')
        .eq('player_id', user.id);

      if (playerAchievementsError) throw playerAchievementsError;

      // Fetch achievement progress
      const { data: progressData, error: progressError } = await supabase
        .from('achievement_progress')
        .select('*')
        .eq('player_id', user.id);

      if (progressError) throw progressError;

      setAchievements(achievementsData || []);
      setPlayerAchievements(playerAchievementsData || []);
      setAchievementProgress(progressData || []);
    } catch (error) {
      console.error('Error fetching achievement data:', error);
      toast.error('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await fetchData();
  };

  const checkAchievementUnlock = async (achievementId: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      console.log('Checking achievement unlock for:', achievementId);
      
      const { data, error } = await supabase.rpc('check_achievement_unlock', {
        user_id: user.id,
        achievement_id: achievementId
      });

      if (error) {
        console.error('Error in check_achievement_unlock:', error);
        throw error;
      }

      console.log('Achievement check result:', data);
      
      if (data?.unlocked) {
        toast.success(`🏆 Achievement unlocked: ${data.achievement_name}!`);
        // Refresh data after unlocking
        await refreshData();
      }

      return data;
    } catch (error) {
      console.error('Error checking achievement unlock:', error);
      throw error;
    }
  };

  const checkAllAchievements = async () => {
    if (!user?.id || !achievements.length) {
      console.log('No user or achievements available for checking');
      return;
    }

    console.log('Checking all achievements for user:', user.id);
    
    for (const achievement of achievements) {
      try {
        await checkAchievementUnlock(achievement.id);
      } catch (error) {
        console.error('Error checking achievement:', achievement.name, error);
        // Continue with other achievements even if one fails
      }
    }
  };

  useEffect(() => {
    if (user?.id && !hasFetched.current) {
      hasFetched.current = true;
      fetchData();
    }
  }, [user?.id]);

  return {
    achievements,
    playerAchievements,
    achievementProgress,
    loading,
    checkAchievementUnlock,
    checkAllAchievements,
    refreshData,
  };
}
