import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ClubActivity {
  id: string;
  club_id: string;
  user_id: string;
  activity_type: string;
  activity_data: any;
  created_at: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export function useRealTimeClubActivity(clubId: string) {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ClubActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    if (!user || !clubId) return;

    try {
      const { data, error } = await supabase
        .from('club_activity_feed')
        .select('*')
        .eq('club_id', clubId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      if (!data?.length) {
        setActivities([]);
        return;
      }

      // Get user profiles for the activities
      const userIds = data.map(activity => activity.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      const formattedActivities: ClubActivity[] = data.map(activity => ({
        id: activity.id,
        club_id: activity.club_id,
        user_id: activity.user_id,
        activity_type: activity.activity_type,
        activity_data: activity.activity_data,
        created_at: activity.created_at,
        user: profiles?.find(p => p.id === activity.user_id) ? {
          id: activity.user_id,
          full_name: profiles.find(p => p.id === activity.user_id)?.full_name || 'Unknown User',
          avatar_url: profiles.find(p => p.id === activity.user_id)?.avatar_url
        } : undefined
      }));

      setActivities(formattedActivities);
    } catch (error) {
      console.error('Error fetching club activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !clubId) return;

    fetchActivities();

    // Set up realtime subscription for activity feed changes
    const channel = supabase
      .channel('club-activity-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'club_activity_feed',
          filter: `club_id=eq.${clubId}`
        },
        (payload) => {
          console.log('New club activity:', payload);
          fetchActivities(); // Refetch to get the latest activities
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, clubId]);

  const logActivity = async (
    activityType: string,
    activityData: any
  ): Promise<void> => {
    if (!user || !clubId) return;

    try {
      const { error } = await supabase
        .from('club_activity_feed')
        .insert({
          club_id: clubId,
          user_id: user.id,
          activity_type: activityType,
          activity_data: activityData
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging club activity:', error);
      throw error;
    }
  };

  const getActivitiesByType = (type: string) => {
    return activities.filter(activity => activity.activity_type === type);
  };

  const getRecentActivities = (hours: number = 24) => {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - hours);
    
    return activities.filter(activity => 
      new Date(activity.created_at) > cutoff
    );
  };

  const getActivitySummary = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayActivities = activities.filter(activity => 
      new Date(activity.created_at) >= today
    );

    const summary = {
      total: todayActivities.length,
      new_members: todayActivities.filter(a => a.activity_type === 'member_joined').length,
      bookings: todayActivities.filter(a => a.activity_type === 'court_booked').length,
      lessons: todayActivities.filter(a => a.activity_type === 'lesson_booked').length,
      events: todayActivities.filter(a => a.activity_type === 'event_created').length
    };

    return summary;
  };

  // Common activity logging functions
  const logMemberJoined = async (memberName?: string) => {
    const userName = memberName || user?.user_metadata?.full_name || user?.email || 'New Member';
    return logActivity('member_joined', { member_name: userName });
  };

  const logCourtBooked = (courtName: string, bookingTime: string) => 
    logActivity('court_booked', { court_name: courtName, booking_time: bookingTime });

  const logLessonBooked = (coachName: string, lessonTime: string) => 
    logActivity('lesson_booked', { coach_name: coachName, lesson_time: lessonTime });

  const logEventCreated = (eventName: string, eventDate: string) => 
    logActivity('event_created', { event_name: eventName, event_date: eventDate });

  const logMemberAchievement = (achievementName: string, points: number) => 
    logActivity('member_achievement', { achievement_name: achievementName, points });

  return {
    activities,
    loading,
    logActivity,
    getActivitiesByType,
    getRecentActivities,
    getActivitySummary,
    logMemberJoined,
    logCourtBooked,
    logLessonBooked,
    logEventCreated,
    logMemberAchievement,
    refetch: fetchActivities
  };
}