
import React from 'react';
import { Star, Trophy } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface XPDisplayProps {
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXPEarned?: number;
  size?: 'small' | 'medium' | 'large';
  showLevel?: boolean;
  showProgress?: boolean;
  className?: string;
}

export function XPDisplay({ 
  currentLevel,
  currentXP,
  xpToNextLevel,
  totalXPEarned,
  size = 'medium',
  showLevel = true,
  showProgress = true,
  className 
}: XPDisplayProps) {
  const xpForCurrentLevel = currentXP;
  const xpNeededForNext = xpForCurrentLevel + xpToNextLevel;
  const progressPercentage = xpNeededForNext > 0 ? (xpForCurrentLevel / xpNeededForNext) * 100 : 0;

  const sizeClasses = {
    small: 'h-1.5',
    medium: 'h-2.5',
    large: 'h-3'
  };

  const iconSizes = {
    small: 'h-4 w-4',
    medium: 'h-5 w-5',
    large: 'h-6 w-6'
  };

  const textSizes = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {showLevel && (
        <div className="flex items-center gap-1">
          <Star 
            className={cn(iconSizes[size], 'text-yellow-500')}
            fill="currentColor"
          />
          <Badge variant="secondary" className="font-semibold">
            Lv. {currentLevel}
          </Badge>
        </div>
      )}
      
      {showProgress && (
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className={cn('font-medium text-muted-foreground', textSizes[size])}>
              XP Progress
            </span>
            <span className={cn('font-semibold tabular-nums', textSizes[size])}>
              {xpForCurrentLevel}/{xpNeededForNext}
            </span>
          </div>
          <Progress
            value={progressPercentage}
            className={cn('w-full', sizeClasses[size])}
            indicatorClassName="bg-yellow-500"
          />
          {xpToNextLevel > 0 && (
            <p className={cn('text-muted-foreground mt-1', textSizes[size])}>
              {xpToNextLevel} XP to next level
            </p>
          )}
        </div>
      )}

      {totalXPEarned !== undefined && (
        <div className="text-right">
          <p className={cn('font-semibold', textSizes[size])}>
            {totalXPEarned.toLocaleString()} XP
          </p>
          <p className={cn('text-muted-foreground', textSizes[size])}>
            Total Earned
          </p>
        </div>
      )}
    </div>
  );
}

interface LevelBadgeProps {
  level: number;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function LevelBadge({ level, size = 'medium', className }: LevelBadgeProps) {
  const sizeClasses = {
    small: 'px-1.5 py-0.5 text-xs',
    medium: 'px-2 py-1 text-sm',
    large: 'px-3 py-1.5 text-base'
  };

  const iconSizes = {
    small: 'h-3 w-3',
    medium: 'h-4 w-4',
    large: 'h-5 w-5'
  };

  return (
    <Badge 
      variant="secondary" 
      className={cn(
        'flex items-center gap-1 bg-yellow-100 text-yellow-800 border-yellow-300',
        sizeClasses[size],
        className
      )}
    >
      <Trophy className={iconSizes[size]} />
      Lv. {level}
    </Badge>
  );
}
