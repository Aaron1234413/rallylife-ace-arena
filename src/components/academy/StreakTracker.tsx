import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar,
  Flame,
  Target,
  Gift,
  Zap,
  CheckCircle
} from 'lucide-react';

interface StreakTrackerProps {
  currentStreak: number;
  longestStreak: number;
  className?: string;
}

interface StreakMilestone {
  days: number;
  reward: {
    tokens: number;
    xp: number;
    badge?: string;
  };
  isReached: boolean;
  isClaimed: boolean;
}

const STREAK_MILESTONES: StreakMilestone[] = [
  {
    days: 3,
    reward: { tokens: 25, xp: 100 },
    isReached: true,
    isClaimed: true
  },
  {
    days: 7,
    reward: { tokens: 75, xp: 300, badge: 'Week Warrior' },
    isReached: true,
    isClaimed: false
  },
  {
    days: 14,
    reward: { tokens: 150, xp: 500, badge: 'Fortnight Fighter' },
    isReached: false,
    isClaimed: false
  },
  {
    days: 30,
    reward: { tokens: 300, xp: 1000, badge: 'Month Master' },
    isReached: false,
    isClaimed: false
  },
  {
    days: 100,
    reward: { tokens: 1000, xp: 2500, badge: 'Century Scholar' },
    isReached: false,
    isClaimed: false
  }
];

// Calculate streak data for current streak of 7 days
const getStreakProgress = (currentStreak: number) => {
  const updatedMilestones = STREAK_MILESTONES.map(milestone => ({
    ...milestone,
    isReached: currentStreak >= milestone.days,
    isClaimed: currentStreak >= milestone.days && milestone.days <= 3 // Only 3-day claimed
  }));
  
  const nextMilestone = updatedMilestones.find(m => !m.isReached);
  const progressToNext = nextMilestone 
    ? (currentStreak / nextMilestone.days) * 100 
    : 100;
    
  return { milestones: updatedMilestones, nextMilestone, progressToNext };
};

const StreakCalendar: React.FC<{ streak: number }> = ({ streak }) => {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = new Date().getDay();
  
  return (
    <div className="grid grid-cols-7 gap-1">
      {days.map((day, index) => {
        const isToday = index === today;
        const isActive = index <= today && streak > (today - index);
        
        return (
          <div key={index} className="text-center">
            <div className="text-xs text-tennis-green-medium mb-1">{day}</div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
              isActive 
                ? 'bg-orange-500 text-white' 
                : isToday 
                  ? 'border-2 border-orange-300 text-orange-600' 
                  : 'bg-gray-100 text-gray-400'
            }`}>
              {isActive ? '🔥' : index + 1}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const MilestoneCard: React.FC<{ milestone: StreakMilestone }> = ({ milestone }) => (
  <div className={`p-3 rounded-lg border transition-all ${
    milestone.isClaimed 
      ? 'bg-green-50 border-green-200' 
      : milestone.isReached 
        ? 'bg-yellow-50 border-yellow-200 shadow-sm' 
        : 'bg-gray-50 border-gray-200'
  }`}>
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <Target className={`h-4 w-4 ${
          milestone.isClaimed ? 'text-green-600' : 'text-orange-600'
        }`} />
        <span className="font-medium text-sm text-tennis-green-dark">
          {milestone.days} Days
        </span>
      </div>
      {milestone.isClaimed && <CheckCircle className="h-4 w-4 text-green-600" />}
    </div>
    
    <div className="space-y-1">
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1">
          <Zap className="h-3 w-3 text-yellow-600" />
          <span>+{milestone.reward.tokens}</span>
        </div>
        <div className="flex items-center gap-1">
          <Target className="h-3 w-3 text-blue-600" />
          <span>+{milestone.reward.xp} XP</span>
        </div>
      </div>
      
      {milestone.reward.badge && (
        <div className="flex items-center gap-1">
          <Gift className="h-3 w-3 text-purple-600" />
          <span className="text-xs text-purple-700">{milestone.reward.badge}</span>
        </div>
      )}
    </div>
    
    {milestone.isReached && !milestone.isClaimed && (
      <Button size="sm" className="w-full mt-2 bg-yellow-600 hover:bg-yellow-700">
        Claim Reward
      </Button>
    )}
  </div>
);

export const StreakTracker: React.FC<StreakTrackerProps> = ({ 
  currentStreak = 7, 
  longestStreak = 12, 
  className 
}) => {
  const { milestones, nextMilestone, progressToNext } = getStreakProgress(currentStreak);
  const unclaimedRewards = milestones.filter(m => m.isReached && !m.isClaimed).length;

  return (
    <Card className={`bg-white/95 backdrop-blur-sm border-tennis-green-light/20 ${className}`}>
      <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-6 w-6" />
            Learning Streak
          </div>
          {unclaimedRewards > 0 && (
            <Badge variant="secondary" className="bg-white/20 text-white">
              {unclaimedRewards} Rewards Ready!
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 space-y-6">
        {/* Current Streak Display */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="text-4xl">🔥</span>
            <div>
              <div className="text-3xl font-bold text-orange-600">{currentStreak}</div>
              <div className="text-sm text-tennis-green-medium">Day Streak</div>
            </div>
          </div>
          
          <div className="flex justify-center gap-4 text-sm">
            <div className="text-center">
              <div className="font-medium text-tennis-green-dark">{longestStreak}</div>
              <div className="text-xs text-tennis-green-medium">Best Streak</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-tennis-green-dark">
                {new Date().toLocaleDateString('en', { month: 'short' })}
              </div>
              <div className="text-xs text-tennis-green-medium">This Month</div>
            </div>
          </div>
        </div>

        {/* Weekly Calendar */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-tennis-green-dark">This Week</h4>
          <StreakCalendar streak={currentStreak} />
        </div>

        {/* Progress to Next Milestone */}
        {nextMilestone && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium text-tennis-green-dark">
                Next Milestone: {nextMilestone.days} Days
              </h4>
              <span className="text-xs text-tennis-green-medium">
                {nextMilestone.days - currentStreak} days to go
              </span>
            </div>
            <Progress value={progressToNext} className="h-2" />
          </div>
        )}

        {/* Milestone Rewards */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-tennis-green-dark">Streak Milestones</h4>
          <div className="grid gap-3 md:grid-cols-2">
            {milestones.slice(0, 4).map((milestone, index) => (
              <MilestoneCard key={index} milestone={milestone} />
            ))}
          </div>
        </div>

        {/* Streak Recovery Info */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-xs text-blue-700">
              <p className="font-medium">Streak Recovery</p>
              <p>Miss a day? Use a Streak Freeze to keep your progress! Earn them by completing weekly challenges.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};