import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Calendar, Users, Trophy, Target } from 'lucide-react';
import { Club } from '@/hooks/useClubs';
import { formatDistanceToNow } from 'date-fns';

interface ClubDashboardProps {
  club: Club;
}

export function ClubDashboard({ club }: ClubDashboardProps) {
  // Mock activity data
  const recentActivities = [
    {
      id: '1',
      type: 'member_joined',
      user: 'Alex Johnson',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      details: 'joined the club'
    },
    {
      id: '2',
      type: 'court_booked',
      user: 'Sarah Wilson',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      details: 'booked Court 1 for tomorrow'
    },
    {
      id: '3',
      type: 'event_created',
      user: 'Mike Davis',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      details: 'created "Weekend Tournament"'
    },
    {
      id: '4',
      type: 'lesson_scheduled',
      user: 'Emma Brown',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      details: 'scheduled a lesson with Coach Martinez'
    }
  ];

  const upcomingEvents = [
    {
      id: '1',
      title: 'Weekend Tournament',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      participants: 12,
      type: 'tournament'
    },
    {
      id: '2',
      title: 'Beginner Group Lesson',
      date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      participants: 6,
      type: 'lesson'
    },
    {
      id: '3',
      title: 'Club Social Mixer',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      participants: 25,
      type: 'social'
    }
  ];

  const stats = [
    {
      label: 'Active Members',
      value: club.member_count,
      icon: Users,
      color: 'text-blue-600'
    },
    {
      label: 'Courts Available',
      value: '4',
      icon: Target,
      color: 'text-green-600'
    },
    {
      label: 'Monthly Events',
      value: '8',
      icon: Calendar,
      color: 'text-purple-600'
    },
    {
      label: 'Championships Won',
      value: '3',
      icon: Trophy,
      color: 'text-amber-600'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'member_joined':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'court_booked':
        return <Target className="h-4 w-4 text-green-500" />;
      case 'event_created':
        return <Calendar className="h-4 w-4 text-purple-500" />;
      case 'lesson_scheduled':
        return <Trophy className="h-4 w-4 text-amber-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'tournament':
        return <Badge className="bg-red-100 text-red-800">Tournament</Badge>;
      case 'lesson':
        return <Badge className="bg-blue-100 text-blue-800">Lesson</Badge>;
      case 'social':
        return <Badge className="bg-green-100 text-green-800">Social</Badge>;
      default:
        return <Badge variant="secondary">Event</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-tennis-green-bg rounded-lg">
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-tennis-green-medium">{stat.label}</p>
                    <p className="text-2xl font-bold text-tennis-green-dark">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-tennis-green-bg/30">
                {getActivityIcon(activity.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span>{' '}
                    {activity.details}
                  </p>
                  <p className="text-xs text-tennis-green-medium">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 rounded-lg bg-tennis-green-bg/30">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{event.title}</h4>
                    {getEventBadge(event.type)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-tennis-green-medium">
                    <span>{formatDistanceToNow(event.date, { addSuffix: true })}</span>
                    <span>{event.participants} participants</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Club Description */}
      {club.description && (
        <Card>
          <CardHeader>
            <CardTitle>About This Club</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-tennis-green-medium leading-relaxed">{club.description}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}