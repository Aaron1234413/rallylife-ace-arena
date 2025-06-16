
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Heart, 
  Star, 
  Coins,
  Clock,
  MapPin,
  Users,
  Trophy,
  Dumbbell,
  Activity
} from 'lucide-react';
import { format, isToday, isThisWeek, isThisMonth } from 'date-fns';

interface ActivityTimelineProps {
  activities: any[];
  feedPosts: any[];
  timeFilter: 'today' | 'week' | 'month' | 'all';
  activityFilter: string;
  loading: boolean;
}

const activityIcons = {
  match: Trophy,
  training: Dumbbell,
  lesson: Users,
  social: Heart,
  tournament: Trophy,
  practice: Trophy,
  default: Activity
};

export function ActivityTimeline({ 
  activities, 
  feedPosts, 
  timeFilter, 
  activityFilter, 
  loading 
}: ActivityTimelineProps) {
  // Filter activities based on time and type
  const filteredActivities = activities.filter(activity => {
    const activityDate = new Date(activity.logged_at);
    
    // Time filter
    let passesTimeFilter = true;
    switch (timeFilter) {
      case 'today':
        passesTimeFilter = isToday(activityDate);
        break;
      case 'week':
        passesTimeFilter = isThisWeek(activityDate);
        break;
      case 'month':
        passesTimeFilter = isThisMonth(activityDate);
        break;
      case 'all':
        passesTimeFilter = true;
        break;
    }
    
    // Activity type filter
    const passesActivityFilter = activityFilter === 'all' || activity.activity_type === activityFilter;
    
    return passesTimeFilter && passesActivityFilter;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (filteredActivities.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Activities Found</h3>
          <p className="text-muted-foreground">
            No activities match your current filters. Try adjusting the time period or activity type.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <ScrollArea className="h-96 sm:h-[500px]">
          <div className="p-4 space-y-4">
            {filteredActivities.map((activity, index) => {
              const Icon = activityIcons[activity.activity_type as keyof typeof activityIcons] || activityIcons.default;
              const isRecent = index < 3;
              
              return (
                <div 
                  key={activity.id} 
                  className={`relative pl-8 pb-4 ${index !== filteredActivities.length - 1 ? 'border-l-2 border-muted' : ''}`}
                >
                  {/* Timeline dot */}
                  <div className={`absolute left-0 top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isRecent ? 'bg-primary border-primary' : 'bg-muted border-muted-foreground'
                  }`}>
                    <Icon className={`h-3 w-3 ${isRecent ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                  </div>
                  
                  {/* Activity card */}
                  <Card className={`ml-4 ${isRecent ? 'ring-2 ring-primary/20' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h4 className="font-semibold text-sm sm:text-base truncate">{activity.title}</h4>
                            <Badge variant="outline" className="text-xs capitalize">
                              {activity.activity_type}
                            </Badge>
                            {activity.is_competitive && (
                              <Badge className="bg-red-100 text-red-800 text-xs">
                                Competitive
                              </Badge>
                            )}
                          </div>
                          
                          {activity.description && (
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {activity.description}
                            </p>
                          )}
                          
                          {/* Activity details */}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{format(new Date(activity.logged_at), 'MMM d, HH:mm')}</span>
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
                                <span className="truncate max-w-24">{activity.location}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Impact visualization */}
                          <div className="flex flex-wrap gap-2">
                            {activity.hp_impact !== 0 && (
                              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                activity.hp_impact > 0 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                <Heart className="h-3 w-3" />
                                <span>{activity.hp_impact > 0 ? '+' : ''}{activity.hp_impact} HP</span>
                              </div>
                            )}
                            
                            {activity.xp_earned > 0 && (
                              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
                                <Star className="h-3 w-3" />
                                <span>+{activity.xp_earned} XP</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Intensity badge */}
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
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
