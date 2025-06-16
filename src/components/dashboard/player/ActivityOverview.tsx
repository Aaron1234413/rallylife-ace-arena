
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  TrendingUp, 
  Calendar, 
  Clock,
  ChevronRight,
  Zap
} from 'lucide-react';
import { useActivityLogs } from '@/hooks/useActivityLogs';

interface ActivityOverviewProps {
  className?: string;
}

export function ActivityOverview({ className }: ActivityOverviewProps) {
  const { activities, stats, loading, refreshData } = useActivityLogs();

  console.log('ActivityOverview - activities:', activities);
  console.log('ActivityOverview - stats:', stats);
  console.log('ActivityOverview - loading:', loading);

  // Calculate weekly stats from real data
  const weeklyStats = {
    totalActivities: stats?.total_activities || 0,
    totalHours: stats?.total_duration_minutes ? (stats.total_duration_minutes / 60).toFixed(1) : '0',
    averageIntensity: 'Medium', // Could be calculated from activity data
    streak: 0 // Would need to be calculated from consecutive days
  };

  // Get recent activities (limit to 3 for overview)
  const recentActivities = activities?.slice(0, 3) || [];

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Weekly Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            This Week's Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Activity className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-blue-600">{weeklyStats.totalActivities}</div>
              <div className="text-sm text-gray-600">Activities</div>
            </div>
            
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="h-4 w-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-green-600">{weeklyStats.totalHours}h</div>
              <div className="text-sm text-gray-600">Total Time</div>
            </div>
            
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Zap className="h-4 w-4 text-orange-500" />
              </div>
              <div className="text-2xl font-bold text-orange-600">{weeklyStats.averageIntensity}</div>
              <div className="text-sm text-gray-600">Avg Intensity</div>
            </div>
            
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Calendar className="h-4 w-4 text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-purple-600">{weeklyStats.streak}</div>
              <div className="text-sm text-gray-600">Day Streak</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activities
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={refreshData}>
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No recent activities found.</p>
              <p className="text-sm">Start logging your tennis activities to see them here!</p>
              <p className="text-xs mt-2 text-gray-400">
                Total activities in database: {weeklyStats.totalActivities}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={refreshData}
              >
                Refresh Data
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs capitalize">
                        {activity.activity_type}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(activity.created_at).toLocaleString()}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">{activity.title}</h4>
                    {activity.description && (
                      <p className="text-sm text-gray-600">{activity.description}</p>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-xs mb-1">
                      {activity.hp_impact !== 0 && (
                        <span className={activity.hp_impact > 0 ? 'text-green-600' : 'text-red-600'}>
                          {activity.hp_impact > 0 ? '+' : ''}{activity.hp_impact} HP
                        </span>
                      )}
                      {activity.xp_earned > 0 && (
                        <span className="text-yellow-600">+{activity.xp_earned} XP</span>
                      )}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Completed
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
