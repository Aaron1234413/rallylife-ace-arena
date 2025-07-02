
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useFeedEngagement } from '@/hooks/useFeedEngagement';

interface FeedPost {
  id: string;
  type: 'level_up' | 'match_result' | 'achievement' | 'activity' | 'social_play' | 'training' | 'lesson' | 'challenge_sent' | 'challenge_accepted' | 'challenge_completed';
  user: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  timestamp: string;
  content: {
    title: string;
    description?: string;
    stats: {
      xp?: number;
      hp?: number;
      score?: string;
      duration?: number;
      opponent_name?: string;
      location?: string;
      // Social play specific stats
      session_type?: 'singles' | 'doubles';
      competitive_level?: 'low' | 'medium' | 'high';
      participant_count?: number;
      participant_names?: string[];
      mood?: string;
      notes?: string;
      // Challenge specific stats
      stakes_tokens?: number;
      stakes_premium_tokens?: number;
      challenge_type?: 'match' | 'social_play';
      winner_name?: string;
      challenger_name?: string;
      challenged_name?: string;
    };
  };
  likes: number;
  comments: number;
  userHasLiked: boolean;
}

export function useFeedData() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { toggleLike, addComment } = useFeedEngagement();
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const loadingRef = useRef(false);

  const loadFeedData = useCallback(async () => {
    if (!user?.id || loadingRef.current) return;

    try {
      loadingRef.current = true;
      setLoading(true);
      
      const { data, error } = await supabase.rpc('get_feed_posts_with_engagement', {
        user_id_param: user.id,
        limit_count: 50,
        offset_count: 0
      });

      if (error) {
        console.error('Error loading feed data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load feed data',
          variant: 'destructive',
        });
        return;
      }

      const transformedPosts: FeedPost[] = data.map((post: any) => ({
        id: post.id,
        type: post.activity_type === 'social_play' ? 'social_play' : 
              post.activity_type === 'level_up' ? 'level_up' :
              post.activity_type === 'match' ? 'match_result' :
              post.activity_type === 'achievement' ? 'achievement' : 
              post.activity_type === 'training' ? 'training' :
              post.activity_type === 'lesson' ? 'lesson' :
              post.activity_type === 'challenge_sent' ? 'challenge_sent' :
              post.activity_type === 'challenge_accepted' ? 'challenge_accepted' :
              post.activity_type === 'challenge_completed' ? 'challenge_completed' : 'activity',
        user: {
          id: post.player_id,
          full_name: post.player_name,
          avatar_url: post.player_avatar
        },
        timestamp: post.logged_at,
        content: {
          title: post.title,
          description: post.description,
          stats: {
            xp: post.xp_earned,
            hp: post.hp_impact,
            score: post.score,
            duration: post.duration_minutes,
            opponent_name: post.opponent_name,
            location: post.location,
            // Social play specific stats from metadata
            session_type: post.metadata?.session_type,
            competitive_level: post.metadata?.competitive_level,
            participant_count: post.metadata?.participant_count,
            participant_names: post.metadata?.participant_names,
            mood: post.metadata?.mood,
            notes: post.metadata?.notes,
            // Challenge specific stats
            stakes_tokens: post.metadata?.stakes_tokens,
            stakes_premium_tokens: post.metadata?.stakes_premium_tokens,
            challenge_type: post.metadata?.challenge_type,
            winner_name: post.metadata?.winner_name,
            challenger_name: post.metadata?.challenger_name,
            challenged_name: post.metadata?.challenged_name
          }
        },
        likes: parseInt(post.likes_count) || 0,
        comments: parseInt(post.comments_count) || 0,
        userHasLiked: post.user_has_liked || false
      }));

      setFeedPosts(transformedPosts);
    } catch (error) {
      console.error('Failed to load feed data:', error);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [user?.id, toast]);

  useEffect(() => {
    if (user?.id) {
      loadFeedData();
    }
  }, [loadFeedData]);

  const handleLike = async (postId: string) => {
    const wasLiked = await toggleLike(postId);
    
    // Optimistically update the UI
    setFeedPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likes: wasLiked ? post.likes + 1 : post.likes - 1,
            userHasLiked: wasLiked
          };
        }
        return post;
      })
    );
  };

  const handleComment = async (postId: string, content: string): Promise<string | null> => {
    const commentId = await addComment(postId, content);
    
    if (commentId) {
      // Optimistically update the comments count
      setFeedPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comments: post.comments + 1
            };
          }
          return post;
        })
      );
    }
    
    return commentId;
  };

  const handleChallenge = (userId: string) => {
    // TODO: Implement challenge functionality - this could open the challenge dialog
    toast({
      title: 'Challenge Feature',
      description: 'Use the Challenge buttons in the dashboard to create challenges!',
    });
  };

  // Helper function to create challenge feed posts
  const createChallengeFeedPost = async (challengeData: {
    type: 'challenge_sent' | 'challenge_accepted' | 'challenge_completed';
    challengerName: string;
    challengedName: string;
    challengeType: 'match' | 'social_play';
    stakesTokens?: number;
    stakesPremiumTokens?: number;
    winnerName?: string;
  }) => {
    if (!user?.id) return;

    try {
      const activityData = {
        player_id: user.id,
        activity_category: 'challenge',
        activity_type: challengeData.type,
        title: challengeData.type === 'challenge_sent' ? 'Challenge Sent!' :
               challengeData.type === 'challenge_accepted' ? 'Challenge Accepted!' :
               'Challenge Completed!',
        description: challengeData.type === 'challenge_sent' 
          ? `${challengeData.challengerName} challenged ${challengeData.challengedName} to a ${challengeData.challengeType}!`
          : challengeData.type === 'challenge_accepted'
          ? `${challengeData.challengedName} accepted ${challengeData.challengerName}'s ${challengeData.challengeType} challenge!`
          : `${challengeData.winnerName} won the ${challengeData.challengeType} challenge!`,
        metadata: {
          challenge_type: challengeData.challengeType,
          challenger_name: challengeData.challengerName,
          challenged_name: challengeData.challengedName,
          stakes_tokens: challengeData.stakesTokens || 0,
          stakes_premium_tokens: challengeData.stakesPremiumTokens || 0,
          winner_name: challengeData.winnerName
        }
      };

      const { error } = await supabase
        .from('activity_logs')
        .insert(activityData);

      if (error) {
        console.error('Error creating challenge feed post:', error);
      } else {
        // Refresh feed to show the new post
        refreshFeed();
      }
    } catch (error) {
      console.error('Error in createChallengeFeedPost:', error);
    }
  };

  const refreshFeed = useCallback(() => {
    if (!loadingRef.current) {
      loadFeedData();
    }
  }, [loadFeedData]);

  return {
    feedPosts,
    loading,
    handleLike,
    handleComment,
    handleChallenge,
    refreshFeed,
    createChallengeFeedPost
  };
}
