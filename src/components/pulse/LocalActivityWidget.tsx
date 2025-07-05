import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface LocalActivity {
  id: string;
  title: string;
  location: string;
  timeAgo: string;
  activityType: string;
  playerName: string;
}

export function LocalActivityWidget() {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ['profile-location', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('location')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const { data: localActivities, isLoading } = useQuery({
    queryKey: ['local-activities', profile?.location],
    queryFn: async (): Promise<LocalActivity[]> => {
      if (!profile?.location) return [];

      // Get recent activities from users in the same location area
      const locationSearch = profile.location.split(',')[0].trim();
      
      const { data: activities, error } = await supabase
        .from('activity_logs')
        .select(`
          id,
          title,
          activity_type,
          location,
          logged_at,
          player_id,
          profiles!inner(full_name, location)
        `)
        .ilike('profiles.location', `%${locationSearch}%`)
        .neq('player_id', user?.id || '')
        .order('logged_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      return activities?.map(activity => ({
        id: activity.id,
        title: activity.title,
        location: activity.location || 'Unknown location',
        timeAgo: getTimeAgo(activity.logged_at),
        activityType: activity.activity_type,
        playerName: (activity.profiles as any)?.full_name || 'Unknown player'
      })) || [];
    },
    enabled: !!profile?.location,
    refetchInterval: 60000 // Refresh every minute
  });

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'match': return 'bg-red-100 text-red-700 border-red-200';
      case 'training': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'social': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (!profile?.location) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm border-tennis-green-light shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
            <TrendingUp className="h-5 w-5" />
            Local Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <MapPin className="h-12 w-12 mx-auto text-tennis-green-medium mb-3" />
            <p className="text-tennis-green-dark/70 text-sm">
              Add your location to see local tennis activity!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm border-tennis-green-light shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
            <TrendingUp className="h-5 w-5" />
            Local Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg p-3">
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-tennis-green-light shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
          <TrendingUp className="h-5 w-5" />
          Local Activity
          <Badge variant="secondary" className="ml-auto bg-tennis-green-bg/20 text-tennis-green-dark border-tennis-green-bg">
            Live
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!localActivities || localActivities.length === 0 ? (
          <div className="text-center py-6">
            <Clock className="h-8 w-8 mx-auto text-tennis-green-medium mb-2" />
            <p className="text-tennis-green-dark/70 text-sm">
              No recent activity in your area. Be the first to log something!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {localActivities.map((activity) => (
              <div key={activity.id} className="border rounded-lg p-3 hover:bg-tennis-green-bg/10 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-tennis-green-dark text-sm truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-tennis-green-medium truncate">
                      by {activity.playerName}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <Badge 
                      className={`text-xs ${getActivityTypeColor(activity.activityType)}`}
                      variant="outline"
                    >
                      {activity.activityType}
                    </Badge>
                    <span className="text-xs text-tennis-green-medium">
                      {activity.timeAgo}
                    </span>
                  </div>
                </div>
                {activity.location && (
                  <div className="flex items-center gap-1 mt-2">
                    <MapPin className="h-3 w-3 text-tennis-green-medium" />
                    <span className="text-xs text-tennis-green-medium truncate">
                      {activity.location}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}