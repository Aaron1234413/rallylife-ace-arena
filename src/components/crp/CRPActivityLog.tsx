
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { useCoachCRP } from '@/hooks/useCoachCRP';
import { formatDistanceToNow } from 'date-fns';

interface CRPActivityLogProps {
  coachId?: string;
  maxItems?: number;
}

export function CRPActivityLog({ coachId, maxItems = 5 }: CRPActivityLogProps) {
  const { crpActivities, activitiesLoading } = useCoachCRP(coachId);

  if (activitiesLoading) {
    return (
      <Card className="border-tennis-green-light">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const activities = crpActivities?.slice(0, maxItems) || [];

  return (
    <Card className="border-tennis-green-light">
      <CardHeader className="bg-tennis-green-light text-white p-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5" />
          CRP Activity
        </CardTitle>
        <CardDescription className="text-tennis-green-bg text-sm">
          Recent reputation changes
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {activities.length === 0 ? (
          <p className="text-tennis-green-medium text-sm">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg border border-gray-100">
                <div className={`p-1 rounded-full ${
                  activity.crp_change > 0 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {activity.crp_change > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={activity.crp_change > 0 ? 'default' : 'destructive'}>
                      {activity.crp_change > 0 ? '+' : ''}{activity.crp_change} CRP
                    </Badge>
                    <span className="text-xs text-tennis-green-medium capitalize">
                      {activity.activity_type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-tennis-green-dark mb-1">
                    {activity.description}
                  </p>
                  {activity.source_player && (
                    <p className="text-xs text-tennis-green-medium">
                      From: {activity.source_player.full_name || 'Anonymous Player'}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
