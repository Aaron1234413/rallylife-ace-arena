
import { useState, useEffect } from 'react';
import { useActivityLogs } from '@/hooks/useActivityLogs';

// Mock data structure for feed posts
interface FeedPost {
  id: string;
  type: 'match_result' | 'achievement' | 'level_up' | 'training';
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  timestamp: Date;
  content: {
    title: string;
    description: string;
    stats?: {
      xp?: number;
      hp?: number;
      score?: string;
      duration?: number;
    };
  };
  likes: number;
  comments: number;
  isLiked: boolean;
}

export function useFeedData() {
  const { activities, loading, refreshData } = useActivityLogs();
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);

  // Transform activities into feed posts
  useEffect(() => {
    if (activities && activities.length > 0) {
      const posts: FeedPost[] = activities.map((activity, index) => ({
        id: activity.id,
        type: activity.activity_type === 'match' ? 'match_result' : 
              activity.activity_type === 'training' ? 'training' : 'achievement',
        user: {
          id: activity.id, // Using activity id as placeholder
          name: 'You', // Placeholder for current user
          avatar: '/placeholder.svg'
        },
        timestamp: new Date(activity.logged_at || activity.created_at),
        content: {
          title: activity.title,
          description: activity.description || '',
          stats: {
            xp: activity.xp_earned,
            hp: activity.hp_impact,
            score: activity.score,
            duration: activity.duration_minutes
          }
        },
        likes: Math.floor(Math.random() * 10), // Mock data
        comments: Math.floor(Math.random() * 5), // Mock data
        isLiked: false
      }));
      
      setFeedPosts(posts);
    }
  }, [activities]);

  // Refresh data when hook is first used (component mounts)
  useEffect(() => {
    refreshData();
  }, []);

  const handleLike = (postId: string) => {
    setFeedPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleComment = (postId: string, comment: string) => {
    console.log('Adding comment to post:', postId, comment);
    // Mock implementation - in real app would call API
  };

  const handleChallenge = (postId: string) => {
    console.log('Challenging user from post:', postId);
    // Mock implementation - in real app would call API
  };

  return {
    feedPosts,
    loading,
    handleLike,
    handleComment,
    handleChallenge,
    refreshFeed: refreshData
  };
}
