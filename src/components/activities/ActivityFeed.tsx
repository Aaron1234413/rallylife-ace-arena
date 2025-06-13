
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Trophy, 
  Dumbbell, 
  Users, 
  Heart, 
  Clock, 
  MapPin, 
  Target,
  Star,
  Trash2,
  Calendar,
  Activity
} from 'lucide-react';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { format } from 'date-fns';

interface ActivityFeedProps {
  limit?: number;
  showFilters?: boolean;
  className?: string;
}

const activityIcons = {
  match: Trophy,
  training: Dumbbell,
  lesson: Users,
  social: Heart,
  tournament: Trophy,
  practice: Target,
  default: Activity
};

const activityColors = {
  match: 'bg-blue-100 text-blue-800 border-blue-300',
  training: 'bg-green-100 text-green-800 border-green-300',
  lesson: 'bg-purple-100 text-purple-800 border-purple-300',
  social: 'bg-pink-100 text-pink-800 border-pink-300',
  tournament: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  practice: 'bg-orange-100 text-orange-800 border-orange-300'
};

const intensityColors = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  extreme: 'bg-red-100 text-red-700'
};

export function ActivityFeed({ limit = 10, showFilters = true, className }: ActivityFeedProps) {
  const { activities, loading, deleteActivity, fetchActivities } = useActivityLogs();
  const [filter, setFilter] = useState<string>('all');

  const filteredActivities = activities
    .filter(activity => filter === 'all' || activity.activity_type === filter)
    .slice(0, limit);

  const handleDeleteActivity = async (activityId: string) => {
    if (confirm('Are you sure you want to delete this activity?')) {
      await deleteActivity(activityId);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Loading activities...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Activity Feed
        </CardTitle>
        {showFilters && (
          <div className="flex gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                <SelectItem value="match">Matches</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="lesson">Lessons</SelectItem>
                <SelectItem value="tournament">Tournaments</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="practice">Practice</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {filter === 'all' ? 'No activities logged yet.' : `No ${filter} activities found.`}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Start logging your tennis activities to see them here!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActivities.map((activity) => {
                const Icon = activityIcons[activity.activity_type as keyof typeof activityIcons] || activityIcons.default;
                const colorClass = activityColors[activity.activity_type as keyof typeof activityColors] || 'bg-gray-100 text-gray-800 border-gray-300';
                const intensityColor = intensityColors[activity.intensity_level as keyof typeof intensityColors] || 'bg-gray-100 text-gray-700';

                return (
                  <div key={activity.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-full ${colorClass}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{activity.title}</h4>
                            <Badge variant="secondary" className={intensityColor}>
                              {activity.intensity_level}
                            </Badge>
                            {activity.is_competitive && (
                              <Badge className="bg-red-100 text-red-800">
                                Competitive
                              </Badge>
                            )}
                          </div>
                          
                          {activity.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {activity.description}
                            </p>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(activity.logged_at), 'MMM d, yyyy')}
                            </div>
                            
                            {activity.duration_minutes && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {activity.duration_minutes} min
                              </div>
                            )}
                            
                            {activity.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {activity.location}
                              </div>
                            )}
                            
                            {activity.opponent_name && (
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                vs {activity.opponent_name}
                              </div>
                            )}
                            
                            {activity.coach_name && (
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                Coach: {activity.coach_name}
                              </div>
                            )}
                          </div>
                          
                          {(activity.score || activity.result) && (
                            <div className="mt-2 flex gap-2">
                              {activity.score && (
                                <Badge variant="outline">
                                  Score: {activity.score}
                                </Badge>
                              )}
                              {activity.result && (
                                <Badge 
                                  variant="outline"
                                  className={
                                    activity.result === 'win' ? 'bg-green-100 text-green-800' :
                                    activity.result === 'loss' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }
                                >
                                  {activity.result.charAt(0).toUpperCase() + activity.result.slice(1)}
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          {activity.enjoyment_rating && (
                            <div className="mt-2 flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm">
                                {activity.enjoyment_rating}/5 enjoyment
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex gap-2">
                          {activity.hp_impact !== 0 && (
                            <Badge 
                              variant="secondary" 
                              className={activity.hp_impact > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                            >
                              {activity.hp_impact > 0 ? '+' : ''}{activity.hp_impact} HP
                            </Badge>
                          )}
                          {activity.xp_earned > 0 && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              +{activity.xp_earned} XP
                            </Badge>
                          )}
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteActivity(activity.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
