
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Heart,
  Star,
  Coins,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

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
    energyRequirement?: 'low' | 'medium' | 'high';
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
  const isMobile = useIsMobile();
  
  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'low': return 'Easy';
      case 'medium': return 'Moderate';
      case 'high': return 'Challenging';
      default: return 'Normal';
    }
  };

  // Show either AI Recommended OR priority, not both
  const showRecommendedBadge = action.recommended && contextual;
  const showPriorityBadge = !showRecommendedBadge && action.urgency && action.urgency !== 'low';

  // Enhanced keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!disabled && action.availability) {
        onClick();
      }
    }
  };

  return (
    <div 
      className={cn(
        "relative group transition-all duration-300",
        !action.availability && "opacity-60",
        isMobile && "mobile-spacing"
      )}
      role="article"
      aria-labelledby={`action-${action.id}-title`}
      aria-describedby={`action-${action.id}-description`}
    >
      {/* Single Status Badge - Either AI Recommended OR Priority */}
      {showRecommendedBadge && (
        <div 
          className="absolute -top-2 -right-2 z-10"
          role="img"
          aria-label="AI Recommended Activity"
        >
          <Badge className="bg-purple-600 text-white border-0 shadow-md px-2 py-1 text-xs">
            AI Recommended
          </Badge>
        </div>
      )}

      {showPriorityBadge && (
        <div 
          className="absolute -top-2 -left-2 z-10"
          role="status"
          aria-label={`${action.urgency} priority`}
        >
          <Badge 
            className={cn(
              "text-xs font-medium border shadow-sm px-2 py-1",
              action.urgency === 'high' && "bg-red-50 text-red-700 border-red-200",
              action.urgency === 'medium' && "bg-orange-50 text-orange-700 border-orange-200"
            )}
          >
            {action.urgency} priority
          </Badge>
        </div>
      )}

      <Button
        onClick={onClick}
        onKeyDown={handleKeyDown}
        disabled={disabled || !action.availability}
        aria-label={`${action.title}: ${action.description}`}
        className={cn(
          "h-auto w-full p-0 overflow-hidden text-left border-0",
          "transition-all duration-300 hover:shadow-lg hover:scale-[1.02]",
          "touch-feedback mobile-hover-scale",
          isMobile && "mobile-touch-target mobile-button",
          !action.availability && "hover:scale-100 cursor-not-allowed"
        )}
      >
        {/* Improved Background with consistent height */}
        <div className={cn(
          "w-full relative overflow-hidden min-h-[180px] flex flex-col",
          // Convert gradient colors to solid colors with better contrast
          action.id === 'match' && "bg-blue-600",
          action.id === 'training' && "bg-green-600", 
          action.id === 'social' && "bg-purple-600",
          action.id === 'quick_recovery' && "bg-red-600",
          isMobile ? "p-3" : "p-4"
        )}>

          {/* Restructured Header - More compact */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm">
                <Icon 
                  className="h-4 w-4 text-white" 
                  aria-hidden="true"
                />
              </div>
              
              <h3 
                id={`action-${action.id}-title`}
                className="font-bold text-white text-base leading-tight"
              >
                {action.title}
              </h3>
            </div>
          </div>

          {/* Compact badges section */}
          <div className="flex flex-wrap items-center gap-1 mb-2">
            <Badge 
              variant="secondary" 
              className="text-xs bg-white/20 text-white border-white/30 px-2 py-0.5"
            >
              {getDifficultyLabel(action.difficulty || 'medium')}
            </Badge>
            {action.estimatedDuration && (
              <Badge 
                variant="secondary" 
                className="text-xs bg-white/20 text-white border-white/30 px-2 py-0.5"
              >
                <Clock className="h-3 w-3 mr-1" aria-hidden="true" />
                {action.estimatedDuration}min
              </Badge>
            )}
          </div>

          {/* Improved Description with better text sizing */}
          <div className="flex-1 mb-3">
            <p 
              id={`action-${action.id}-description`}
              className="text-xs leading-relaxed text-white/90 line-clamp-3"
              style={{ 
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {action.description}
            </p>
          </div>

          {/* Restructured Rewards - Horizontal layout for space efficiency */}
          <div 
            className="flex items-center justify-between gap-2 mt-auto"
            role="group"
            aria-label="Activity rewards"
          >
            <div 
              className="flex items-center gap-1 bg-white/15 rounded px-2 py-1 flex-1"
              role="listitem"
            >
              <Heart className="h-3 w-3 text-red-300" aria-hidden="true" />
              <div className="text-center">
                <div className="text-white font-bold text-sm">
                  {action.rewards.hp > 0 ? '+' : ''}{action.rewards.hp}
                </div>
                <div className="text-white/70 text-xs">HP</div>
              </div>
            </div>
            
            <div 
              className="flex items-center gap-1 bg-white/15 rounded px-2 py-1 flex-1"
              role="listitem"
            >
              <Star className="h-3 w-3 text-blue-300" aria-hidden="true" />
              <div className="text-center">
                <div className="text-white font-bold text-sm">+{action.rewards.xp}</div>
                <div className="text-white/70 text-xs">XP</div>
              </div>
            </div>
            
            <div 
              className="flex items-center gap-1 bg-white/15 rounded px-2 py-1 flex-1"
              role="listitem"
            >
              <Coins className="h-3 w-3 text-yellow-300" aria-hidden="true" />
              <div className="text-center">
                <div className="text-white font-bold text-sm">+{action.rewards.tokens}</div>
                <div className="text-white/70 text-xs">Tokens</div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div 
              className="absolute inset-0 bg-black/30 backdrop-blur-sm rounded-lg flex items-center justify-center z-20"
              role="status"
              aria-live="polite"
              aria-label="Processing activity"
            >
              <div className="flex items-center gap-3 text-white">
                <div 
                  className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"
                  aria-hidden="true"
                ></div>
                <span className="font-medium">Processing...</span>
              </div>
            </div>
          )}

          {/* Availability Overlay */}
          {!action.availability && (
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-lg flex items-center justify-center z-20"
              role="status"
              aria-live="polite"
              aria-label="Activity not available"
            >
              <div className="text-center text-white p-4">
                <Activity 
                  className="h-8 w-8 mx-auto mb-2 text-red-400" 
                  aria-hidden="true"
                />
                <p className="text-sm font-medium">Not Available</p>
                <p className="text-xs text-white/70">Check requirements</p>
              </div>
            </div>
          )}
        </div>
      </Button>
    </div>
  );
}
