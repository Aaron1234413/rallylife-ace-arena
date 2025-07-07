import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Crown, Zap } from 'lucide-react';

interface SubscriptionGateProps {
  feature: string;
  children: React.ReactNode;
  tier?: 'pro' | 'premium';
}

export function SubscriptionGate({ feature, children, tier = 'pro' }: SubscriptionGateProps) {
  const { subscription, createCheckoutSession } = useSubscription();

  const hasAccess = subscription.isSubscribed && (
    tier === 'pro' ? ['pro', 'premium'].includes(subscription.tier) :
    subscription.tier === 'premium'
  );

  if (hasAccess) {
    return <>{children}</>;
  }

  const handleUpgrade = () => {
    const priceId = tier === 'premium' ? 'price_premium' : 'price_pro';
    createCheckoutSession(priceId);
  };

  return (
    <Card className="border-2 border-tennis-yellow/20 bg-gradient-to-br from-tennis-green-bg/30 to-tennis-yellow/5">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 bg-tennis-yellow/10 rounded-full w-fit">
          {tier === 'premium' ? (
            <Crown className="h-8 w-8 text-tennis-yellow" />
          ) : (
            <Shield className="h-8 w-8 text-tennis-green-primary" />
          )}
        </div>
        <CardTitle className="text-xl font-orbitron text-tennis-green-dark">
          {tier === 'premium' ? 'Premium' : 'Pro'} Feature
        </CardTitle>
        <p className="text-tennis-green-medium">
          {feature} requires a {tier} subscription
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <Badge className="bg-tennis-yellow text-tennis-green-dark font-bold">
            <Zap className="h-3 w-3 mr-1" />
            Upgrade to unlock
          </Badge>
        </div>
        <Button 
          className="w-full bg-tennis-yellow hover:bg-tennis-yellow/90 text-tennis-green-dark font-orbitron font-bold"
          onClick={handleUpgrade}
        >
          Upgrade to {tier === 'premium' ? 'Premium' : 'Pro'} - ${tier === 'premium' ? '19.99' : '9.99'}/month
        </Button>
      </CardContent>
    </Card>
  );
}