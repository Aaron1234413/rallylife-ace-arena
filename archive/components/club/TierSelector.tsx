import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Crown, Users, Star } from 'lucide-react';
import { useSubscriptionTiers, SubscriptionTier } from '@/hooks/useSubscriptionTiers';

interface TierSelectorProps {
  selectedTier: string;
  onTierSelect: (tierId: string) => void;
  disabled?: boolean;
}

export function TierSelector({ selectedTier, onTierSelect, disabled = false }: TierSelectorProps) {
  const { tiers, loading } = useSubscriptionTiers();

  const getTierIcon = (tierId: string) => {
    switch (tierId) {
      case 'community': return Users;
      case 'competitive': return Star;
      case 'champions': return Crown;
      default: return Users;
    }
  };

  const getTierColor = (tierId: string) => {
    switch (tierId) {
      case 'community': return 'from-emerald-500/10 to-emerald-500/5 border-emerald-200';
      case 'competitive': return 'from-blue-500/10 to-blue-500/5 border-blue-200';
      case 'champions': return 'from-amber-500/10 to-amber-500/5 border-amber-200';
      default: return 'from-gray-500/10 to-gray-500/5 border-gray-200';
    }
  };

  const getBadgeColor = (tierId: string) => {
    switch (tierId) {
      case 'community': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'competitive': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'champions': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-tennis-green-dark">Choose Your Club Tier</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-tennis-neutral-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-tennis-green-dark">Choose Your Club Tier</h3>
        <p className="text-sm text-tennis-green-medium">
          Select the subscription tier that best fits your club's needs
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {tiers.map((tier) => {
          const TierIcon = getTierIcon(tier.id);
          const isSelected = selectedTier === tier.id;
          const isRecommended = tier.id === 'competitive';

          return (
            <Card
              key={tier.id}
              className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected 
                  ? `ring-2 ring-tennis-green-primary bg-gradient-to-br ${getTierColor(tier.id)}` 
                  : 'hover:border-tennis-green-primary/50'
              }`}
              onClick={() => !disabled && onTierSelect(tier.id)}
            >
              {isRecommended && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-tennis-yellow text-tennis-green-dark font-bold">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${getTierColor(tier.id)}`}>
                      <TierIcon className="h-5 w-5 text-tennis-green-primary" />
                    </div>
                    <CardTitle className="text-lg">{tier.name}</CardTitle>
                  </div>
                  {isSelected && (
                    <div className="p-1 rounded-full bg-tennis-green-primary">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-tennis-green-dark">
                      ${tier.price_monthly}
                    </span>
                    <span className="text-sm text-tennis-green-medium">/month</span>
                  </div>
                  {tier.price_monthly === 0 && (
                    <Badge className={getBadgeColor(tier.id)}>
                      Free Forever
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <span className="text-tennis-green-medium">Members</span>
                    <div className="font-semibold text-tennis-green-dark">
                      {tier.member_limit}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-tennis-green-medium">Coaches</span>
                    <div className="font-semibold text-tennis-green-dark">
                      {tier.coach_limit}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium text-tennis-green-dark">Features:</span>
                  <ul className="space-y-1">
                    {tier.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-xs text-tennis-green-medium">
                        <Check className="h-3 w-3 text-tennis-green-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {tier.features.length > 3 && (
                      <li className="text-xs text-tennis-green-medium italic">
                        +{tier.features.length - 3} more features
                      </li>
                    )}
                  </ul>
                </div>

                <Button
                  variant={isSelected ? "default" : "outline"}
                  className="w-full"
                  disabled={disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTierSelect(tier.id);
                  }}
                >
                  {isSelected ? 'Selected' : 'Select Plan'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}