import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

export interface RecentActivityItem {
  id: string;
  type: 'match' | 'training' | 'xp' | 'hp' | 'challenge' | 'general';
  title: string;
  description: string;
  timestamp: string;
  iconType: 'Trophy' | 'Target' | 'Star' | 'Heart' | 'Clock' | 'Activity';
  color: string;
  createdAt: Date;
}

export function useRecentActivity(limit: number = 10) {
  const { user } = useAuth();
  const [activities, setActivities] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecentActivity = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const recentActivities: RecentActivityItem[] = [];

      // Fetch activity logs
      const { data: activityLogs } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('player_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (activityLogs) {
        activityLogs.forEach(log => {
          recentActivities.push({
            id: `activity-${log.id}`,
            type: log.activity_type === 'match' ? 'match' : 'training',
            title: log.title,
            description: log.description || `${log.activity_type} - ${log.duration_minutes ? `${log.duration_minutes} minutes` : 'Completed'}`,
            timestamp: formatDistanceToNow(new Date(log.created_at), { addSuffix: true }),
            iconType: log.activity_type === 'match' ? 'Trophy' : 'Target',
            color: log.activity_type === 'match' ? 'text-green-600' : 'text-blue-600',
            createdAt: new Date(log.created_at)
          });
        });
      }

      // Fetch XP activities
      const { data: xpActivities } = await supabase
        .from('xp_activities')
        .select('*')
        .eq('player_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (xpActivities) {
        xpActivities.forEach(xp => {
          recentActivities.push({
            id: `xp-${xp.id}`,
            type: 'xp',
            title: `Earned ${xp.xp_earned} XP`,
            description: xp.description || `From ${xp.activity_type}`,
            timestamp: formatDistanceToNow(new Date(xp.created_at), { addSuffix: true }),
            iconType: 'Star',
            color: 'text-yellow-600',
            createdAt: new Date(xp.created_at)
          });
        });
      }

      // Fetch HP activities
      const { data: hpActivities } = await supabase
        .from('hp_activities')
        .select('*')
        .eq('player_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (hpActivities) {
        hpActivities.forEach(hp => {
          const isPositive = hp.hp_change > 0;
          recentActivities.push({
            id: `hp-${hp.id}`,
            type: 'hp',
            title: `${isPositive ? 'Gained' : 'Lost'} ${Math.abs(hp.hp_change)} HP`,
            description: hp.description || `From ${hp.activity_type}`,
            timestamp: formatDistanceToNow(new Date(hp.created_at), { addSuffix: true }),
            iconType: 'Heart',
            color: isPositive ? 'text-red-400' : 'text-red-600',
            createdAt: new Date(hp.created_at)
          });
        });
      }

      // Fetch recent challenges
      const { data: challenges } = await supabase
        .from('challenges')
        .select('*')
        .or(`challenger_id.eq.${user.id},challenged_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(2);

      if (challenges) {
        challenges.forEach(challenge => {
          const isChallenger = challenge.challenger_id === user.id;
          recentActivities.push({
            id: `challenge-${challenge.id}`,
            type: 'challenge',
            title: isChallenger ? 'Challenge sent' : 'Challenge received',
            description: `${challenge.challenge_type} - ${challenge.status}`,
            timestamp: formatDistanceToNow(new Date(challenge.created_at), { addSuffix: true }),
            iconType: 'Clock',
            color: challenge.status === 'completed' ? 'text-green-600' : 'text-orange-600',
            createdAt: new Date(challenge.created_at)
          });
        });
      }

      // Sort all activities by creation date and limit
      const sortedActivities = recentActivities
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, limit);

      setActivities(sortedActivities);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentActivity();
  }, [user, limit]);

  return {
    activities,
    loading,
    refreshActivity: fetchRecentActivity
  };
}