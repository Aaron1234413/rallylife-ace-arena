
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FeedComment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
}

export function useFeedEngagement() {
  const { user } = useAuth();
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});

  const toggleLike = async (activityId: string) => {
    if (!user) {
      toast.error('Please log in to like posts');
      return false;
    }

    setLoadingActions(prev => ({ ...prev, [`like-${activityId}`]: true }));

    try {
      const { data, error } = await supabase.rpc('toggle_feed_like', {
        activity_id_param: activityId,
        user_id_param: user.id
      });

      if (error) {
        console.error('Error toggling like:', error);
        toast.error('Failed to update like');
        return false;
      }

      return data; // Returns true if liked, false if unliked
    } catch (error) {
      console.error('Error in toggleLike:', error);
      toast.error('An error occurred');
      return false;
    } finally {
      setLoadingActions(prev => ({ ...prev, [`like-${activityId}`]: false }));
    }
  };

  const addComment = async (activityId: string, content: string) => {
    if (!user) {
      toast.error('Please log in to comment');
      return null;
    }

    if (!content.trim()) {
      toast.error('Comment cannot be empty');
      return null;
    }

    setLoadingActions(prev => ({ ...prev, [`comment-${activityId}`]: true }));

    try {
      const { data, error } = await supabase.rpc('add_feed_comment', {
        activity_id_param: activityId,
        user_id_param: user.id,
        content_param: content.trim()
      });

      if (error) {
        console.error('Error adding comment:', error);
        toast.error('Failed to add comment');
        return null;
      }

      toast.success('Comment added!');
      return data; // Returns comment ID
    } catch (error) {
      console.error('Error in addComment:', error);
      toast.error('An error occurred');
      return null;
    } finally {
      setLoadingActions(prev => ({ ...prev, [`comment-${activityId}`]: false }));
    }
  };

  const getComments = async (activityId: string, limit = 10, offset = 0): Promise<FeedComment[]> => {
    try {
      const { data, error } = await supabase.rpc('get_feed_comments', {
        activity_id_param: activityId,
        limit_count: limit,
        offset_count: offset
      });

      if (error) {
        console.error('Error fetching comments:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getComments:', error);
      return [];
    }
  };

  return {
    toggleLike,
    addComment,
    getComments,
    loadingActions
  };
}
