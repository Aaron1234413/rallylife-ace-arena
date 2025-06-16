
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

interface ActivityOverviewProps {
  className?: string;
}

export function ActivityOverview({ className }: ActivityOverviewProps) {
  const recentActivities = [
    {
      id: 1,
      type: 'Match',
      title: 'Singles Match vs Sarah',
      time: '2 hours ago',
      result: 'Won 6-4, 6-2',
      rewards: { hp: 15, xp: 50, tokens: 25 },
      status: 'completed'
    },
    {
      id: 2,
      type: 'Training',
      title: 'Backhand Practice',
      time: '1 day ago',
      result: '45 minutes focused training',
      rewards: { hp: 10, xp: 30, tokens: 15 },
      status: 'completed'
    },
    {
      id: 3,
      type: 'Social',
      title: 'Doubles with Club Members',
      time: '2 days ago',
      result: 'Fun casual games',
      rewards: { hp: 8, xp: 20, tokens: 10 },
      status: 'completed'
    }
  ];

  const weeklyStats = {
    totalActivities: 8,
    totalHours: 12.5,
    averageIntensity: 'Medium',
    streak: 7
  };

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
          <Button variant="outline" size="sm">
            View All
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {activity.type}
                    </Badge>
                    <span className="text-sm text-gray-500">{activity.time}</span>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">{activity.title}</h4>
                  <p className="text-sm text-gray-600">{activity.result}</p>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-2 text-xs mb-1">
                    <span className="text-red-600">+{activity.rewards.hp} HP</span>
                    <span className="text-yellow-600">+{activity.rewards.xp} XP</span>
                    <span className="text-green-600">+{activity.rewards.tokens} Tokens</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Completed
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
