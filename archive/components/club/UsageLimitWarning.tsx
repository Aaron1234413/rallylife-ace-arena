import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Crown, TrendingUp } from 'lucide-react';
import { ClubSubscription, ClubUsage } from '@/hooks/useClubSubscription';
import { useTierEnforcement } from '@/hooks/useTierEnforcement';

interface UsageLimitWarningProps {
  subscription: ClubSubscription | null;
  usage: ClubUsage | null;
  onUpgrade: () => void;
  compact?: boolean;
}

export function UsageLimitWarning({ 
  subscription, 
  usage, 
  onUpgrade, 
  compact = false 
}: UsageLimitWarningProps) {
  const { usageStatus, getUpgradeRecommendation } = useTierEnforcement(subscription, usage);
  const recommendation = getUpgradeRecommendation();

  if (!recommendation.shouldUpgrade) {
    return null;
  }

  const isAtLimit = usageStatus.isAtMemberLimit || usageStatus.isAtCoachLimit;
  const alertVariant = isAtLimit ? "destructive" : "default";
  
  const getIcon = () => {
    if (recommendation.suggestedTier === 'champions') return Crown;
    if (recommendation.suggestedTier === 'competitive') return TrendingUp;
    return AlertTriangle;
  };

  const Icon = getIcon();

  if (compact) {
    return (
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="text-amber-800 font-medium">
              {isAtLimit ? 'Limit reached' : 'Approaching limits'}
            </span>
          </div>
          <Button size="sm" onClick={onUpgrade} variant="outline" className="border-amber-300">
            Upgrade
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Alert variant={alertVariant} className="border-l-4">
      <Icon className="h-4 w-4" />
      <AlertDescription className="space-y-3">
        <div>
          <p className="font-medium text-sm">
            {isAtLimit ? 'Usage Limit Reached' : 'Approaching Usage Limits'}
          </p>
          <p className="text-sm mt-1">
            {recommendation.reason}
          </p>
        </div>

        {/* Usage Details */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <div className="font-medium">Members</div>
            <div className="text-muted-foreground">
              {usage?.active_members || 0} used • {Math.round(usageStatus.memberUsagePercent)}% capacity
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-medium">Coaches</div>
            <div className="text-muted-foreground">
              {usage?.active_coaches || 0} used • {Math.round(usageStatus.coachUsagePercent)}% capacity
            </div>
          </div>
        </div>

        <Button 
          onClick={onUpgrade} 
          size="sm" 
          className="w-full"
          variant={isAtLimit ? "destructive" : "default"}
        >
          <Icon className="h-4 w-4 mr-2" />
          {recommendation.suggestedTier 
            ? `Upgrade to ${recommendation.suggestedTier.charAt(0).toUpperCase() + recommendation.suggestedTier.slice(1)}`
            : 'Upgrade Plan'
          }
        </Button>
      </AlertDescription>
    </Alert>
  );
}