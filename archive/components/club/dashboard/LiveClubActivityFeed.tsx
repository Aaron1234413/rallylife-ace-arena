import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  RefreshCw, 
  ChevronRight
} from 'lucide-react';
import { useClubActivityStream } from '@/hooks/useClubActivityStream';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatDistanceToNow } from 'date-fns';

interface LiveClubActivityFeedProps {
  clubId: string;
}

export function LiveClubActivityFeed({ clubId }: LiveClubActivityFeedProps) {
  const { 
    activities, 
    loading, 
    formatActivityMessage, 
    getActivityIcon,
    refreshActivities
  } = useClubActivityStream(clubId);

  // Show only last 5 activities for mobile dashboard
  const recentActivities = activities.slice(0, 5);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
            <Activity className="h-5 w-5 text-tennis-green-primary" />
            Live Club Activity
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshActivities}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {recentActivities.length > 0 ? (
          <>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-tennis-green-bg/20 transition-colors">
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={activity.user?.avatar_url} />
                      <AvatarFallback className="bg-tennis-green-primary text-white text-xs">
                        {activity.user?.full_name?.substring(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center text-xs border border-tennis-green-bg">
                      {getActivityIcon(activity.activity_type)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-tennis-green-dark">
                      {formatActivityMessage(activity)}
                    </p>
                    <p className="text-xs text-tennis-green-medium">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* View All Activities */}
            {activities.length > 5 && (
              <Button variant="outline" className="w-full justify-between">
                <span>View All Activity</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </>
        ) : (
          <div className="text-center py-6">
            <Activity className="h-12 w-12 mx-auto mb-3 text-tennis-green-medium/50" />
            <p className="text-sm text-tennis-green-medium">
              No recent activity
            </p>
            <p className="text-xs text-tennis-green-medium/70">
              Be the first to create some action!
            </p>
          </div>
        )}

        {/* Live indicator */}
        <div className="flex items-center justify-center pt-2 border-t border-tennis-green-bg/30">
          <div className="flex items-center gap-2 text-xs text-tennis-green-medium">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Live updates</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}