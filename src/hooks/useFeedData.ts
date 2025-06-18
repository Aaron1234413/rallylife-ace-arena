
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useFeedEngagement } from '@/hooks/useFeedEngagement';

// Updated interface to match backend data
interface FeedPost {
  id: string;
  type: 'match_result' | 'achievement' | 'level_up' | 'activity';
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
    };
  };
  likes: number;
  comments: number;
  userHasLiked: boolean;
}

export function useFeedData() {
  const { user } = useAuth();
  const { toggleLike: toggleLikeAction, addComment: addCommentAction } = useFeedEngagement();
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<any>(null);

  const fetchFeedPosts = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    console.log('Fetching feed posts for user:', user.id);

    try {
      const { data, error } = await supabase.rpc('get_feed_posts_with_engagement', {
        user_id_param: user.id,
        limit_count: 20,
        offset_count: 0
      });

      if (error) {
        console.error('Error fetching feed posts:', error);
        setLoading(false);
        return;
      }

      console.log('Raw feed data:', data);

      // Transform backend data to FeedPost format
      const transformedPosts: FeedPost[] = (data || []).map((item: any) => ({
        id: item.id,
        type: determinePostType(item.activity_type, item.xp_earned, item.hp_impact),
        user: {
          id: item.player_id,
          full_name: item.player_name || 'Unknown Player',
          avatar_url: item.player_avatar
        },
        timestamp: item.logged_at,
        content: {
          title: item.title,
          description: item.description,
          stats: {
            xp: item.xp_earned,
            hp: item.hp_impact,
            score: item.score,
            duration: item.duration_minutes,
            opponent_name: item.opponent_name,
            location: item.location
          }
        },
        likes: parseInt(item.likes_count) || 0,
        comments: parseInt(item.comments_count) || 0,
        userHasLiked: item.user_has_liked || false
      }));

      console.log('Transformed feed posts:', transformedPosts);
      setFeedPosts(transformedPosts);
    } catch (error) {
      console.error('Error in fetchFeedPosts:', error);
    } finally {
      setLoading(false);
    }
  };

  const determinePostType = (activityType: string, xpEarned: number, hpImpact: number): FeedPost['type'] => {
    if (activityType === 'match') return 'match_result';
    if (xpEarned > 0 && hpImpact > 0) return 'level_up';
    return 'activity';
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Initial fetch
    fetchFeedPosts();

    // Clean up existing channel
    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }

    // Set up real-time subscription for likes and comments
    const channel = supabase.channel(`feed-engagement-${user.id}-${Date.now()}`);
    
    // Listen for likes changes
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'feed_likes'
      },
      () => {
        console.log('Feed likes changed, refreshing feed');
        fetchFeedPosts(); // Refetch when likes change
      }
    );

    // Listen for comments changes
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'feed_comments'
      },
      () => {
        console.log('Feed comments changed, refreshing feed');
        fetchFeedPosts(); // Refetch when comments change
      }
    );

    // Listen for new activities
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'activity_logs'
      },
      () => {
        console.log('New activity logged, refreshing feed');
        fetchFeedPosts(); // Refetch when new activities are added
      }
    );

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [user?.id]); // Only depend on user.id to prevent infinite loops

  const handleLike = async (postId: string) => {
    const wasLiked = await toggleLikeAction(postId);
    
    // Optimistically update the UI
    setFeedPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: wasLiked ? post.likes + 1 : post.likes - 1,
          userHasLiked: wasLiked
        };
      }
      return post;
    }));
  };

  const handleComment = async (postId: string, content: string) => {
    const commentId = await addCommentAction(postId, content);
    if (commentId) {
      // The real-time subscription will handle the UI update
      return commentId;
    }
    return null;
  };

  const handleChallenge = (userId: string) => {
    console.log('Challenging user:', userId);
    // Implementation for challenges can be added later
  };

  const refreshFeed = () => {
    setLoading(true);
    fetchFeedPosts();
  };

  return {
    feedPosts,
    loading,
    handleLike,
    handleComment,
    handleChallenge,
    refreshFeed
  };
}
