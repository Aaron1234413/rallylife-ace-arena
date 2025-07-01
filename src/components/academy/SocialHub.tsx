import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  UserPlus, 
  MessageSquare, 
  Trophy,
  Bell,
  Star,
  Target,
  Gift,
  Calendar
} from 'lucide-react';

interface Friend {
  id: string;
  name: string;
  avatar?: string;
  level: number;
  status: 'online' | 'studying' | 'offline';
  lastSeen: string;
  currentStreak: number;
  recentAchievement?: string;
}

interface StudyGroup {
  id: string;
  name: string;
  members: number;
  maxMembers: number;
  topic: string;
  nextSession: string;
  isJoined: boolean;
}

interface Notification {
  id: string;
  type: 'achievement' | 'challenge' | 'friend' | 'group';
  message: string;
  time: string;
  isRead: boolean;
  actionable?: boolean;
}

interface SocialHubProps {
  className?: string;
}

// Mock data
const FRIENDS: Friend[] = [
  {
    id: '1',
    name: 'Alex Chen',
    level: 6,
    status: 'studying',
    lastSeen: 'Active now',
    currentStreak: 12,
    recentAchievement: 'Quiz Master'
  },
  {
    id: '2',
    name: 'Maria Garcia',
    level: 5,
    status: 'online',
    lastSeen: '2 min ago',
    currentStreak: 8,
    recentAchievement: 'Strategy Expert'
  },
  {
    id: '3',
    name: 'Emma Wilson',
    level: 3,
    status: 'offline',
    lastSeen: '1 hour ago',
    currentStreak: 5
  }
];

const STUDY_GROUPS: StudyGroup[] = [
  {
    id: '1',
    name: 'Tennis Strategy Masters',
    members: 12,
    maxMembers: 20,
    topic: 'Advanced Tactics',
    nextSession: 'Today 7:00 PM',
    isJoined: true
  },
  {
    id: '2',
    name: 'Rules & Regulations',
    members: 8,
    maxMembers: 15,
    topic: 'Tournament Rules',
    nextSession: 'Tomorrow 6:00 PM',
    isJoined: false
  },
  {
    id: '3',
    name: 'Tennis History Club',
    members: 15,
    maxMembers: 25,
    topic: 'Champions & Legends',
    nextSession: 'Wed 5:30 PM',
    isJoined: true
  }
];

const NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'achievement',
    message: 'Alex Chen unlocked "Quiz Master" badge!',
    time: '2 min ago',
    isRead: false,
    actionable: true
  },
  {
    id: '2',
    type: 'challenge',
    message: 'Maria Garcia challenged you to "Tennis Trivia"',
    time: '5 min ago',
    isRead: false,
    actionable: true
  },
  {
    id: '3',
    type: 'group',
    message: 'Tennis Strategy Masters session starts in 30 minutes',
    time: '30 min ago',
    isRead: false,
    actionable: true
  },
  {
    id: '4',
    type: 'friend',
    message: 'Emma Wilson started a 5-day learning streak!',
    time: '1 hour ago',
    isRead: true
  }
];

const getStatusColor = (status: Friend['status']) => {
  switch (status) {
    case 'online':
      return 'bg-green-500';
    case 'studying':
      return 'bg-blue-500';
    case 'offline':
      return 'bg-gray-400';
  }
};

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'achievement':
      return <Trophy className="h-4 w-4 text-yellow-600" />;
    case 'challenge':
      return <Target className="h-4 w-4 text-red-600" />;
    case 'friend':
      return <Users className="h-4 w-4 text-blue-600" />;
    case 'group':
      return <Calendar className="h-4 w-4 text-purple-600" />;
  }
};

const FriendCard: React.FC<{ friend: Friend }> = ({ friend }) => (
  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
    <div className="relative">
      <Avatar className="h-10 w-10">
        <AvatarFallback className="bg-tennis-green-light text-white">
          {friend.name.split(' ').map(n => n[0]).join('')}
        </AvatarFallback>
      </Avatar>
      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(friend.status)}`} />
    </div>
    
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <p className="font-medium text-sm text-tennis-green-dark truncate">{friend.name}</p>
        <Badge variant="outline" className="text-xs">Lv.{friend.level}</Badge>
      </div>
      <p className="text-xs text-tennis-green-medium">{friend.lastSeen}</p>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-xs text-orange-600">🔥 {friend.currentStreak}</span>
        {friend.recentAchievement && (
          <Badge variant="secondary" className="text-xs">{friend.recentAchievement}</Badge>
        )}
      </div>
    </div>
    
    <Button size="sm" variant="ghost" className="p-2">
      <MessageSquare className="h-4 w-4" />
    </Button>
  </div>
);

const StudyGroupCard: React.FC<{ group: StudyGroup }> = ({ group }) => (
  <Card className="p-4">
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium text-sm text-tennis-green-dark">{group.name}</h4>
          <p className="text-xs text-tennis-green-medium">{group.topic}</p>
        </div>
        {group.isJoined && (
          <Badge variant="secondary" className="text-xs">Joined</Badge>
        )}
      </div>
      
      <div className="flex items-center justify-between text-xs">
        <span className="text-tennis-green-medium">
          {group.members}/{group.maxMembers} members
        </span>
        <span className="text-tennis-green-medium">{group.nextSession}</span>
      </div>
      
      <Button 
        size="sm" 
        variant={group.isJoined ? "outline" : "default"}
        className="w-full"
      >
        {group.isJoined ? 'View Group' : 'Join Group'}
      </Button>
    </div>
  </Card>
);

const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => (
  <div className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
    notification.isRead ? 'opacity-75' : 'bg-blue-50'
  }`}>
    <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
    
    <div className="flex-1 min-w-0">
      <p className="text-sm text-tennis-green-dark">{notification.message}</p>
      <p className="text-xs text-tennis-green-medium mt-1">{notification.time}</p>
    </div>
    
    {notification.actionable && !notification.isRead && (
      <Button size="sm" variant="outline" className="text-xs">
        {notification.type === 'challenge' ? 'Accept' : 'View'}
      </Button>
    )}
  </div>
);

export const SocialHub: React.FC<SocialHubProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState('friends');
  const unreadCount = NOTIFICATIONS.filter(n => !n.isRead).length;

  return (
    <Card className={`bg-white/95 backdrop-blur-sm border-tennis-green-light/20 ${className}`}>
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            Social Hub
          </div>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="bg-white/20 text-white">
              {unreadCount} new
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="friends" className="text-xs">Friends</TabsTrigger>
            <TabsTrigger value="groups" className="text-xs">Study Groups</TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs relative">
              Notifications
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="friends" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-tennis-green-dark">Your Friends</h3>
              <Button size="sm" variant="outline">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Friend
              </Button>
            </div>
            
            <div className="space-y-2">
              {FRIENDS.map((friend) => (
                <FriendCard key={friend.id} friend={friend} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="groups" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-tennis-green-dark">Study Groups</h3>
              <Button size="sm" variant="outline">
                <Star className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            </div>
            
            <div className="grid gap-3">
              {STUDY_GROUPS.map((group) => (
                <StudyGroupCard key={group.id} group={group} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-2">
            {NOTIFICATIONS.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
            
            {NOTIFICATIONS.length === 0 && (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-tennis-green-medium">No notifications yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};