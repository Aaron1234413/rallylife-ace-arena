
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Sparkles, 
  AlertTriangle,
  CheckCircle,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
    if (hpPercentage >= 80) {
      return {
        icon: CheckCircle,
        iconColor: 'text-green-500',
        message: 'Excellent health! You\'re ready for any challenge.',
        subMessage: 'Keep up the great work with consistent activity!',
        bgColor: 'bg-green-50 border-green-200',
        showAction: false
      };
    }
    
    if (hpPercentage >= 60) {
      return {
        icon: Heart,
        iconColor: 'text-blue-500',
        message: 'Good health status. Stay active to maintain your momentum.',
        subMessage: 'Consider a light training session to boost your HP.',
        bgColor: 'bg-blue-50 border-blue-200',
        showAction: false
      };
    }
    
    if (hpPercentage >= 40) {
      return {
        icon: AlertTriangle,
        iconColor: 'text-yellow-500',
        message: 'Your HP is getting low. Time for some recovery!',
        subMessage: 'Regular recovery helps maintain peak performance.',
        bgColor: 'bg-yellow-50 border-yellow-200',
        showAction: true,
        actionText: 'Open Recovery Center',
        actionVariant: 'outline' as const
      };
    }
    
    if (hpPercentage >= 20) {
      return {
        icon: AlertTriangle,
        iconColor: 'text-orange-500',
        message: 'Low HP detected! Recovery is strongly recommended.',
        subMessage: 'Don\'t push yourself too hard - rest and recharge.',
        bgColor: 'bg-orange-50 border-orange-200',
        showAction: true,
        actionText: 'Start Recovery Now',
        actionVariant: 'default' as const
      };
    }
    
    return {
      icon: Zap,
      iconColor: 'text-red-500',
      message: 'CRITICAL: Your HP is dangerously low!',
      subMessage: 'Immediate recovery is essential for your wellbeing.',
      bgColor: 'bg-red-50 border-red-200',
      showAction: true,
      actionText: 'Emergency Recovery',
      actionVariant: 'destructive' as const,
      showQuickRestore: true
    };
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={cn(
      "p-4 rounded-lg border-2 transition-all duration-300",
      config.bgColor,
      className
    )}>
      <div className="flex items-start gap-3">
        <Icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", config.iconColor)} />
        <div className="flex-1 space-y-2">
          <div>
            <p className="font-medium text-gray-900">{config.message}</p>
            <p className="text-sm text-gray-600 mt-1">{config.subMessage}</p>
          </div>
          
          {config.showAction && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={config.actionVariant}
                onClick={onOpenRecoveryCenter}
                className="flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {config.actionText}
              </Button>
              
              {config.showQuickRestore && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onQuickRestore}
                  className="flex items-center gap-2 border-red-200 text-red-700 hover:bg-red-50"
                >
                  <Heart className="h-4 w-4" />
                  +10 HP Quick Restore
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
