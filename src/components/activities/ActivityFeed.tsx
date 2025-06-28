
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  Clock, 
  MapPin, 
  Trophy,
  Heart,
  Star,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { useActivityLogs } from '@/hooks/useActivityLogs';

interface ActivityFeedProps {
  limit?: number;
  showFilters?: boolean;
  className?: string;
}

export function ActivityFeed({ limit = 10, showFilters = true, className }: ActivityFeedProps) {
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const { activities, loading, refreshData } = useActivityLogs();

  // Filter and limit activities
  const filteredActivities = (activities || [])
    .filter(activity => typeFilter === 'all' || activity.activity_type === typeFilter)
    .slice(0, limit);

  if (loading) {
    return (
      <Card className={`bg-white/95 backdrop-blur-sm border-white/20 shadow-xl ${className}`}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-tennis-green-bg/20 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-white/95 backdrop-blur-sm border-white/20 shadow-xl ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
            <Activity className="h-5 w-5" />
            Activity Feed
          </CardTitle>
          
          {showFilters && (
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32 border-tennis-green-bg/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="match">Matches</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="lesson">Lessons</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={loading}
                className="border-tennis-green-bg/30 text-tennis-green-dark hover:bg-tennis-green-light/20"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-tennis-green-bg/20 rounded-full mb-4">
              <Activity className="h-6 w-6 text-tennis-green-medium" />
            </div>
            <h3 className="text-lg font-medium mb-2 text-tennis-green-dark">No Activities</h3>
            <p className="text-tennis-green-dark/70">
              {typeFilter === 'all' 
                ? 'No activities logged yet. Start playing to see your feed!'
                : `No ${typeFilter} activities found.`
              }
            </p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-4 pr-4">
              {filteredActivities.map((activity) => (
                <div key={activity.id} className="bg-white/80 backdrop-blur-sm border border-tennis-green-bg/30 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-tennis-green-dark">{activity.title}</h4>
                      <Badge variant="outline" className="text-xs capitalize border-tennis-green-bg/50 text-tennis-green-medium">
                        {activity.activity_type}
                      </Badge>
                    </div>
                    {activity.intensity_level && (
                      <Badge 
                        variant="secondary"
                        className={`text-xs ${
                          activity.intensity_level === 'high' ? 'bg-red-100 text-red-700 border-red-200' :
                          activity.intensity_level === 'medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                          'bg-green-100 text-green-700 border-green-200'
                        }`}
                      >
                        {activity.intensity_level}
                      </Badge>
                    )}
                  </div>
                  
                  {activity.description && (
                    <p className="text-sm text-tennis-green-dark/70 mb-3">
                      {activity.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-4 text-xs text-tennis-green-dark/60 mb-3">
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
