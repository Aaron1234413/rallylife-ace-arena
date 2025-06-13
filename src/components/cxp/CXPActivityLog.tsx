
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, TrendingUp, Users, BookOpen, Target } from 'lucide-react';
import { useCoachCXP } from '@/hooks/useCoachCXP';
import { formatDistanceToNow } from 'date-fns';

const activityIcons = {
  coaching_session: Users,
  player_achievement: Target,
  content_creation: BookOpen,
  player_feedback: TrendingUp,
  milestone: Activity,
  manual: Clock
};

const activityColors = {
  coaching_session: 'bg-blue-100 text-blue-800',
  player_achievement: 'bg-green-100 text-green-800',
  content_creation: 'bg-purple-100 text-purple-800',
  player_feedback: 'bg-orange-100 text-orange-800',
  milestone: 'bg-yellow-100 text-yellow-800',
  manual: 'bg-gray-100 text-gray-800'
};

export function CXPActivityLog() {
  const { activities, loading } = useCoachCXP();

  if (loading) {
    return (
      <Card className="border-tennis-green-light">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent CXP Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-tennis-green-medium">Loading activities...</p>
        </CardContent>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card className="border-tennis-green-light">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent CXP Activities
          </CardTitle>
          <CardDescription>
            Your CXP earning activities will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-tennis-green-medium text-center py-8">
            No CXP activities yet. Start coaching to earn experience points!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-tennis-green-light">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent CXP Activities
        </CardTitle>
        <CardDescription>
          Your latest coaching experience point activities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {activities.map((activity) => {
              const ActivityIcon = activityIcons[activity.activity_type as keyof typeof activityIcons] || Activity;
              const colorClass = activityColors[activity.activity_type as keyof typeof activityColors] || 'bg-gray-100 text-gray-800';
              
              return (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100">
                  <div className="flex-shrink-0">
                    <ActivityIcon className="h-4 w-4 text-tennis-green-dark mt-0.5" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-tennis-green-dark truncate">
                        {activity.description || `${activity.activity_type.replace('_', ' ')} activity`}
                      </p>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Badge className={`text-xs px-2 py-1 ${colorClass}`}>
                          +{activity.cxp_earned} CXP
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {activity.activity_type.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-tennis-green-medium">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
