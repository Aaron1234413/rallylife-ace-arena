import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Clock, 
  Trophy,
  Users,
  Zap,
  CheckCircle,
  Calendar,
  Gift
} from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'weekly' | 'daily' | 'friend';
  progress: number;
  target: number;
  reward: {
    tokens: number;
    xp: number;
    badge?: string;
  };
  timeLeft: string;
  isCompleted: boolean;
  participants?: number;
  friends?: string[];
}

interface ChallengeSystemProps {
  className?: string;
}

// Mock challenges data
const CHALLENGES: Challenge[] = [
  {
    id: '1',
    title: 'Quiz Master',
    description: 'Complete 5 quizzes this week',
    type: 'weekly',
    progress: 3,
    target: 5,
    reward: { tokens: 50, xp: 200, badge: 'Quiz Master' },
    timeLeft: '4 days',
    isCompleted: false,
    participants: 127
  },
  {
    id: '2',
    title: 'Daily Scholar',
    description: 'Complete today\'s daily drill',
    type: 'daily',
    progress: 0,
    target: 1,
    reward: { tokens: 15, xp: 50 },
    timeLeft: '18 hours',
    isCompleted: false
  },
  {
    id: '3',
    title: 'Friend Challenge: Tennis Trivia',
    description: 'Score higher than your friends in tennis history',
    type: 'friend',
    progress: 75,
    target: 100,
    reward: { tokens: 25, xp: 100 },
    timeLeft: '2 days',
    isCompleted: false,
    friends: ['Alex', 'Maria', 'Emma']
  },
  {
    id: '4',
    title: 'Streak Warrior',
    description: 'Maintain a 7-day learning streak',
    type: 'weekly',
    progress: 7,
    target: 7,
    reward: { tokens: 75, xp: 300, badge: 'Streak Warrior' },
    timeLeft: 'Completed',
    isCompleted: true
  }
];

const ChallengeCard: React.FC<{ challenge: Challenge }> = ({ challenge }) => {
  const progressPercentage = (challenge.progress / challenge.target) * 100;
  const getTypeIcon = () => {
    switch (challenge.type) {
      case 'weekly':
        return <Calendar className="h-4 w-4" />;
      case 'daily':
        return <Clock className="h-4 w-4" />;
      case 'friend':
        return <Users className="h-4 w-4" />;
    }
  };

  const getTypeColor = () => {
    switch (challenge.type) {
      case 'weekly':
        return 'bg-purple-100 text-purple-800';
      case 'daily':
        return 'bg-blue-100 text-blue-800';
      case 'friend':
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <Card className={`relative transition-all duration-300 ${
      challenge.isCompleted 
        ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' 
        : 'bg-white/90 hover:shadow-md'
    }`}>
      {challenge.isCompleted && (
        <div className="absolute top-2 right-2">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Badge className={`w-fit ${getTypeColor()}`}>
              <div className="flex items-center gap-1">
                {getTypeIcon()}
                <span className="capitalize">{challenge.type}</span>
              </div>
            </Badge>
            <CardTitle className="text-sm font-semibold text-tennis-green-dark">
              {challenge.title}
            </CardTitle>
          </div>
        </div>
        
        <p className="text-xs text-tennis-green-medium">{challenge.description}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-tennis-green-dark">
              Progress: {challenge.progress}/{challenge.target}
            </span>
            <span className="text-xs text-tennis-green-medium">
              {challenge.timeLeft}
            </span>
          </div>
          <Progress 
            value={progressPercentage} 
            className={`h-2 ${challenge.isCompleted ? 'bg-green-100' : ''}`}
          />
        </div>

        {/* Friends participating (for friend challenges) */}
        {challenge.friends && (
          <div className="flex items-center gap-2">
            <Users className="h-3 w-3 text-tennis-green-medium" />
            <span className="text-xs text-tennis-green-medium">
              vs {challenge.friends.join(', ')}
            </span>
          </div>
        )}

        {/* Participants (for public challenges) */}
        {challenge.participants && (
          <div className="flex items-center gap-2">
            <Target className="h-3 w-3 text-tennis-green-medium" />
            <span className="text-xs text-tennis-green-medium">
              {challenge.participants} participants
            </span>
          </div>
        )}

        {/* Rewards */}
        <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-yellow-600" />
            <span className="text-xs font-medium text-tennis-green-dark">
              +{challenge.reward.tokens}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Trophy className="h-3 w-3 text-blue-600" />
            <span className="text-xs font-medium text-tennis-green-dark">
              +{challenge.reward.xp} XP
            </span>
          </div>
          {challenge.reward.badge && (
            <div className="flex items-center gap-1">
              <Gift className="h-3 w-3 text-purple-600" />
              <span className="text-xs font-medium text-purple-700">
                {challenge.reward.badge}
              </span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <Button 
          size="sm" 
          className={`w-full ${
            challenge.isCompleted 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-tennis-green-primary hover:bg-tennis-green-dark'
          }`}
          disabled={challenge.isCompleted}
        >
          {challenge.isCompleted ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Completed
            </>
          ) : (
            <>
              <Target className="h-4 w-4 mr-2" />
              {challenge.type === 'friend' ? 'Challenge Friends' : 'Join Challenge'}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export const ChallengeSystem: React.FC<ChallengeSystemProps> = ({ className }) => {
  const [filter, setFilter] = useState<'all' | 'weekly' | 'daily' | 'friend'>('all');

  const filteredChallenges = filter === 'all' 
    ? CHALLENGES 
    : CHALLENGES.filter(c => c.type === filter);

  const completedCount = CHALLENGES.filter(c => c.isCompleted).length;

  return (
    <Card className={`bg-white/95 backdrop-blur-sm border-tennis-green-light/20 ${className}`}>
      <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6" />
            Active Challenges
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white">
            {completedCount}/{CHALLENGES.length} Complete
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        {/* Filter Buttons */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['all', 'weekly', 'daily', 'friend'].map((type) => (
            <Button
              key={type}
              variant={filter === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(type as any)}
              className="capitalize whitespace-nowrap"
            >
              {type === 'all' ? 'All Challenges' : `${type} Challenges`}
            </Button>
          ))}
        </div>

        {/* Challenges Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {filteredChallenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>

        {filteredChallenges.length === 0 && (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-tennis-green-medium">No challenges found for this filter</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};