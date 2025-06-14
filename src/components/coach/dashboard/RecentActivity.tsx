
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Activity, 
  MessageSquare, 
  Calendar, 
  Award, 
  Users, 
  TrendingUp,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RecentActivityProps {
  cxpActivities: any[];
  transactions: any[];
  cxpLoading: boolean;
  tokensLoading: boolean;
}

export function RecentActivity({ 
  cxpActivities, 
  transactions, 
  cxpLoading, 
  tokensLoading 
}: RecentActivityProps) {
  // Mock recent activities for demonstration
  const mockActivities = [
    {
      id: '1',
      type: 'session',
      title: 'Completed session with Sarah Johnson',
      description: 'Forehand technique improvement',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      icon: Calendar,
      color: 'text-blue-600',
      badge: '+15 CXP'
    },
    {
      id: '2',
      type: 'message',
      title: 'New message from Mike Chen',
      description: 'Question about backhand drills',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      icon: MessageSquare,
      color: 'text-green-600',
      badge: null
    },
    {
      id: '3',
      type: 'achievement',
      title: 'Client achievement unlocked',
      description: 'Emma Davis reached Level 20',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      icon: Award,
      color: 'text-yellow-600',
      badge: '+25 CTK'
    },
    {
      id: '4',
      type: 'client',
      title: 'New client registration',
      description: 'Alex Rodriguez joined your program',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      icon: Users,
      color: 'text-purple-600',
      badge: 'New'
    },
    {
      id: '5',
      type: 'milestone',
      title: 'Monthly goal achieved',
      description: 'Completed 30 coaching sessions',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      icon: TrendingUp,
      color: 'text-orange-600',
      badge: '+100 CTK'
    }
  ];

  if (cxpLoading || tokensLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg border animate-pulse">
                <div className="h-8 w-8 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Your latest coaching activities and updates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {mockActivities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <Icon className={`h-4 w-4 ${activity.color}`} />
                    </div>
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.description}
                        </p>
                      </div>
                      {activity.badge && (
                        <Badge 
                          variant="outline" 
                          className="text-xs flex-shrink-0"
                        >
                          {activity.badge}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
