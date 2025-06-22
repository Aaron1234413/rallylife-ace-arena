
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useFeedEngagement } from '@/hooks/useFeedEngagement';

interface FeedPost {
  id: string;
  type: 'level_up' | 'match_result' | 'achievement' | 'activity' | 'social_play' | 'training' | 'lesson';
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
              post.activity_type === 'lesson' ? 'lesson' : 'activity',
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
            notes: post.metadata?.notes
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
    // TODO: Implement challenge functionality
    toast({
      title: 'Challenge Feature',
      description: 'Challenge functionality coming soon!',
    });
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
    refreshFeed
  };
}
