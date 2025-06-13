
import React from 'react';
import { Heart, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface HPDisplayProps {
  currentHP: number;
  maxHP: number;
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  className?: string;
}

export function HPDisplay({ 
  currentHP, 
  maxHP, 
  size = 'medium', 
  showText = true,
  className 
}: HPDisplayProps) {
  const percentage = (currentHP / maxHP) * 100;
  const isLow = percentage <= 30;
  const isCritical = percentage <= 15;

  const sizeClasses = {
    small: 'h-2',
    medium: 'h-3',
    large: 'h-4'
  };

  const iconSizes = {
    small: 'h-4 w-4',
    medium: 'h-5 w-5',
    large: 'h-6 w-6'
  };

  const textSizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Heart 
        className={cn(
          iconSizes[size],
          isCritical ? 'text-red-500' : isLow ? 'text-orange-500' : 'text-red-400'
        )}
        fill={isCritical ? 'currentColor' : isLow ? 'currentColor' : 'none'}
      />
      
      <div className="flex-1 min-w-0">
        <Progress
          value={percentage}
          className={cn('w-full', sizeClasses[size])}
          indicatorClassName={cn(
            isCritical ? 'bg-red-500' : isLow ? 'bg-orange-500' : 'bg-red-400'
          )}
        />
      </div>

      {showText && (
        <span className={cn(
          'font-semibold tabular-nums',
          textSizes[size],
          isCritical ? 'text-red-500' : isLow ? 'text-orange-500' : 'text-foreground'
        )}>
          {currentHP}/{maxHP}
        </span>
      )}
    </div>
  );
}

interface HPCardProps {
  currentHP: number;
  maxHP: number;
  lastActivity?: string;
  onRestoreHP?: () => void;
  className?: string;
}

export function HPCard({ 
  currentHP, 
  maxHP, 
  lastActivity, 
  onRestoreHP,
  className 
}: HPCardProps) {
  const percentage = (currentHP / maxHP) * 100;
  const isLow = percentage <= 30;

  return (
    <Card className={cn('border-red-200', className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            <span className="font-semibold text-foreground">Health Points</span>
          </div>
          {isLow && onRestoreHP && (
            <button
              onClick={onRestoreHP}
              className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
            >
              <Zap className="h-3 w-3" />
              Use Health Pack
            </button>
          )}
        </div>

        <HPDisplay 
          currentHP={currentHP} 
          maxHP={maxHP} 
          size="large" 
          className="mb-2"
        />

        {lastActivity && (
          <p className="text-xs text-muted-foreground">
            Last activity: {new Date(lastActivity).toLocaleString()}
          </p>
        )}

        {isLow && (
          <p className="text-xs text-orange-600 mt-2">
            ⚠️ Your HP is getting low! Complete activities to restore it.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
