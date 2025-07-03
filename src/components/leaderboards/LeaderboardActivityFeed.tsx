import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageCircle, 
  Zap, 
  UserPlus, 
  Trophy, 
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Crown,
  Users
} from 'lucide-react';

interface LeaderboardActivityFeedProps {
  maxItems?: number;
}

// Mock data for social interactions - this would come from real API calls in production
const mockSocialActivities = [
  {
    id: '1',
    type: 'challenge_sent',
    timestamp: new Date(Date.now() - 5 * 60000), // 5 minutes ago
    actor: {
      id: 'user1',
      name: 'Alex Chen',
      avatar: null,
      role: 'player'
    },
    target: {
      id: 'user2', 
      name: 'Maria Rodriguez',
      avatar: null,
      role: 'player'
    },
    metadata: {
      challengeType: 'Singles Match',
      stakes: '50 tokens'
    }
  },
  {
    id: '2',
    type: 'coach_connection',
    timestamp: new Date(Date.now() - 15 * 60000), // 15 minutes ago
    actor: {
      id: 'coach1',
      name: 'Coach Thompson',
      avatar: null,
      role: 'coach'
    },
    target: {
      id: 'player1',
      name: 'Jordan Smith',
      avatar: null,
      role: 'player'
    },
    metadata: {
      connectionType: 'Training Partnership'
    }
  },
  {
    id: '3',
    type: 'rank_change',
    timestamp: new Date(Date.now() - 30 * 60000), // 30 minutes ago
    actor: {
      id: 'user3',
      name: 'Emma Wilson',
      avatar: null,
      role: 'player'
    },
    metadata: {
      oldRank: 15,
      newRank: 12,
      change: 3,
      category: 'Player XP'
    }
  },
  {
    id: '4',
    type: 'achievement_unlock',
    timestamp: new Date(Date.now() - 45 * 60000), // 45 minutes ago
    actor: {
      id: 'coach2',
      name: 'Coach Williams',
      avatar: null,
      role: 'coach'
    },
    metadata: {
      achievementName: 'Master Trainer',
      achievementTier: 'gold'
    }
  },
  {
    id: '5',
    type: 'challenge_accepted',
    timestamp: new Date(Date.now() - 60 * 60000), // 1 hour ago
    actor: {
      id: 'user4',
      name: 'Ryan Johnson',
      avatar: null,
      role: 'player'
    },
    target: {
      id: 'user5',
      name: 'Sarah Lee',
      avatar: null,
      role: 'player'
    },
    metadata: {
      challengeType: 'Doubles Match',
      stakes: '75 tokens'
    }
  }
];

export function LeaderboardActivityFeed({ maxItems = 5 }: LeaderboardActivityFeedProps) {
  const activities = mockSocialActivities.slice(0, maxItems);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'challenge_sent':
      case 'challenge_accepted':
        return <Zap className="h-4 w-4 text-orange-600" />;
      case 'coach_connection':
        return <UserPlus className="h-4 w-4 text-green-600" />;
      case 'rank_change':
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'achievement_unlock':
        return <Trophy className="h-4 w-4 text-yellow-600" />;
      default:
        return <MessageCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatActivityText = (activity: any) => {
    switch (activity.type) {
      case 'challenge_sent':
        return (
          <span>
            <strong>{activity.actor.name}</strong> challenged{' '}
            <strong>{activity.target.name}</strong> to a{' '}
            {activity.metadata.challengeType}
            {activity.metadata.stakes && (
              <Badge variant="outline" className="ml-2 text-xs">
                {activity.metadata.stakes}
              </Badge>
            )}
          </span>
        );
      case 'challenge_accepted':
        return (
          <span>
            <strong>{activity.actor.name}</strong> accepted{' '}
            <strong>{activity.target.name}</strong>'s challenge
            {activity.metadata.stakes && (
              <Badge variant="outline" className="ml-2 text-xs">
                {activity.metadata.stakes}
              </Badge>
            )}
          </span>
        );
      case 'coach_connection':
        return (
          <span>
            <strong>{activity.actor.name}</strong> connected with{' '}
            <strong>{activity.target.name}</strong>
            <Badge variant="outline" className="ml-2 text-xs">
              {activity.metadata.connectionType}
            </Badge>
          </span>
        );
      case 'rank_change':
        const isPositive = activity.metadata.change > 0;
        return (
          <span>
            <strong>{activity.actor.name}</strong> moved{' '}
            {isPositive ? 'up' : 'down'} {Math.abs(activity.metadata.change)} positions
            <div className="flex items-center gap-1 mt-1">
              {isPositive ? (
                <ArrowUp className="h-3 w-3 text-green-600" />
              ) : (
                <ArrowDown className="h-3 w-3 text-red-600" />
              )}
              <span className="text-xs text-gray-600">
                #{activity.metadata.oldRank} → #{activity.metadata.newRank}
              </span>
              <Badge variant="outline" className="ml-1 text-xs">
                {activity.metadata.category}
              </Badge>
            </div>
          </span>
        );
      case 'achievement_unlock':
        return (
          <span>
            <strong>{activity.actor.name}</strong> unlocked{' '}
            <strong>{activity.metadata.achievementName}</strong>
            <Badge 
              variant="outline" 
              className={`ml-2 text-xs ${
                activity.metadata.achievementTier === 'gold' ? 'border-yellow-500 text-yellow-700' :
                activity.metadata.achievementTier === 'silver' ? 'border-gray-400 text-gray-700' :
                'border-orange-500 text-orange-700'
              }`}
            >
              {activity.metadata.achievementTier}
            </Badge>
          </span>
        );
      default:
        return <span>Unknown activity</span>;
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return timestamp.toLocaleDateString();
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-tennis-green-light shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 orbitron-heading text-heading-md text-tennis-green-dark">
          <Users className="h-5 w-5" />
          Social Activity
        </CardTitle>
        <p className="poppins-body text-body-sm text-tennis-green-medium">
          Recent community interactions and achievements
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.length === 0 ? (
          <div className="text-center py-4">
            <MessageCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-tennis-green-medium">No recent activity</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-tennis-green-bg/20 transition-colors">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="text-sm text-tennis-green-dark">
                  {formatActivityText(activity)}
                </div>
                <div className="text-xs text-tennis-green-medium mt-1">
                  {formatTimeAgo(activity.timestamp)}
                </div>
              </div>
              
              {activity.actor.avatar && (
                <Avatar className="h-6 w-6">
                  <AvatarImage src={activity.actor.avatar} />
                  <AvatarFallback className="text-xs">
                    {activity.actor.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))
        )}
        
        {activities.length > 0 && (
          <div className="pt-2 border-t border-gray-100">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-tennis-green-accent hover:text-tennis-green-primary"
            >
              View All Activity
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}