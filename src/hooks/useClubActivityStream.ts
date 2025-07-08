import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ClubActivity {
  id: string;
  club_id: string;
  user_id: string;
  activity_type: 'member_joined' | 'session_created' | 'session_joined' | 'looking_to_play' | 'court_booked' | 'achievement_unlocked' | 'match_completed' | 'coaching_session';
  activity_data: any;
  is_public: boolean;
  created_at: string;
  user?: {
    full_name: string;
    avatar_url?: string;
  };
}

export function useClubActivityStream(clubId: string) {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ClubActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch recent activities
  const fetchActivities = async () => {
    if (!user || !clubId) return;

    try {
      const { data, error } = await supabase
        .from('club_activity_stream')
        .select(`
          *,
          user:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('club_id', clubId)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setActivities((data as any) || []);
    } catch (error) {
      console.error('Error fetching club activities:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add activity to stream
  const addActivity = async (
    activityType: ClubActivity['activity_type'],
    activityData: any = {},
    isPublic: boolean = true
  ) => {
    if (!user || !clubId) return;

    try {
      const { error } = await supabase
        .from('club_activity_stream')
        .insert({
          club_id: clubId,
          user_id: user.id,
          activity_type: activityType,
          activity_data: activityData,
          is_public: isPublic
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  };

  // Format activity message
  const formatActivityMessage = (activity: ClubActivity) => {
    const userName = activity.user?.full_name || 'Someone';
    
    switch (activity.activity_type) {
      case 'member_joined':
        return `${userName} joined the club`;
      case 'session_created':
        return `${userName} created a new session: ${activity.activity_data.title || 'Untitled'}`;
      case 'session_joined':
        return `${userName} joined a session`;
      case 'looking_to_play':
        return `${userName} is looking to play${activity.activity_data.message ? `: ${activity.activity_data.message}` : ''}`;
      case 'court_booked':
        return `${userName} booked a court`;
      case 'achievement_unlocked':
        return `${userName} unlocked an achievement: ${activity.activity_data.achievement_name || 'Unknown'}`;
      case 'match_completed':
        return `${userName} completed a match`;
      case 'coaching_session':
        return `${userName} had a coaching session`;
      default:
        return `${userName} did something`;
    }
  };

  // Get activity icon
  const getActivityIcon = (activityType: ClubActivity['activity_type']) => {
    switch (activityType) {
      case 'member_joined': return '👋';
      case 'session_created': return '🎾';
      case 'session_joined': return '🤝';
      case 'looking_to_play': return '🔍';
      case 'court_booked': return '📅';
      case 'achievement_unlocked': return '🏆';
      case 'match_completed': return '🥇';
      case 'coaching_session': return '🎓';
      default: return '📢';
    }
  };

  // Load initial data and set up real-time subscriptions
  useEffect(() => {
    if (!user || !clubId) return;

    fetchActivities();

    // Set up real-time subscription for activity stream
    const channel = supabase
      .channel(`club_activity_${clubId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'club_activity_stream',
          filter: `club_id=eq.${clubId}`
        },
        () => {
          fetchActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, clubId]);

  return {
    activities,
    loading,
    addActivity,
    formatActivityMessage,
    getActivityIcon,
    refreshActivities: fetchActivities
  };
}