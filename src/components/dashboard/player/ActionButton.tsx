
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Trophy, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionButtonProps {
  action: {
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    textColor: string;
    bgColor: string;
    rewards: { hp: number; xp: number; tokens: number };
    recommended: boolean;
    estimatedDuration: number;
    difficulty: 'low' | 'medium' | 'high';
  };
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
}

export function ActionButton({ action, onClick, disabled, loading }: ActionButtonProps) {
  const Icon = action.icon;

  // For training sessions, show minimum HP benefit from lessons with coaches
  const getHPDisplay = () => {
    if (action.id === 'training') {
      return (
        <div className="flex items-center gap-1">
          <Heart className="h-3 w-3 text-green-500" />
          <span className="text-xs text-green-600">+5 HP</span>
        </div>
      );
    }
    
    // For meditation, show variable HP reward
    if (action.id === 'meditation') {
      return (
        <div className="flex items-center gap-1">
          <Heart className="h-3 w-3 text-purple-500" />
          <span className="text-xs text-purple-600">+5-12 HP</span>
        </div>
      );
    }
    
    const hpColor = action.rewards.hp >= 0 ? 'text-green-600' : 'text-red-500';
    return (
      <div className="flex items-center gap-1">
        <Heart className={`h-3 w-3 ${action.rewards.hp >= 0 ? 'text-green-500' : 'text-red-500'}`} />
        <span className={`text-xs ${hpColor}`}>
          {action.rewards.hp > 0 ? '+' : ''}{action.rewards.hp} HP
        </span>
      </div>
    );
  };

  return (
    <div className={cn(
      'relative p-4 rounded-lg border-2 transition-all duration-200',
      action.recommended 
        ? 'border-green-300 bg-green-50' 
        : 'border-gray-200 bg-white hover:border-gray-300'
    )}>
      {action.recommended && (
        <Badge className="absolute -top-2 -right-2 bg-green-600 text-white text-xs px-2 py-1">
          Recommended
        </Badge>
      )}
      
      <div className="flex items-start gap-3 mb-3">
        <div className={cn('p-2 rounded-lg', action.bgColor)}>
          <Icon className={cn('h-5 w-5', action.textColor)} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
          <p className="text-sm text-gray-600">{action.description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-gray-400" />
          <span className="text-xs text-gray-600">{action.estimatedDuration} min</span>
        </div>
        <Badge variant="outline" className="text-xs">
          {action.difficulty} intensity
        </Badge>
      </div>

      <div className="flex items-center justify-between mb-4">
        {getHPDisplay()}
        <div className="flex items-center gap-1">
          <Trophy className="h-3 w-3 text-yellow-500" />
          <span className="text-xs text-yellow-600">+{action.rewards.xp} XP</span>
        </div>
      </div>

      <Button
        onClick={onClick}
        disabled={disabled || loading}
        className={cn(
          'w-full text-white',
          action.color,
          'hover:opacity-90'
        )}
      >
        {loading ? 'Starting...' : `Start ${action.title}`}
      </Button>
    </div>
  );
}
