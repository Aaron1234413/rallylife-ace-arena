
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Zap, 
  Star, 
  Heart,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Coins,
  Activity,
  Target
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
    energyRequirement?: 'low' | 'medium' | 'high';
    contextualInfo?: {
      energyMatch: boolean;
      timeMatch: boolean;
      motivationBoost: boolean;
      varietyBonus: boolean;
      perfectTiming: boolean;
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
  
  const getDifficultyConfig = (difficulty: string) => {
    switch (difficulty) {
      case 'low': 
        return { 
          color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
          progress: 85,
          icon: CheckCircle
        };
      case 'medium': 
        return { 
          color: 'bg-amber-100 text-amber-700 border-amber-200',
          progress: 65,
          icon: Activity
        };
      case 'high': 
        return { 
          color: 'bg-rose-100 text-rose-700 border-rose-200',
          progress: 40,
          icon: Target
        };
      default: 
        return { 
          color: 'bg-gray-100 text-gray-700 border-gray-200',
          progress: 50,
          icon: Activity
        };
    }
  };

  const getEnergyConfig = (energyReq: string) => {
    switch (energyReq) {
      case 'low': return { bars: 1, color: 'bg-green-400' };
      case 'medium': return { bars: 2, color: 'bg-yellow-400' };
      case 'high': return { bars: 3, color: 'bg-red-400' };
      default: return { bars: 1, color: 'bg-gray-400' };
    }
  };

  const getUrgencyIndicator = (urgency: string) => {
    switch (urgency) {
      case 'high': return { 
        icon: AlertTriangle, 
        color: 'text-red-500', 
        bg: 'bg-red-50 border-red-200',
        pulse: true 
      };
      case 'medium': return { 
        icon: TrendingUp, 
        color: 'text-orange-500', 
        bg: 'bg-orange-50 border-orange-200',
        pulse: false 
      };
      case 'low': return { 
        icon: CheckCircle, 
        color: 'text-green-500', 
        bg: 'bg-green-50 border-green-200',
        pulse: false 
      };
      default: return { 
        icon: CheckCircle, 
        color: 'text-gray-500', 
        bg: 'bg-gray-50 border-gray-200',
        pulse: false 
      };
    }
  };

  const difficultyConfig = getDifficultyConfig(action.difficulty || 'medium');
  const energyConfig = getEnergyConfig(action.energyRequirement || 'medium');
  const urgencyData = getUrgencyIndicator(action.urgency || 'low');
  const UrgencyIcon = urgencyData.icon;
  const DifficultyIcon = difficultyConfig.icon;

  // Calculate completion likelihood based on various factors
  const getCompletionLikelihood = () => {
    let likelihood = difficultyConfig.progress;
    
    if (action.contextualInfo?.energyMatch) likelihood += 10;
    if (action.contextualInfo?.timeMatch) likelihood += 10;
    if (action.contextualInfo?.perfectTiming) likelihood += 15;
    if (action.recommended) likelihood += 5;
    
    return Math.min(likelihood, 95);
  };

  const completionLikelihood = getCompletionLikelihood();

  return (
    <div className={cn(
      "relative group transition-all duration-300",
      !action.availability && "opacity-60"
    )}>
      {/* Enhanced Recommended Badge */}
      {action.recommended && contextual && (
        <div className="absolute -top-3 -right-3 z-20">
          <div className="relative">
            <Badge className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white border-0 shadow-lg animate-pulse px-3 py-1">
              <Sparkles className="h-3 w-3 mr-1 animate-spin" />
              AI Recommended
            </Badge>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-full blur opacity-30 animate-pulse"></div>
          </div>
        </div>
      )}

      {/* Enhanced Priority Indicator */}
      {contextual && action.urgency && action.urgency !== 'low' && (
        <div className="absolute -top-2 -left-2 z-10">
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border shadow-md",
            urgencyData.bg,
            urgencyData.pulse && "animate-pulse"
          )}>
            <UrgencyIcon className={cn("h-3 w-3", urgencyData.color)} />
            <span className={urgencyData.color}>
              {action.urgency} priority
            </span>
          </div>
        </div>
      )}

      <Button
        onClick={onClick}
        disabled={disabled || !action.availability}
        className={cn(
          "h-auto w-full p-0 overflow-hidden text-left transition-all duration-300 border-0",
          "hover:shadow-xl hover:scale-[1.02] group-hover:shadow-2xl",
          action.recommended && contextual && "ring-2 ring-purple-300 ring-offset-4 ring-offset-background",
          !action.availability && "hover:scale-100 cursor-not-allowed",
          urgencyData.pulse && "animate-pulse"
        )}
      >
        {/* Enhanced Gradient Background */}
        <div className={cn(
          "w-full p-5 relative overflow-hidden",
          action.color,
          "bg-gradient-to-br from-black/0 via-black/5 to-black/20"
        )}>
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
          </div>

          {/* Header Section */}
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Icon className="h-6 w-6 text-white drop-shadow-sm" />
                </div>
                {/* Energy Requirement Indicator */}
                <div className="absolute -bottom-1 -right-1 flex gap-0.5">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-1 h-2 rounded-full",
                        i < energyConfig.bars ? energyConfig.color : "bg-white/30"
                      )}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-bold text-white text-lg mb-1 drop-shadow-sm">
                  {action.title}
                </h3>
                <div className="flex items-center gap-2">
                  {action.difficulty && (
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "text-xs font-medium border backdrop-blur-sm",
                        "bg-white/20 text-white border-white/30"
                      )}
                    >
                      <DifficultyIcon className="h-3 w-3 mr-1" />
                      {action.difficulty}
                    </Badge>
                  )}
                  {action.estimatedDuration && (
                    <Badge 
                      variant="secondary" 
                      className="text-xs bg-white/20 text-white border-white/30 backdrop-blur-sm"
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {action.estimatedDuration}min
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Description */}
          <p className="text-sm text-white/90 leading-relaxed mb-4 drop-shadow-sm">
            {action.description}
          </p>

          {/* Success Likelihood Indicator */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-white/80 mb-2">
              <span className="font-medium">Success Likelihood</span>
              <span className="font-bold">{completionLikelihood}%</span>
            </div>
            <Progress 
              value={completionLikelihood} 
              className="h-2 bg-white/20"
              indicatorClassName={cn(
                "bg-gradient-to-r transition-all duration-1000",
                completionLikelihood >= 80 ? "from-green-400 to-emerald-500" :
                completionLikelihood >= 60 ? "from-yellow-400 to-amber-500" :
                "from-orange-400 to-red-500"
              )}
            />
          </div>

          {/* Enhanced Contextual Insights */}
          {contextual && action.contextualInfo && (
            <div className="flex flex-wrap gap-2 mb-4">
              {action.contextualInfo.energyMatch && (
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs backdrop-blur-sm">
                  <Zap className="h-3 w-3 mr-1 text-yellow-300" />
                  Energy Match
                </Badge>
              )}
              {action.contextualInfo.timeMatch && (
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs backdrop-blur-sm">
                  <Clock className="h-3 w-3 mr-1 text-blue-300" />
                  Perfect Timing
                </Badge>
              )}
              {action.contextualInfo.perfectTiming && (
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs backdrop-blur-sm">
                  <Target className="h-3 w-3 mr-1 text-green-300" />
                  Optimal Window
                </Badge>
              )}
              {action.contextualInfo.varietyBonus && (
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs backdrop-blur-sm">
                  <Sparkles className="h-3 w-3 mr-1 text-purple-300" />
                  Variety Bonus
                </Badge>
              )}
            </div>
          )}

          {/* Enhanced Rewards Display */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20">
              <div className="p-1 rounded bg-red-500/20">
                <Heart className="h-3 w-3 text-red-300" />
              </div>
              <div>
                <div className="text-white/60 text-xs">HP</div>
                <div className="font-bold text-white">
                  {action.rewards.hp > 0 ? '+' : ''}{action.rewards.hp}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20">
              <div className="p-1 rounded bg-blue-500/20">
                <Star className="h-3 w-3 text-blue-300" />
              </div>
              <div>
                <div className="text-white/60 text-xs">XP</div>
                <div className="font-bold text-white">+{action.rewards.xp}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20">
              <div className="p-1 rounded bg-yellow-500/20">
                <Coins className="h-3 w-3 text-yellow-300" />
              </div>
              <div>
                <div className="text-white/60 text-xs">Tokens</div>
                <div className="font-bold text-white">+{action.rewards.tokens}</div>
              </div>
            </div>
          </div>

          {/* Enhanced Loading State */}
          {loading && (
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm rounded-lg flex items-center justify-center z-20">
              <div className="flex items-center gap-3 text-white">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                <span className="font-medium">Processing...</span>
              </div>
            </div>
          )}

          {/* Availability Overlay */}
          {!action.availability && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-lg flex items-center justify-center z-20">
              <div className="text-center text-white p-4">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-400" />
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
