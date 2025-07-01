import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Medal, Crown, Star, Users } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  avatar?: string;
  score: number;
  level: number;
  badge?: string;
  isCurrentUser?: boolean;
  isFriend?: boolean;
}

interface LeaderboardWidgetProps {
  className?: string;
}

// Mock data for demonstration
const LEADERBOARD_DATA = {
  daily: [
    { id: '1', rank: 1, name: 'Alex Chen', score: 850, level: 6, badge: 'Champion', isCurrentUser: false, isFriend: true },
    { id: '2', rank: 2, name: 'Maria Garcia', score: 720, level: 5, badge: 'Expert', isCurrentUser: false, isFriend: true },
    { id: '3', rank: 3, name: 'You', score: 650, level: 4, badge: 'Scholar', isCurrentUser: true, isFriend: false },
    { id: '4', rank: 4, name: 'John Smith', score: 580, level: 4, badge: 'Student', isCurrentUser: false, isFriend: false },
    { id: '5', rank: 5, name: 'Emma Wilson', score: 520, level: 3, badge: 'Learner', isCurrentUser: false, isFriend: true },
  ],
  weekly: [
    { id: '1', rank: 1, name: 'Maria Garcia', score: 2840, level: 5, badge: 'Expert', isCurrentUser: false, isFriend: true },
    { id: '2', rank: 2, name: 'You', score: 2650, level: 4, badge: 'Scholar', isCurrentUser: true, isFriend: false },
    { id: '3', rank: 3, name: 'Alex Chen', score: 2420, level: 6, badge: 'Champion', isCurrentUser: false, isFriend: true },
    { id: '4', rank: 4, name: 'David Lee', score: 2180, level: 4, badge: 'Student', isCurrentUser: false, isFriend: false },
    { id: '5', rank: 5, name: 'Sophie Brown', score: 1950, level: 3, badge: 'Learner', isCurrentUser: false, isFriend: true },
  ],
  monthly: [
    { id: '1', rank: 1, name: 'You', score: 8750, level: 4, badge: 'Scholar', isCurrentUser: true, isFriend: false },
    { id: '2', rank: 2, name: 'Alex Chen', score: 8420, level: 6, badge: 'Champion', isCurrentUser: false, isFriend: true },
    { id: '3', rank: 3, name: 'Maria Garcia', score: 7890, level: 5, badge: 'Expert', isCurrentUser: false, isFriend: true },
    { id: '4', rank: 4, name: 'James Wilson', score: 7320, level: 5, badge: 'Expert', isCurrentUser: false, isFriend: false },
    { id: '5', rank: 5, name: 'Emma Wilson', score: 6850, level: 3, badge: 'Learner', isCurrentUser: false, isFriend: true },
  ]
};

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="h-5 w-5 text-yellow-500" />;
    case 2:
      return <Medal className="h-5 w-5 text-gray-400" />;
    case 3:
      return <Medal className="h-5 w-5 text-amber-600" />;
    default:
      return <span className="text-sm font-bold text-tennis-green-medium">#{rank}</span>;
  }
};

const LeaderboardEntry: React.FC<{ entry: LeaderboardEntry }> = ({ entry }) => (
  <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
    entry.isCurrentUser 
      ? 'bg-tennis-green-primary/10 border border-tennis-green-primary/20' 
      : 'hover:bg-gray-50'
  }`}>
    <div className="flex items-center justify-center w-8">
      {getRankIcon(entry.rank)}
    </div>
    
    <Avatar className="h-8 w-8">
      <AvatarFallback className="bg-tennis-green-light text-white text-xs">
        {entry.name.split(' ').map(n => n[0]).join('')}
      </AvatarFallback>
    </Avatar>
    
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <p className={`text-sm font-medium truncate ${
          entry.isCurrentUser ? 'text-tennis-green-dark' : 'text-gray-900'
        }`}>
          {entry.name}
        </p>
        {entry.isFriend && <Users className="h-3 w-3 text-blue-500" />}
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          Level {entry.level}
        </Badge>
        {entry.badge && (
          <Badge variant="secondary" className="text-xs">
            {entry.badge}
          </Badge>
        )}
      </div>
    </div>
    
    <div className="text-right">
      <p className={`text-sm font-bold ${
        entry.isCurrentUser ? 'text-tennis-green-primary' : 'text-tennis-green-dark'
      }`}>
        {entry.score.toLocaleString()}
      </p>
      <p className="text-xs text-tennis-green-medium">XP</p>
    </div>
  </div>
);

export const LeaderboardWidget: React.FC<LeaderboardWidgetProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState('daily');

  return (
    <Card className={`bg-white/95 backdrop-blur-sm border-tennis-green-light/20 ${className}`}>
      <CardHeader className="bg-gradient-to-r from-tennis-green-primary to-tennis-green-dark text-white p-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-6 w-6" />
          Academy Leaderboard
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily" className="text-xs">Daily</TabsTrigger>
            <TabsTrigger value="weekly" className="text-xs">Weekly</TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs">Monthly</TabsTrigger>
          </TabsList>
          
          {Object.entries(LEADERBOARD_DATA).map(([period, entries]) => (
            <TabsContent key={period} value={period} className="space-y-2">
              {entries.map((entry) => (
                <LeaderboardEntry key={entry.id} entry={entry} />
              ))}
              
              <div className="pt-2 border-t">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-tennis-green-primary hover:text-tennis-green-dark"
                >
                  View Full Rankings
                  <Star className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};