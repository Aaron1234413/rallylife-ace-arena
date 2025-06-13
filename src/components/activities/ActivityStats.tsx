
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Clock, 
  Trophy, 
  Target, 
  Star,
  TrendingUp,
  BarChart3
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Activity Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Loading statistics...</p>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Activity Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">No activity data available</p>
        </CardContent>
      </Card>
    );
  }

  const winRate = stats.wins + stats.losses > 0 ? (stats.wins / (stats.wins + stats.losses)) * 100 : 0;
  const avgDurationHours = stats.total_duration_minutes / 60;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Last 30 Days Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-blue-600" />
              <span className="text-2xl font-bold">{stats.total_activities}</span>
            </div>
            <p className="text-sm text-muted-foreground">Total Activities</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="text-2xl font-bold">{avgDurationHours.toFixed(1)}h</span>
            </div>
            <p className="text-sm text-muted-foreground">Total Time</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-yellow-600" />
              <span className="text-2xl font-bold">{stats.total_xp_earned}</span>
            </div>
            <p className="text-sm text-muted-foreground">XP Earned</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Star className="h-4 w-4 text-purple-600" />
              <span className="text-2xl font-bold">{stats.avg_enjoyment_rating || 0}</span>
            </div>
            <p className="text-sm text-muted-foreground">Avg Enjoyment</p>
          </div>
        </div>

        {/* Win/Loss Stats */}
        {(stats.wins > 0 || stats.losses > 0) && (
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Competitive Record
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Win Rate</span>
                <span className="font-semibold">{winRate.toFixed(1)}%</span>
              </div>
              <Progress value={winRate} className="h-2" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{stats.wins} wins</span>
                <span>{stats.losses} losses</span>
              </div>
            </div>
          </div>
        )}

        {/* Activity Breakdown */}
        {stats.activities_by_type && Object.keys(stats.activities_by_type).length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Target className="h-4 w-4" />
              Activity Breakdown
            </h4>
            <div className="space-y-2">
              {Object.entries(stats.activities_by_type).map(([type, count]) => {
                const percentage = (count / stats.total_activities) * 100;
                return (
                  <div key={type} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <Badge variant="secondary" className="capitalize">
                        {type}
                      </Badge>
                      <span className="text-sm font-medium">{count} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <Progress value={percentage} className="h-1" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* HP Impact */}
        <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
          <span className="font-medium">Total HP Impact</span>
          <Badge 
            variant="secondary" 
            className={stats.total_hp_impact >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
          >
            {stats.total_hp_impact > 0 ? '+' : ''}{stats.total_hp_impact} HP
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
