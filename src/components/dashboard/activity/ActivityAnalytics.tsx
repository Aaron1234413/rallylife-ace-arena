
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3,
  PieChart,
  TrendingUp,
  Clock,
  Activity,
  Target
} from 'lucide-react';

interface ActivityAnalyticsProps {
  activities: any[];
  stats: any;
  timeFilter: string;
  loading: boolean;
}

export function ActivityAnalytics({ 
  activities, 
  stats, 
  timeFilter, 
  loading 
}: ActivityAnalyticsProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats || !activities) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Analytics Data</h3>
          <p className="text-muted-foreground">
            Start logging activities to see your analytics here.
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalActivities = stats.total_activities || 0;
  const totalDuration = stats.total_duration_minutes || 0;
  const totalXP = stats.total_xp_earned || 0;
  const avgEnjoyment = stats.avg_enjoyment_rating || 0;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{totalActivities}</div>
            <div className="text-sm text-muted-foreground">Total Activities</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{Math.round(totalDuration / 60)}h</div>
            <div className="text-sm text-muted-foreground">Total Time</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">{totalXP}</div>
            <div className="text-sm text-muted-foreground">XP Earned</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">{avgEnjoyment.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">Avg Enjoyment</div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Breakdown */}
      {stats.activities_by_type && Object.keys(stats.activities_by_type).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Activity Type Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.activities_by_type).map(([type, count]: [string, any]) => {
                const percentage = totalActivities > 0 ? (count / totalActivities) * 100 : 0;
                return (
                  <div key={type} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Badge variant="secondary" className="capitalize">
                        {type}
                      </Badge>
                      <span className="text-sm font-medium">
                        {count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Stats */}
      {(stats.wins > 0 || stats.losses > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Competitive Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Win Rate</span>
                <span className="font-semibold">
                  {stats.wins + stats.losses > 0 
                    ? ((stats.wins / (stats.wins + stats.losses)) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
              <Progress 
                value={stats.wins + stats.losses > 0 ? (stats.wins / (stats.wins + stats.losses)) * 100 : 0} 
                className="h-3" 
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{stats.wins} wins</span>
                <span>{stats.losses} losses</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
