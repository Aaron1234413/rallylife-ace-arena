
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Zap, 
  Star, 
  Heart,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionButtonProps {
  action: {
    id: string;
    title: string;
    description: string;
    icon: any;
    color: string;
    textColor: string;
    bgColor: string;
    rewards: { hp: number; xp: number; tokens: number };
    recommended?: boolean;
    urgency?: 'low' | 'medium' | 'high';
    availability?: boolean;
    estimatedDuration?: number;
    difficulty?: 'low' | 'medium' | 'high';
    contextualInfo?: {
      energyMatch: boolean;
      timeMatch: boolean;
      motivationBoost: boolean;
    };
  };
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  contextual?: boolean;
}

export function ActionButton({ 
  action, 
  onClick, 
  disabled = false, 
  loading = false,
  contextual = false
}: ActionButtonProps) {
  const Icon = action.icon;
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getUrgencyIndicator = (urgency: string) => {
    switch (urgency) {
      case 'high': return { icon: AlertTriangle, color: 'text-red-500', pulse: true };
      case 'medium': return { icon: TrendingUp, color: 'text-orange-500', pulse: false };
      case 'low': return { icon: CheckCircle, color: 'text-green-500', pulse: false };
      default: return { icon: CheckCircle, color: 'text-gray-500', pulse: false };
    }
  };

  const urgencyData = getUrgencyIndicator(action.urgency || 'low');
  const UrgencyIcon = urgencyData.icon;

  return (
    <div className={cn(
      "relative group",
      !action.availability && "opacity-60"
    )}>
      {/* Recommended badge */}
      {action.recommended && contextual && (
        <div className="absolute -top-2 -right-2 z-10">
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg animate-pulse">
            <Sparkles className="h-3 w-3 mr-1" />
            Recommended
          </Badge>
        </div>
      )}

      <Button
        onClick={onClick}
        disabled={disabled || !action.availability}
        className={cn(
          "h-auto w-full p-4 flex flex-col items-start gap-3 text-left transition-all duration-300",
          action.color,
          "hover:shadow-lg hover:scale-[1.02] group-hover:shadow-xl",
          action.recommended && contextual && "ring-2 ring-purple-300 ring-offset-2",
          !action.availability && "hover:scale-100 cursor-not-allowed",
          urgencyData.pulse && "animate-pulse"
        )}
      >
        {/* Header with icon and title */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <Icon className={cn(
              "h-5 w-5 transition-transform duration-200",
              "group-hover:scale-110"
            )} />
            <div>
              <h3 className="font-semibold text-white">{action.title}</h3>
              {contextual && action.urgency && (
                <div className="flex items-center gap-1 mt-1">
                  <UrgencyIcon className={cn("h-3 w-3", urgencyData.color)} />
                  <span className="text-xs text-white/80 capitalize">
                    {action.urgency} priority
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {action.difficulty && (
            <Badge 
              variant="secondary" 
              className={cn(
                "text-xs font-medium border",
                getDifficultyColor(action.difficulty)
              )}
            >
              {action.difficulty}
            </Badge>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-white/90 leading-relaxed">
          {action.description}
        </p>

        {/* Contextual insights */}
        {contextual && action.contextualInfo && (
          <div className="flex gap-2 text-xs">
            {action.contextualInfo.energyMatch && (
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                <Zap className="h-3 w-3 mr-1" />
                Energy Match
              </Badge>
            )}
            {action.contextualInfo.timeMatch && (
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                <Clock className="h-3 w-3 mr-1" />
                Perfect Timing
              </Badge>
            )}
            {action.contextualInfo.motivationBoost && (
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                <Star className="h-3 w-3 mr-1" />
                High Motivation
              </Badge>
            )}
          </div>
        )}

        {/* Rewards and duration */}
        <div className="flex items-center justify-between w-full text-xs text-white/80">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {action.rewards.hp > 0 ? '+' : ''}{action.rewards.hp} HP
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              +{action.rewards.xp} XP
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
              +{action.rewards.tokens}
            </span>
          </div>
          
          {action.estimatedDuration && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {action.estimatedDuration}min
            </span>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
          </div>
        )}
      </Button>
    </div>
  );
}
