import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Trophy, Target, Clock } from 'lucide-react';

const mockActivities = [
  {
    id: 1,
    type: 'match',
    title: 'Match completed vs John Doe',
    description: 'Won 6-4, 6-2',
    timestamp: '2 hours ago',
    icon: Trophy,
    color: 'text-green-600'
  },
  {
    id: 2,
    type: 'training',
    title: 'Training session completed',
    description: 'Backhand drills - 45 minutes',
    timestamp: '1 day ago',
    icon: Target,
    color: 'text-blue-600'
  },
  {
    id: 3,
    type: 'challenge',
    title: 'Challenge sent to Sarah Wilson',
    description: 'Waiting for response',
    timestamp: '2 days ago',
    icon: Clock,
    color: 'text-orange-600'
  }
];

export function RecentActivity() {
  return (
    <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockActivities.map((activity) => {
          const IconComponent = activity.icon;
          return (
            <div key={activity.id} className="flex items-start gap-3 p-3 bg-tennis-green-bg/30 rounded-lg">
              <div className={`p-2 rounded-full bg-white ${activity.color}`}>
                <IconComponent className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-tennis-green-dark text-sm">{activity.title}</p>
                <p className="text-xs text-tennis-green-dark/70">{activity.description}</p>
                <p className="text-xs text-tennis-green-dark/50 mt-1">{activity.timestamp}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}