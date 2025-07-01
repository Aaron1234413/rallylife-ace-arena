
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Activity, 
  MessageSquare, 
  Calendar, 
  Award, 
  Users, 
  TrendingUp,
  Clock,
  Coins,
  Target
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useCoachRecentActivity } from '@/hooks/useCoachRecentActivity';

interface RecentActivityProps {
  cxpActivities: any[];
  transactions: any[];
  cxpLoading: boolean;
  tokensLoading: boolean;
}

export function RecentActivity({ 
  cxpActivities, 
  transactions, 
  cxpLoading, 
  tokensLoading 
}: RecentActivityProps) {
  const { data: activities, isLoading: activitiesLoading } = useCoachRecentActivity();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'cxp': return Award;
      case 'token': return Coins;
      case 'crp': return Target;
      case 'assignment': return Calendar;
      case 'appointment': return MessageSquare;
      case 'challenge': return TrendingUp;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'cxp': return 'text-blue-600';
      case 'token': return 'text-green-600';
      case 'crp': return 'text-orange-600';
      case 'assignment': return 'text-purple-600';
      case 'appointment': return 'text-indigo-600';
      case 'challenge': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  if (cxpLoading || tokensLoading || activitiesLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg border animate-pulse">
                <div className="h-8 w-8 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
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
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Your latest coaching activities and updates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {activities && activities.length > 0 ? (
              activities.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <Icon className={`h-4 w-4 ${getActivityColor(activity.type)}`} />
                      </div>
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {activity.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {activity.description}
                            {activity.player_name && ` • ${activity.player_name}`}
                          </p>
                        </div>
                        {activity.reward_amount && (
                          <Badge 
                            variant="outline" 
                            className="text-xs flex-shrink-0"
                          >
                            {activity.reward_amount > 0 ? '+' : ''}{activity.reward_amount}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Recent Activity</h3>
                <p className="text-muted-foreground">
                  Your coaching activities will appear here as you work with players.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
