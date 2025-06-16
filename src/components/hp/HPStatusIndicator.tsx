
import React from 'react';
import { Heart, AlertTriangle, Battery, BatteryLow, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface HPStatusIndicatorProps {
  currentHP: number;
  maxHP: number;
  showDetails?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function HPStatusIndicator({ 
  currentHP, 
  maxHP, 
  showDetails = true,
  size = 'medium',
  className 
}: HPStatusIndicatorProps) {
  const percentage = (currentHP / maxHP) * 100;
  
  const getHPStatus = (percentage: number) => {
    if (percentage >= 80) return {
      label: 'Excellent',
      icon: Zap,
      color: 'bg-green-500',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      description: 'You\'re energized and ready for action!'
    };
    if (percentage >= 60) return {
      label: 'Good',
      icon: Battery,
      color: 'bg-blue-500',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      description: 'Feeling good with plenty of energy.'
    };
    if (percentage >= 40) return {
      label: 'Fair',
      icon: BatteryLow,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      description: 'Getting tired, consider lighter activities.'
    };
    if (percentage >= 20) return {
      label: 'Low',
      icon: AlertTriangle,
      color: 'bg-orange-500',
      textColor: 'text-orange-700',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      description: 'Low energy - time for some rest.'
    };
    return {
      label: 'Critical',
      icon: Heart,
      color: 'bg-red-500',
      textColor: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      description: 'Rest needed immediately!'
    };
  };

  const status = getHPStatus(percentage);
  const Icon = status.icon;

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

  return (
    <div className={cn('space-y-3', className)}>
      {/* Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn('p-1.5 rounded-lg', status.color)}>
            <Icon className={cn(iconSizes[size], 'text-white')} />
          </div>
          <div>
            <Badge 
              variant="secondary" 
              className={cn(status.bgColor, status.textColor, status.borderColor)}
            >
              {status.label}
            </Badge>
            {showDetails && (
              <p className={cn('text-muted-foreground mt-1', textSizes[size])}>
                {status.description}
              </p>
            )}
          </div>
        </div>
        <span className={cn('font-semibold tabular-nums', textSizes[size])}>
          {currentHP}/{maxHP}
        </span>
      </div>

      {/* Animated Progress Bar */}
      <div className="space-y-2">
        <Progress
          value={percentage}
          className={cn('w-full', sizeClasses[size])}
          indicatorClassName={cn(
            'transition-all duration-1000 ease-out',
            status.color,
            percentage <= 20 && 'animate-pulse'
          )}
        />
        
        {/* HP Recovery Rate Indicator */}
        {percentage < 50 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Heart className="h-3 w-3" />
            <span>Recovers 1 HP every 30 minutes</span>
          </div>
        )}
      </div>

      {/* Critical Warning */}
      {percentage <= 20 && (
        <div className={cn(
          'p-2 rounded-lg border-l-4 animate-pulse',
          status.bgColor,
          status.borderColor
        )}>
          <div className="flex items-center gap-2">
            <AlertTriangle className={cn(iconSizes[size], status.textColor)} />
            <span className={cn('font-medium', status.textColor, textSizes[size])}>
              Critical HP - Rest recommended!
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
