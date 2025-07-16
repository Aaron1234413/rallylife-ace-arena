import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Crown,
  Check,
  Zap,
  Shield,
  Users,
  Coins,
  TrendingUp
} from 'lucide-react';
import { useClubSubscription } from '@/hooks/useClubSubscription';
import { useSubscriptionTiers } from '@/hooks/useSubscriptionTiers';

interface ClubSubscriptionManagementProps {
  club: {
    id: string;
    name: string;
  };
  isOwner: boolean;
}

export function ClubSubscriptionManagement({ club, isOwner }: ClubSubscriptionManagementProps) {
  const { subscription, loading: subLoading, createSubscription, upgradeSubscription } = useClubSubscription(club.id);
  const { tiers, loading: tiersLoading } = useSubscriptionTiers();

  const currentTierId = subscription?.tier_id || 'community';

  const getTierIcon = (tierId: string) => {
    switch (tierId) {
      case 'community': return Users;
      case 'core': return Zap;
      case 'plus': return Shield;
      case 'pro': return Crown;
      default: return Users;
    }
  };

  const getTierColor = (tierId: string) => {
    switch (tierId) {
      case 'community': return 'bg-gray-500';
      case 'core': return 'bg-blue-500';
      case 'plus': return 'bg-purple-500';
      case 'pro': return 'bg-amber-500';
      default: return 'bg-gray-500';
    }
  };

  if (tiersLoading || subLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            Current Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg border border-amber-200">
            <div className={`w-12 h-12 ${getTierColor(currentTierId)} rounded-full flex items-center justify-center`}>
              {React.createElement(getTierIcon(currentTierId), { className: "h-6 w-6 text-white" })}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 capitalize">
                {currentTierId === 'community' ? 'Community Free Plan' : `${currentTierId} Plan`}
              </h3>
              <p className="text-sm text-amber-700">
                {currentTierId === 'community' ? '$0/month' : `$${tiers.find(t => t.id === currentTierId)?.price_monthly}/month`}
              </p>
            </div>
            <Badge className="bg-amber-200 text-amber-800">
              Active
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Tiers */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {tiers.map((tier) => {
          const Icon = getTierIcon(tier.id);
          const isCurrentTier = tier.id === currentTierId;
          const canUpgrade = isOwner && !isCurrentTier && tier.price_monthly > (tiers.find(t => t.id === currentTierId)?.price_monthly || 0);
          
          return (
            <Card key={tier.id} className={`relative ${isCurrentTier ? 'ring-2 ring-emerald-500 shadow-lg' : ''}`}>
              {tier.id === 'plus' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-500 text-white">Most Popular</Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-2">
                <div className={`w-12 h-12 ${getTierColor(tier.id)} rounded-full mx-auto flex items-center justify-center mb-2`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">{tier.name}</CardTitle>
                <div className="text-2xl font-bold">
                  {tier.price_monthly === 0 ? 'Free' : `$${tier.price_monthly}`}
                  {tier.price_monthly > 0 && <span className="text-sm font-normal text-gray-600">/month</span>}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Coins className="h-4 w-4 text-emerald-500" />
                    <span>{tier.token_allocation?.toLocaleString()} tokens/month</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span>{tier.member_limit} members max</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                    <span>{tier.coach_limit} coaches</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {tier.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4">
                  {isCurrentTier ? (
                    <Button className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : canUpgrade ? (
                    <Button 
                      className="w-full"
                      onClick={() => upgradeSubscription(tier.id)}
                    >
                      Upgrade to {tier.name}
                    </Button>
                  ) : tier.id === 'community' && currentTierId !== 'community' ? (
                    <Button variant="outline" className="w-full" disabled>
                      Downgrade Available
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      disabled={!isOwner}
                    >
                      {isOwner ? 'Select Plan' : 'Owner Only'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Subscription Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>What's Included in Your Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {tiers.find(t => t.id === currentTierId)?.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}