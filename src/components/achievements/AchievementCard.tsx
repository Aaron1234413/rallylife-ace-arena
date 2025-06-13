
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Star, 
  Crown, 
  Award,
  Gift,
  Lock,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  tier: string;
  reward_xp: number;
  reward_tokens: number;
  reward_premium_tokens: number;
  requirement_value: number;
  is_hidden: boolean;
}

interface AchievementCardProps {
  achievement: Achievement;
  isUnlocked?: boolean;
  isClaimed?: boolean;
  currentProgress?: number;
  onClaim?: (achievementId: string) => void;
  className?: string;
}

const tierIcons = {
  bronze: Trophy,
  silver: Star,
  gold: Crown,
  platinum: Award
};

const tierColors = {
  bronze: 'text-amber-600 bg-amber-50 border-amber-200',
  silver: 'text-gray-600 bg-gray-50 border-gray-200',
  gold: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  platinum: 'text-purple-600 bg-purple-50 border-purple-200'
};

const categoryColors = {
  progression: 'bg-blue-100 text-blue-800',
  gameplay: 'bg-green-100 text-green-800',
  social: 'bg-pink-100 text-pink-800',
  special: 'bg-purple-100 text-purple-800'
};

export function AchievementCard({
  achievement,
  isUnlocked = false,
  isClaimed = false,
  currentProgress = 0,
  onClaim,
  className
}: AchievementCardProps) {
  const TierIcon = tierIcons[achievement.tier as keyof typeof tierIcons] || Trophy;
  const tierColorClass = tierColors[achievement.tier as keyof typeof tierColors] || tierColors.bronze;
  const categoryColorClass = categoryColors[achievement.category as keyof typeof categoryColors] || categoryColors.progression;
  
  const progressPercentage = achievement.requirement_value > 0 
    ? Math.min((currentProgress / achievement.requirement_value) * 100, 100)
    : 0;

  const isHidden = achievement.is_hidden && !isUnlocked;

  if (isHidden) {
    return (
      <Card className={cn('opacity-50', className)}>
        <CardContent className="p-4 text-center">
          <Lock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Hidden Achievement</p>
          <p className="text-xs text-muted-foreground">Complete certain tasks to reveal</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-md',
      isUnlocked ? 'border-green-200 bg-green-50/30' : '',
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              'p-2 rounded-full border',
              tierColorClass
            )}>
              <TierIcon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{achievement.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className={categoryColorClass}>
                  {achievement.category}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {achievement.tier}
                </Badge>
              </div>
            </div>
          </div>
          {isUnlocked && (
            <div className="flex items-center gap-1 text-green-600">
              <Check className="h-4 w-4" />
              <span className="text-xs font-medium">Unlocked</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {achievement.description}
        </p>

        {/* Progress Bar */}
        {!isUnlocked && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                {currentProgress}/{achievement.requirement_value}
              </span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-2"
              indicatorClassName="bg-blue-500"
            />
          </div>
        )}

        {/* Rewards */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Rewards</h4>
          <div className="flex flex-wrap gap-2">
            {achievement.reward_xp > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                +{achievement.reward_xp} XP
              </Badge>
            )}
            {achievement.reward_tokens > 0 && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                +{achievement.reward_tokens} Tokens
              </Badge>
            )}
            {achievement.reward_premium_tokens > 0 && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                +{achievement.reward_premium_tokens} Rally Points
              </Badge>
            )}
          </div>
        </div>

        {/* Claim Button */}
        {isUnlocked && !isClaimed && onClaim && (
          <Button 
            onClick={() => onClaim(achievement.id)}
            className="w-full mt-4"
            variant="default"
          >
            <Gift className="h-4 w-4 mr-2" />
            Claim Rewards
          </Button>
        )}

        {isClaimed && (
          <Button 
            disabled
            className="w-full mt-4"
            variant="secondary"
          >
            <Check className="h-4 w-4 mr-2" />
            Rewards Claimed
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
