import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Users, Star, ArrowRight } from 'lucide-react';
import { useSubscriptionTiers, SubscriptionTier } from '@/hooks/useSubscriptionTiers';
import { ClubSubscription, useClubSubscription } from '@/hooks/useClubSubscription';

interface TierUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubId: string;
  currentSubscription: ClubSubscription | null;
}

export function TierUpgradeModal({ isOpen, onClose, clubId, currentSubscription }: TierUpgradeModalProps) {
  const { tiers, loading } = useSubscriptionTiers();
  const { createSubscription, upgradeSubscription } = useClubSubscription(clubId);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const currentTierId = currentSubscription?.tier_id || 'free';
  const availableTiers = tiers.filter(tier => {
    const tierOrder = { free: 0, core: 1, plus: 2, pro: 3 };
    return tierOrder[tier.id as keyof typeof tierOrder] > tierOrder[currentTierId as keyof typeof tierOrder];
  });

  const getTierIcon = (tierId: string) => {
    switch (tierId) {
      case 'free': return Users;
      case 'core': return Star;
      case 'plus': return Crown;
      case 'pro': return Crown;
      default: return Users;
    }
  };

  const getTierColor = (tierId: string) => {
    switch (tierId) {
      case 'free': return 'from-emerald-500/10 to-emerald-500/5 border-emerald-200';
      case 'core': return 'from-blue-500/10 to-blue-500/5 border-blue-200';
      case 'plus': return 'from-amber-500/10 to-amber-500/5 border-amber-200';
      case 'pro': return 'from-purple-500/10 to-purple-500/5 border-purple-200';
      default: return 'from-gray-500/10 to-gray-500/5 border-gray-200';
    }
  };

  const getBadgeColor = (tierId: string) => {
    switch (tierId) {
      case 'free': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'core': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'plus': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'pro': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleUpgrade = async () => {
    if (!selectedTier) return;

    setProcessing(true);
    try {
      if (currentSubscription?.stripe_subscription_id) {
        // Upgrade existing subscription
        await upgradeSubscription(selectedTier);
        onClose();
      } else {
        // Create new subscription
        await createSubscription(selectedTier);
        onClose();
      }
    } catch (error) {
      console.error('Error processing upgrade:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (loading || availableTiers.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-tennis-green-dark">
            {currentSubscription?.stripe_subscription_id ? 'Upgrade Your Plan' : 'Choose Your Plan'}
          </DialogTitle>
          <p className="text-tennis-green-medium">
            {currentSubscription?.stripe_subscription_id 
              ? 'Select a higher tier to unlock more features and capacity'
              : 'Get started with a subscription plan for your club'
            }
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Plan Info */}
          {currentSubscription && (
            <div className="p-4 bg-tennis-green-bg/30 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-tennis-green-medium">
                <span>Current Plan:</span>
                <Badge className={getBadgeColor(currentTierId)}>
                  {tiers.find(t => t.id === currentTierId)?.name || 'Free'}
                </Badge>
              </div>
            </div>
          )}

          {/* Available Tiers */}
          <div className="grid gap-4 md:grid-cols-2">
            {availableTiers.map((tier) => {
              const TierIcon = getTierIcon(tier.id);
              const isSelected = selectedTier === tier.id;
              const isRecommended = tier.id === 'core';

              return (
                <Card
                  key={tier.id}
                  className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    isSelected 
                      ? `ring-2 ring-tennis-green-primary bg-gradient-to-br ${getTierColor(tier.id)}` 
                      : 'hover:border-tennis-green-primary/50'
                  }`}
                  onClick={() => setSelectedTier(tier.id)}
                >
                  {isRecommended && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-tennis-yellow text-tennis-green-dark font-bold">
                        Recommended
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
                        {tier.features.slice(0, 4).map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-xs text-tennis-green-medium">
                            <Check className="h-3 w-3 text-tennis-green-primary flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                        {tier.features.length > 4 && (
                          <li className="text-xs text-tennis-green-medium italic">
                            +{tier.features.length - 4} more features
                          </li>
                        )}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            
            <Button
              onClick={handleUpgrade}
              disabled={!selectedTier || processing}
              className="flex items-center gap-2"
            >
              {processing ? (
                'Processing...'
              ) : (
                <>
                  {currentSubscription?.stripe_subscription_id ? 'Upgrade Plan' : 'Start Subscription'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          {/* Terms */}
          <div className="text-xs text-tennis-green-medium text-center space-y-1">
            <p>
              {currentSubscription?.stripe_subscription_id 
                ? 'Upgrade will be prorated and billed immediately.'
                : 'You can cancel or change your plan at any time.'
              }
            </p>
            <p>All plans include a 14-day money-back guarantee.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}