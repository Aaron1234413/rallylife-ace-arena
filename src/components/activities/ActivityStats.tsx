
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3,
  TrendingUp,
  Clock,
  Activity,
  Trophy
} from 'lucide-react';
import { useActivityLogs } from '@/hooks/useActivityLogs';

interface ActivityStatsProps {
  className?: string;
}

export function ActivityStats({ className }: ActivityStatsProps) {
  const { stats, loading } = useActivityLogs();

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Statistics Available</h3>
          <p className="text-muted-foreground">
            Start logging activities to see your statistics here.
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
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Last 30 Days Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Activity className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{totalActivities}</div>
            <div className="text-sm text-muted-foreground">Total Activities</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold">{(totalDuration / 60).toFixed(1)}h</div>
            <div className="text-sm text-muted-foreground">Total Time</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold">{totalXP}</div>
            <div className="text-sm text-muted-foreground">XP Earned</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-2xl font-bold">{avgEnjoyment > 0 ? avgEnjoyment.toFixed(1) : 'N/A'}</div>
            <div className="text-sm text-muted-foreground">Avg Enjoyment</div>
          </div>
        </div>

        {/* Activity Breakdown */}
        {stats.activities_by_type && Object.keys(stats.activities_by_type).length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Activity Breakdown</h4>
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
          </div>
        )}

        {/* HP Impact Summary */}
        {stats.total_hp_impact !== undefined && (
          <div>
            <h4 className="font-medium mb-2">Total HP Impact</h4>
            <div className={`text-lg font-bold ${
              stats.total_hp_impact > 0 ? 'text-green-600' : 
              stats.total_hp_impact < 0 ? 'text-red-600' : 
              'text-gray-600'
            }`}>
              {stats.total_hp_impact > 0 ? '+' : ''}{stats.total_hp_impact} HP
            </div>
          </div>
        )}

        {/* Competitive Performance */}
        {(stats.wins > 0 || stats.losses > 0) && (
          <div>
            <h4 className="font-medium mb-3">Competitive Performance</h4>
            <div className="space-y-2">
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
