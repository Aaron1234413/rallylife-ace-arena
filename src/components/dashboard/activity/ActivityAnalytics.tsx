
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Activity,
  Heart,
  Star,
  Calendar,
  Award
} from 'lucide-react';

interface ActivityAnalyticsProps {
  activities: any[];
  stats: any;
  timeFilter: 'today' | 'week' | 'month' | 'all';
  loading: boolean;
}

export function ActivityAnalytics({ activities, stats, timeFilter, loading }: ActivityAnalyticsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const weeklyGoal = {
    target: 5,
    current: activities.length,
    description: 'Activities this week'
  };

  const timeLabels = {
    today: "Today's",
    week: "This Week's",
    month: "This Month's",
    all: "All Time"
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">{timeLabels[timeFilter]} Activities</p>
                <p className="text-2xl font-bold text-blue-600">{stats?.total_activities || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Total Time</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats?.total_duration_minutes ? Math.round(stats.total_duration_minutes / 60) : 0}h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Heart className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium">HP Impact</p>
                <p className={`text-2xl font-bold ${stats?.total_hp_impact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats?.total_hp_impact > 0 ? '+' : ''}{stats?.total_hp_impact || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium">XP Earned</p>
                <p className="text-2xl font-bold text-yellow-600">{stats?.total_xp_earned || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals and Progress */}
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Weekly Goal Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">{weeklyGoal.description}</span>
                  <span className="text-sm text-muted-foreground">
                    {weeklyGoal.current}/{weeklyGoal.target}
                  </span>
                </div>
                <Progress 
                  value={(weeklyGoal.current / weeklyGoal.target) * 100} 
                  className="h-2"
                />
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground">
                  {weeklyGoal.current >= weeklyGoal.target ? 'Goal completed! 🎉' : 
                   `${weeklyGoal.target - weeklyGoal.current} more to reach goal`}
                </span>
                {weeklyGoal.current >= weeklyGoal.target && (
                  <Badge className="bg-green-100 text-green-700">
                    <Award className="h-3 w-3 mr-1" />
                    Complete
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Activity Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.activities_by_type && Object.entries(stats.activities_by_type).map(([type, count]: [string, any]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{type}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(count / (stats.total_activities || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium min-w-8">{count}</span>
                  </div>
                </div>
              ))}
              
              {(!stats?.activities_by_type || Object.keys(stats.activities_by_type).length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No activity data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Average Enjoyment</p>
              <p className="text-lg font-bold">
                {stats?.avg_enjoyment_rating ? `${stats.avg_enjoyment_rating.toFixed(1)}/5` : 'N/A'}
              </p>
            </div>
            
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Competitive Activities</p>
              <p className="text-lg font-bold">{stats?.competitive_activities || 0}</p>
            </div>
            
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Wins</p>
              <p className="text-lg font-bold text-green-600">{stats?.wins || 0}</p>
            </div>
            
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Losses</p>
              <p className="text-lg font-bold text-red-600">{stats?.losses || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
