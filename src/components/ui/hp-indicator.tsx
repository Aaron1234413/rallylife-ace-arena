import React from 'react';
import { Heart, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface HPIndicatorProps {
  currentHP: number;
  maxHP?: number;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  showText?: boolean;
  className?: string;
}

export function HPIndicator({ 
  currentHP, 
  maxHP = 100, 
  size = 'md',
  showProgress = false,
  showText = true,
  className 
}: HPIndicatorProps) {
  const percentage = Math.max(0, Math.min(100, (currentHP / maxHP) * 100));
  
  const getHPColor = (hp: number) => {
    if (hp >= 70) return 'text-green-600';
    if (hp >= 40) return 'text-yellow-600';
    if (hp >= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  const getHPBackgroundColor = (hp: number) => {
    if (hp >= 70) return 'bg-green-100 border-green-200';
    if (hp >= 40) return 'bg-yellow-100 border-yellow-200';
    if (hp >= 20) return 'bg-orange-100 border-orange-200';
    return 'bg-red-100 border-red-200';
  };

  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  if (showProgress) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Heart className={cn(sizeClasses[size], getHPColor(percentage))} />
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            {showText && (
              <span className={cn(textSizeClasses[size], 'font-medium', getHPColor(percentage))}>
                {currentHP}/{maxHP} HP
              </span>
            )}
            <span className={cn('text-xs', getHPColor(percentage))}>
              {Math.round(percentage)}%
            </span>
          </div>
          <Progress 
            value={percentage} 
            className="h-2"
          />
        </div>
      </div>
    );
  }

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'flex items-center gap-1', 
        getHPBackgroundColor(percentage),
        getHPColor(percentage),
        className
      )}
    >
      <Heart className={sizeClasses[size]} />
      {showText && (
        <span className={textSizeClasses[size]}>
          {currentHP}{maxHP !== 100 && `/${maxHP}`} HP
        </span>
      )}
    </Badge>
  );
}

interface HPWarningProps {
  requiredHP: number;
  currentHP: number;
  sessionType: string;
  className?: string;
}

export function HPWarning({ requiredHP, currentHP, sessionType, className }: HPWarningProps) {
  const isInsufficient = currentHP < requiredHP;
  
  if (!isInsufficient) return null;

  return (
    <div className={cn(
      'flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md text-red-800',
      className
    )}>
      <Zap className="h-4 w-4 text-red-600" />
      <div className="text-sm">
        <span className="font-medium">Insufficient HP:</span> {sessionType} requires {requiredHP} HP, you have {currentHP}
      </div>
    </div>
  );
}