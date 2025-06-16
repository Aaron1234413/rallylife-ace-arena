
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Clock, 
  MapPin, 
  Trophy,
  Heart,
  Star,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';

interface ActivityTimelineProps {
  activities: any[];
  timeFilter: string;
  activityFilter: string;
  loading: boolean;
}

export function ActivityTimeline({ 
  activities, 
  timeFilter, 
  activityFilter, 
  loading 
}: ActivityTimelineProps) {
  // Filter activities based on filters
  const filteredActivities = activities.filter(activity => {
    if (activityFilter !== 'all' && activity.activity_type !== activityFilter) {
      return false;
    }
    
    const activityDate = new Date(activity.logged_at || activity.created_at);
    const now = new Date();
    
    switch (timeFilter) {
      case 'today':
        return activityDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return activityDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        return activityDate >= monthAgo;
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Activity Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Activities Found</h3>
            <p className="text-muted-foreground">
              {activityFilter === 'all' 
                ? 'No activities logged yet. Start playing to see your timeline!'
                : `No ${activityFilter} activities found for the selected time period.`
              }
            </p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {filteredActivities.map((activity) => (
                <div key={activity.id} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{activity.title}</h4>
                      <Badge variant="outline" className="text-xs capitalize">
                        {activity.activity_type}
                      </Badge>
                    </div>
                    {activity.intensity_level && (
                      <Badge 
                        variant="secondary"
                        className={`text-xs ${
                          activity.intensity_level === 'high' ? 'bg-red-100 text-red-700' :
                          activity.intensity_level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}
                      >
                        {activity.intensity_level}
                      </Badge>
                    )}
                  </div>
                  
                  {activity.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {activity.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{format(new Date(activity.logged_at || activity.created_at), 'MMM d, HH:mm')}</span>
                    </div>
                    
                    {activity.duration_minutes && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{activity.duration_minutes} min</span>
                      </div>
                    )}
                    
                    {activity.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{activity.location}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {activity.hp_impact !== undefined && activity.hp_impact !== 0 && (
                      <div className={`flex items-center gap-1 text-xs ${
                        activity.hp_impact > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <Heart className="h-3 w-3" />
                        <span>{activity.hp_impact > 0 ? '+' : ''}{activity.hp_impact} HP</span>
                      </div>
                    )}
                    
                    {activity.xp_earned > 0 && (
                      <div className="flex items-center gap-1 text-xs text-yellow-600">
                        <Star className="h-3 w-3" />
                        <span>+{activity.xp_earned} XP</span>
                      </div>
                    )}
                    
                    {activity.is_competitive && (
                      <div className="flex items-center gap-1 text-xs text-purple-600">
                        <Trophy className="h-3 w-3" />
                        <span>Competitive</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
