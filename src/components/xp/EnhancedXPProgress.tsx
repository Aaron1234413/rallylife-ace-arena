
import React from 'react';
import { Star, Trophy, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface EnhancedXPProgressProps {
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXPEarned?: number;
  showMilestones?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function EnhancedXPProgress({ 
  currentLevel,
  currentXP,
  xpToNextLevel,
  totalXPEarned,
  showMilestones = true,
  size = 'medium',
  className 
}: EnhancedXPProgressProps) {
  const xpForCurrentLevel = currentXP;
  const xpNeededForNext = xpForCurrentLevel + xpToNextLevel;
  const progressPercentage = xpNeededForNext > 0 ? (xpForCurrentLevel / xpNeededForNext) * 100 : 0;

  const sizeClasses = {
    small: 'h-2',
    medium: 'h-3',
    large: 'h-4'
  };

  const textSizes = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  const iconSizes = {
    small: 'h-3 w-3',
    medium: 'h-4 w-4',
    large: 'h-5 w-5'
  };

  // Calculate milestone positions (every 25% of progress)
  const milestones = showMilestones ? [25, 50, 75] : [];

  return (
    <div className={cn('space-y-3', className)}>
      {/* Level Badge and XP Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge 
            variant="secondary" 
            className="flex items-center gap-1 bg-yellow-100 text-yellow-800 border-yellow-300"
          >
            <Trophy className={iconSizes[size]} />
            Level {currentLevel}
          </Badge>
          {progressPercentage >= 90 && (
            <Badge variant="outline" className="animate-pulse border-yellow-400 text-yellow-700">
              <Sparkles className="h-3 w-3 mr-1" />
              Almost there!
            </Badge>
          )}
        </div>
        <span className={cn('font-semibold tabular-nums', textSizes[size])}>
          {xpForCurrentLevel}/{xpNeededForNext} XP
        </span>
      </div>

      {/* Enhanced Progress Bar with Milestones */}
      <div className="relative">
        <Progress
          value={progressPercentage}
          className={cn('w-full bg-yellow-50 border border-yellow-200', sizeClasses[size])}
          indicatorClassName={cn(
            'bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-700 ease-out',
            progressPercentage >= 90 && 'animate-pulse'
          )}
        />
        
        {/* Milestone Markers */}
        {showMilestones && milestones.map((milestone) => (
          <div
            key={milestone}
            className={cn(
              'absolute top-1/2 transform -translate-y-1/2 w-0.5 bg-yellow-600',
              sizeClasses[size],
              progressPercentage >= milestone ? 'bg-yellow-600' : 'bg-yellow-300'
            )}
            style={{ left: `${milestone}%` }}
          />
        ))}
        
        {/* Level Up Indicator */}
        <div className="absolute -right-1 top-1/2 transform -translate-y-1/2">
          <div className={cn(
            'bg-yellow-500 text-white rounded-full flex items-center justify-center',
            size === 'small' ? 'w-4 h-4' : size === 'medium' ? 'w-5 h-5' : 'w-6 h-6'
          )}>
            <Star className={cn(iconSizes[size], 'fill-current')} />
          </div>
        </div>
      </div>

      {/* XP to Next Level */}
      <div className="flex items-center justify-between">
        <span className={cn('text-muted-foreground', textSizes[size])}>
          {xpToNextLevel} XP to Level {currentLevel + 1}
        </span>
        {totalXPEarned !== undefined && (
          <span className={cn('text-muted-foreground', textSizes[size])}>
            {totalXPEarned.toLocaleString()} total earned
          </span>
        )}
      </div>

      {/* Progress Percentage Indicator */}
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-100 rounded-full h-1">
          <div 
            className="bg-yellow-500 h-1 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <span className={cn('font-medium text-yellow-700', textSizes[size])}>
          {Math.round(progressPercentage)}%
        </span>
      </div>
    </div>
  );
}
