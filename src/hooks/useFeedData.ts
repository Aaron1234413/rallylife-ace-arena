
import { useState, useEffect, useMemo } from 'react';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { usePlayerAchievements } from '@/hooks/usePlayerAchievements';
import { useProfiles } from '@/hooks/useProfiles';
import { useAuth } from '@/hooks/useAuth';

interface FeedPost {
  id: string;
  type: 'level_up' | 'match_result' | 'achievement' | 'activity';
  user: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  timestamp: string;
  content: any;
  likes: number;
  comments: number;
}

export function useFeedData() {
  const { user } = useAuth();
  const { activities } = useActivityLogs();
  const { playerAchievements } = usePlayerAchievements();
  const { data: profiles } = useProfiles();
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Transform activities and achievements into feed posts
  const generateFeedPosts = useMemo(() => {
    const posts: FeedPost[] = [];
    
    if (activities && profiles && user) {
      // Get current user profile
      const currentUserProfile = profiles.find(p => p.id === user.id) || {
        id: user.id,
        full_name: user.email?.split('@')[0] || 'Unknown Player',
        avatar_url: undefined
      };

      // Add activity posts - only from real logged activities
      activities.forEach(activity => {
        // Only add posts for activities with significant XP or match results
        if (activity.xp_earned > 0 && activity.xp_earned >= 100) {
          posts.push({
            id: `levelup-${activity.id}`,
            type: 'level_up',
            user: {
              id: currentUserProfile.id,
              full_name: currentUserProfile.full_name || 'Unknown Player',
              avatar_url: currentUserProfile.avatar_url || undefined,
            },
            timestamp: activity.logged_at || activity.created_at,
            content: {
              level: Math.floor(activity.xp_earned / 100) + 1,
            },
            likes: 0,
            comments: 0,
          });
        }

        // Add match results for competitive activities
        if (activity.activity_type === 'match' && activity.is_competitive) {
          posts.push({
            id: `match-${activity.id}`,
            type: 'match_result',
            user: {
              id: currentUserProfile.id,
              full_name: currentUserProfile.full_name || 'Unknown Player',
              avatar_url: currentUserProfile.avatar_url || undefined,
            },
            timestamp: activity.logged_at || activity.created_at,
            content: {
              activity: activity.title,
              xp_earned: activity.xp_earned,
            },
            likes: 0,
            comments: 0,
          });
        }
      });
    }

    // Add achievement posts - only from real unlocked achievements
    if (playerAchievements && profiles && user) {
      const currentUserProfile = profiles.find(p => p.id === user.id) || {
        id: user.id,
        full_name: user.email?.split('@')[0] || 'Unknown Player',
        avatar_url: undefined
      };

      playerAchievements.slice(0, 10).forEach(achievement => {
        if (!achievement.achievement) return;

        posts.push({
          id: `achievement-${achievement.id}`,
          type: 'achievement',
          user: {
            id: currentUserProfile.id,
            full_name: currentUserProfile.full_name || 'Unknown Player',
            avatar_url: currentUserProfile.avatar_url || undefined,
          },
          timestamp: achievement.unlocked_at,
          content: {
            name: achievement.achievement.name,
            description: achievement.achievement.description,
            tier: achievement.achievement.tier,
          },
          likes: 0,
          comments: 0,
        });
      });
    }

    // Sort by timestamp (most recent first)
    return posts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [activities, playerAchievements, profiles, user]);

  useEffect(() => {
    setFeedPosts(generateFeedPosts);
    setLoading(false);
  }, [generateFeedPosts]);

  const handleLike = async (postId: string) => {
    // Update local state optimistically
    setFeedPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 }
        : post
    ));
  };

  const handleComment = async (postId: string) => {
    // Navigate to comment interface or open comment modal
    console.log('Comment on post:', postId);
  };

  const handleChallenge = async (userId: string) => {
    // Navigate to challenge interface or open challenge modal
    console.log('Challenge user:', userId);
  };

  return {
    feedPosts,
    loading,
    handleLike,
    handleComment,
    handleChallenge,
  };
}
