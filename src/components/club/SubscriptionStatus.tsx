import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Crown, Users, UserCheck, Settings, TrendingUp } from 'lucide-react';
import { useSubscriptionTiers, SubscriptionTier } from '@/hooks/useSubscriptionTiers';
import { ClubSubscription, ClubUsage, useClubSubscription } from '@/hooks/useClubSubscription';
import { useTierEnforcement } from '@/hooks/useTierEnforcement';

interface SubscriptionStatusProps {
  clubId: string;
  subscription: ClubSubscription | null;
  usage: ClubUsage | null;
  onUpgrade: () => void;
}

export function SubscriptionStatus({ clubId, subscription, usage, onUpgrade }: SubscriptionStatusProps) {
  const { tiers } = useSubscriptionTiers();
  const { openCustomerPortal } = useClubSubscription(clubId);
  const { tierLimits, usageStatus } = useTierEnforcement(subscription, usage);

  const currentTier = tiers.find(t => t.id === subscription?.tier_id) || tiers[0];

  const getTierIcon = (tierId: string) => {
    switch (tierId) {
      case 'community': return Users;
      case 'competitive': return TrendingUp;
      case 'champions': return Crown;
      default: return Users;
    }
  };

  const getTierColor = (tierId: string) => {
    switch (tierId) {
      case 'community': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'competitive': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'champions': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const TierIcon = getTierIcon(currentTier.id);
  const isActive = subscription?.status === 'active';

  return (
    <div className="space-y-6">
      {/* Current Tier Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-tennis-green-primary/10 to-tennis-green-primary/5 rounded-lg">
                <TierIcon className="h-5 w-5 text-tennis-green-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Subscription Status</CardTitle>
                <p className="text-sm text-tennis-green-medium">Current plan and usage</p>
              </div>
            </div>
            <Badge className={getTierColor(currentTier.id)}>
              {currentTier.name}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Tier Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-tennis-green-bg/30 rounded-lg">
              <div className="text-2xl font-bold text-tennis-green-dark">
                ${currentTier.price_monthly}
              </div>
              <div className="text-sm text-tennis-green-medium">per month</div>
            </div>
            <div className="text-center p-4 bg-tennis-green-bg/30 rounded-lg">
              <div className="text-2xl font-bold text-tennis-green-dark">
                {tierLimits.memberLimit}
              </div>
              <div className="text-sm text-tennis-green-medium">member limit</div>
            </div>
            <div className="text-center p-4 bg-tennis-green-bg/30 rounded-lg">
              <div className="text-2xl font-bold text-tennis-green-dark">
                {tierLimits.coachLimit}
              </div>
              <div className="text-sm text-tennis-green-medium">coach limit</div>
            </div>
          </div>

          {/* Usage Progress */}
          {usage && (
            <div className="space-y-4">
              <h4 className="font-medium text-tennis-green-dark">Current Usage</h4>
              
              {/* Members Usage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-tennis-green-medium">Members</span>
                  <span className="text-tennis-green-dark font-medium">
                    {usage.active_members} / {tierLimits.memberLimit}
                  </span>
                </div>
                <Progress 
                  value={usageStatus.memberUsagePercent} 
                  className="h-2"
                />
                {usageStatus.isNearMemberLimit && (
                  <p className="text-xs text-amber-600">
                    {usageStatus.isAtMemberLimit ? 'At member limit' : 'Approaching member limit'}
                  </p>
                )}
              </div>

              {/* Coaches Usage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-tennis-green-medium">Coaches</span>
                  <span className="text-tennis-green-dark font-medium">
                    {usage.active_coaches} / {tierLimits.coachLimit}
                  </span>
                </div>
                <Progress 
                  value={usageStatus.coachUsagePercent} 
                  className="h-2"
                />
                {usageStatus.isNearCoachLimit && (
                  <p className="text-xs text-amber-600">
                    {usageStatus.isAtCoachLimit ? 'At coach limit' : 'Approaching coach limit'}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Features */}
          <div className="space-y-3">
            <h4 className="font-medium text-tennis-green-dark">Plan Features</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {currentTier.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <UserCheck className="h-3 w-3 text-tennis-green-primary flex-shrink-0" />
                  <span className="text-tennis-green-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button 
              onClick={onUpgrade}
              variant="default"
              className="flex-1"
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade Plan
            </Button>
            
            {subscription?.stripe_subscription_id && (
              <Button 
                onClick={openCustomerPortal}
                variant="outline"
                className="flex-1"
              >
                <Settings className="h-4 w-4 mr-2" />
                Manage Billing
              </Button>
            )}
          </div>

          {/* Status Info */}
          {subscription && (
            <div className="text-xs text-tennis-green-medium space-y-1 pt-2 border-t">
              <div>Status: <span className="capitalize">{subscription.status}</span></div>
              {subscription.current_period_end && (
                <div>
                  Next billing: {new Date(subscription.current_period_end).toLocaleDateString()}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}