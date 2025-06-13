
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface HPActivity {
  id: string;
  activity_type: string;
  hp_change: number;
  hp_before: number;
  hp_after: number;
  description: string;
  created_at: string;
}

interface HPActivityLogProps {
  activities: HPActivity[];
  loading?: boolean;
  className?: string;
}

export function HPActivityLog({ activities, loading, className }: HPActivityLogProps) {
  const getActivityIcon = (activityType: string, hpChange: number) => {
    if (hpChange > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (hpChange < 0) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const getActivityTypeLabel = (activityType: string) => {
    const labels: Record<string, string> = {
      match: 'Match',
      training: 'Training',
      lesson: 'Lesson',
      health_pack: 'Health Pack',
      decay: 'Decay',
      bonus: 'Bonus'
    };
    return labels[activityType] || activityType;
  };

  const getActivityTypeColor = (activityType: string) => {
    const colors: Record<string, string> = {
      match: 'bg-blue-100 text-blue-800',
      training: 'bg-green-100 text-green-800',
      lesson: 'bg-purple-100 text-purple-800',
      health_pack: 'bg-red-100 text-red-800',
      decay: 'bg-gray-100 text-gray-800',
      bonus: 'bg-yellow-100 text-yellow-800'
    };
    return colors[activityType] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>HP Activity Log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>HP Activity Log</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No HP activity recorded yet.
          </p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getActivityIcon(activity.activity_type, activity.hp_change)}
                  
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="secondary" 
                        className={getActivityTypeColor(activity.activity_type)}
                      >
                        {getActivityTypeLabel(activity.activity_type)}
                      </Badge>
                      <span className={`font-semibold ${
                        activity.hp_change > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {activity.hp_change > 0 ? '+' : ''}{activity.hp_change} HP
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-muted-foreground">
                    {activity.hp_before} → {activity.hp_after}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(activity.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
