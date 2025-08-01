import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Trophy, Target, Star, Heart, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const iconComponents = {
  Trophy,
  Target,
  Star,
  Heart,
  Clock,
  Activity
};

interface RecentActivityItem {
  id: string;
  title: string;
  description?: string;
  activity_type: string;
  logged_at: string;
  xp_earned?: number;
  hp_impact?: number;
  duration_minutes?: number;
  score?: string;
  opponent_name?: string;
  location?: string;
}

interface RecentActivityProps {
  activities: RecentActivityItem[];
  loading?: boolean;
}

export function RecentActivity({ activities, loading = false }: RecentActivityProps) {
  // Transform activities to match expected format
  const formattedActivities = activities.map(activity => ({
    id: activity.id,
    title: activity.title,
    description: activity.description || `${activity.activity_type} activity`,
    timestamp: formatDistanceToNow(new Date(activity.logged_at), { addSuffix: true }),
    iconType: getIconType(activity.activity_type),
    color: getColor(activity.activity_type)
  }));

  function getIconType(activityType: string): keyof typeof iconComponents {
    switch (activityType) {
      case 'match': return 'Trophy';
      case 'training': return 'Target';
      case 'achievement': return 'Star';
      case 'health': return 'Heart';
      default: return 'Activity';
    }
  }

  function getColor(activityType: string): string {
    switch (activityType) {
      case 'match': return 'text-yellow-400';
      case 'training': return 'text-blue-400';
      case 'achievement': return 'text-purple-400';
      case 'health': return 'text-red-400';
      default: return 'text-green-400';
    }
  }

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-700/20 to-transparent"></div>
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-2 text-white">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 relative z-10">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-white/10 rounded-lg animate-pulse">
                <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/20 rounded w-3/4"></div>
                  <div className="h-3 bg-white/15 rounded w-1/2"></div>
                  <div className="h-3 bg-white/10 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : formattedActivities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-white/40 mx-auto mb-3" />
            <p className="text-white/70 text-sm">No recent activity</p>
            <p className="text-white/50 text-xs mt-1">Start playing to see your activity here!</p>
          </div>
        ) : (
          formattedActivities.map((activity) => {
            const IconComponent = iconComponents[activity.iconType];
            return (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-white/10 rounded-lg hover:bg-white/15 transition-colors duration-200">
                <div className={`p-2 rounded-full bg-white/10 ${activity.color}`}>
                  <IconComponent className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm">{activity.title}</p>
                  <p className="text-xs text-white/70">{activity.description}</p>
                  <p className="text-xs text-white/50 mt-1">{activity.timestamp}</p>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}