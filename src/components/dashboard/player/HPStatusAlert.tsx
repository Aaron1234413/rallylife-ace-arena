
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Sparkles, 
  AlertTriangle,
  CheckCircle,
  Zap,
  Activity,
  Users,
  GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getHPRecommendations, calculateSessionCosts } from '@/utils/sessionCalculations';

interface HPStatusAlertProps {
  hpPercentage: number;
  currentHP: number;
  maxHP: number;
  onOpenRecoveryCenter: () => void;
  onQuickRestore: () => Promise<void>;
  className?: string;
}

export function HPStatusAlert({ 
  hpPercentage, 
  currentHP, 
  maxHP, 
  onOpenRecoveryCenter, 
  onQuickRestore,
  className 
}: HPStatusAlertProps) {
  const getStatusConfig = () => {
    // Get session capacity recommendations
    const recommendations = getHPRecommendations(currentHP, 'match');
    const capacityText = recommendations.length > 0 ? recommendations[0] : '';
    
    if (hpPercentage >= 80) {
      return {
        icon: CheckCircle,
        iconColor: 'text-green-500',
        message: 'Excellent health! You\'re ready for any challenge.',
        subMessage: capacityText || 'Keep up the great work with consistent activity!',
        bgColor: 'bg-green-50 border-green-200',
        showAction: false,
        showCapacity: true,
        ariaLabel: 'Health status is excellent'
      };
    }
    
    if (hpPercentage >= 60) {
      return {
        icon: Heart,
        iconColor: 'text-blue-500',
        message: 'Good health status. Stay active to maintain your momentum.',
        subMessage: capacityText || 'Consider a light training session to boost your HP.',
        bgColor: 'bg-blue-50 border-blue-200',
        showAction: false,
        showCapacity: true,
        ariaLabel: 'Health status is good'
      };
    }
    
    if (hpPercentage >= 40) {
      return {
        icon: AlertTriangle,
        iconColor: 'text-yellow-500',
        message: 'Your HP is getting low. Time for some wellbeing!',
        subMessage: capacityText || 'Regular wellbeing sessions help maintain peak performance.',
        bgColor: 'bg-yellow-50 border-yellow-200',
        showAction: true,
        showCapacity: true,
        actionText: 'Open Recovery Center',
        actionVariant: 'outline' as const,
        ariaLabel: 'Health status is fair - recovery recommended'
      };
    }
    
    if (hpPercentage >= 20) {
      return {
        icon: AlertTriangle,
        iconColor: 'text-orange-500',
        message: 'Low HP detected! Recovery is strongly recommended.',
        subMessage: capacityText || 'Don\'t push yourself too hard - rest and recharge.',
        bgColor: 'bg-orange-50 border-orange-200',
        showAction: true,
        showCapacity: true,
        actionText: 'Start Recovery Now',
        actionVariant: 'default' as const,
        ariaLabel: 'Health status is low - recovery strongly recommended'
      };
    }
    
    return {
      icon: Zap,
      iconColor: 'text-red-500',
      message: 'CRITICAL: Your HP is dangerously low!',
      subMessage: capacityText || 'Immediate recovery is essential for your wellbeing.',
      bgColor: 'bg-red-50 border-red-200',
      showAction: true,
      showCapacity: false, // Don't show capacity recommendations in critical state
      actionText: 'Emergency Recovery',
      actionVariant: 'destructive' as const,
      showQuickRestore: true,
      ariaLabel: 'Critical health status - immediate recovery required'
    };
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div 
      className={cn(
        "p-3 sm:p-4 rounded-lg border-2 transition-all duration-300",
        config.bgColor,
        className
      )}
      role="alert"
      aria-label={config.ariaLabel}
    >
      <div className="flex items-start gap-3">
        <Icon 
          className={cn("h-5 w-5 mt-0.5 flex-shrink-0", config.iconColor)} 
          aria-hidden="true"
        />
        <div className="flex-1 space-y-2">
          <div>
            <p className="font-medium text-gray-900 text-sm sm:text-base">{config.message}</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">{config.subMessage}</p>
          </div>
          
          {config.showAction && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Button
                size="sm"
                variant={config.actionVariant}
                onClick={onOpenRecoveryCenter}
                className={cn(
                  "flex items-center justify-center gap-2 text-sm",
                  "min-h-[44px] touch-manipulation", // Mobile touch target
                  "focus:ring-2 focus:ring-offset-2 focus:outline-none"
                )}
                aria-describedby="recovery-action-description"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                {config.actionText}
              </Button>
              
              {config.showQuickRestore && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onQuickRestore}
                  className={cn(
                    "flex items-center justify-center gap-2 border-red-200 text-red-700 hover:bg-red-50 text-sm",
                    "min-h-[44px] touch-manipulation", // Mobile touch target
                    "focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:outline-none"
                  )}
                  aria-describedby="quick-restore-description"
                >
                  <Heart className="h-4 w-4" aria-hidden="true" />
                  <span className="whitespace-nowrap">+10 HP Quick Restore</span>
                </Button>
              )}
            </div>
          )}

          {/* Session Capacity Recommendations - Compact Layout */}
          {config.showCapacity && hpPercentage >= 20 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <h4 className="text-xs font-medium text-gray-700 flex items-center gap-1 mb-2">
                <Activity className="h-3 w-3" />
                Session Capacity
              </h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {/* Calculate what sessions are available */}
                {(() => {
                  const matchCost = calculateSessionCosts('match', 90).hpCost;
                  const trainingCost = calculateSessionCosts('training', 60).hpCost;
                  const socialCost = calculateSessionCosts('social_play', 45).hpCost;
                  
                  const sessions = [
                    {
                      key: 'match',
                      icon: Zap,
                      label: 'Matches',
                      cost: matchCost,
                      color: 'text-blue-600'
                    },
                    {
                      key: 'training',
                      icon: GraduationCap,
                      label: 'Training',
                      cost: trainingCost,
                      color: 'text-green-600'
                    },
                    {
                      key: 'social',
                      icon: Users,
                      label: 'Social',
                      cost: socialCost,
                      color: 'text-purple-600'
                    }
                  ];
                  
                  return sessions.map((session) => {
                    const SessionIcon = session.icon;
                    const count = currentHP >= session.cost ? Math.floor(currentHP / session.cost) : 0;
                    const available = count > 0;
                    
                    return (
                      <div 
                        key={session.key} 
                        className={`flex flex-col items-center p-2 rounded border ${
                          available 
                            ? `${session.color} bg-gray-50 border-gray-200` 
                            : 'text-gray-400 bg-gray-25 border-gray-100'
                        }`}
                      >
                        <SessionIcon className="h-3 w-3 mb-1" />
                        <span className="text-xs font-medium">{session.label}</span>
                        <Badge 
                          variant={available ? "default" : "outline"} 
                          className="text-xs h-4 px-1 mt-1"
                        >
                          {count}
                        </Badge>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}
          
          {/* Screen reader descriptions */}
          <div className="sr-only">
            <div id="recovery-action-description">
              Opens the wellbeing center where you can join or create wellbeing sessions
            </div>
            <div id="quick-restore-description">
              Instantly restores 10 health points for emergency situations
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
