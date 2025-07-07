import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Users, Building, CheckCircle, Zap } from 'lucide-react';
import { SubscriptionPlan } from '@/types/store';
import { getSubscriptionsByTarget } from '@/data/storeItems';
import { toast } from 'sonner';

interface SubscriptionStoreProps {
  targetType: 'player' | 'coach' | 'club';
  currentSubscription?: SubscriptionPlan;
  onSubscribe: (plan: SubscriptionPlan, billing: 'monthly' | 'yearly') => Promise<boolean>;
  onManageSubscription: () => void;
}

export function SubscriptionStore({ 
  targetType, 
  currentSubscription, 
  onSubscribe, 
  onManageSubscription 
}: SubscriptionStoreProps) {
  const subscriptionPlans = getSubscriptionsByTarget(targetType);

  const handleSubscribe = async (plan: SubscriptionPlan, billing: 'monthly' | 'yearly') => {
    const success = await onSubscribe(plan, billing);
    if (success) {
      toast.success(`${plan.name} subscription initiated!`);
    }
  };

  const getTargetTypeIcon = () => {
    switch (targetType) {
      case 'player': return <Star className="h-5 w-5" />;
      case 'coach': return <Users className="h-5 w-5" />;
      case 'club': return <Building className="h-5 w-5" />;
    }
  };

  const getTargetTypeTitle = () => {
    switch (targetType) {
      case 'player': return 'Player Subscriptions';
      case 'coach': return 'Coach Subscriptions';
      case 'club': return 'Club Subscriptions';
    }
  };

  const getTargetTypeDescription = () => {
    switch (targetType) {
      case 'player': return 'Unlock premium features, monthly tokens, and exclusive content';
      case 'coach': return 'Professional tools, client management, and advanced analytics';
      case 'club': return 'Complete club management, member services, and facility tools';
    }
  };

  const getPlanColor = (tierLevel: number) => {
    switch (tierLevel) {
      case 1: return 'border-blue-300 bg-blue-50';
      case 2: return 'border-purple-300 bg-purple-50';
      case 3: return 'border-yellow-300 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const isCurrentPlan = (plan: SubscriptionPlan) => {
    return currentSubscription?.id === plan.id;
  };

  const getYearlySavings = (plan: SubscriptionPlan) => {
    if (!plan.price_yearly) return 0;
    const monthlyTotal = plan.price_monthly * 12;
    return Math.round(((monthlyTotal - plan.price_yearly) / monthlyTotal) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          {getTargetTypeIcon()}
          <Crown className="h-12 w-12 text-tennis-green-primary mx-2" />
        </div>
        <h2 className="text-2xl font-bold text-tennis-green-dark mb-2">
          {getTargetTypeTitle()}
        </h2>
        <p className="text-gray-600">
          {getTargetTypeDescription()}
        </p>
      </div>

      {/* Current Subscription Status */}
      {currentSubscription && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800">
                    Current Plan: {currentSubscription.name}
                  </h3>
                  <p className="text-sm text-green-600">
                    {currentSubscription.token_allocation} tokens/month included
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={onManageSubscription}
                className="border-green-300 text-green-700 hover:bg-green-100"
              >
                Manage Subscription
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {subscriptionPlans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative hover:shadow-lg transition-all duration-300 ${
              plan.is_popular ? 'ring-2 ring-tennis-yellow shadow-lg' : ''
            } ${getPlanColor(plan.tier_level)} ${
              isCurrentPlan(plan) ? 'ring-2 ring-green-400' : ''
            }`}
          >
            {plan.is_popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-tennis-yellow text-tennis-green-dark font-bold px-3 py-1">
                  <Star className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
            )}

            {isCurrentPlan(plan) && (
              <div className="absolute -top-3 -right-3">
                <Badge className="bg-green-500 text-white font-bold px-3 py-1">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Current
                </Badge>
              </div>
            )}

            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center gap-2">
                {plan.tier_level === 3 && <Crown className="h-5 w-5 text-yellow-500" />}
                {plan.name}
              </CardTitle>
              <p className="text-sm text-gray-600">{plan.description}</p>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Pricing */}
              <div className="text-center">
                <div className="text-3xl font-bold text-tennis-green-primary">
                  ${plan.price_monthly}
                  <span className="text-lg font-normal text-gray-600">/month</span>
                </div>
                {plan.price_yearly && (
                  <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                    <div className="text-lg font-semibold text-green-600">
                      ${plan.price_yearly}/year
                    </div>
                    <div className="text-xs text-green-600">
                      Save {getYearlySavings(plan)}% annually
                    </div>
                  </div>
                )}
              </div>

              {/* Token Allocation */}
              <div className="flex items-center gap-2 p-3 bg-tennis-green-bg/30 rounded-lg">
                <Zap className="h-4 w-4 text-tennis-green-primary" />
                <div className="flex-1">
                  <div className="font-semibold text-tennis-green-dark">
                    {plan.token_allocation} tokens/month
                  </div>
                  <div className="text-xs text-gray-500">
                    Worth ${(plan.token_allocation * 0.007).toFixed(2)} value
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* Club-specific features */}
              {targetType === 'club' && (
                <div className="border-t pt-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {plan.max_members && (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-gray-500" />
                        <span>{plan.max_members} members</span>
                      </div>
                    )}
                    {plan.max_courts && (
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3 text-gray-500" />
                        <span>{plan.max_courts} courts</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t pt-4 space-y-2">
                {!isCurrentPlan(plan) ? (
                  <>
                    <Button
                      className="w-full bg-tennis-green-primary hover:bg-tennis-green-medium"
                      onClick={() => handleSubscribe(plan, 'monthly')}
                    >
                      Subscribe Monthly
                    </Button>
                    {plan.price_yearly && (
                      <Button
                        variant="outline"
                        className="w-full border-tennis-green-primary text-tennis-green-primary hover:bg-tennis-green-bg"
                        onClick={() => handleSubscribe(plan, 'yearly')}
                      >
                        Subscribe Yearly (Save {getYearlySavings(plan)}%)
                      </Button>
                    )}
                  </>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={onManageSubscription}
                  >
                    Manage Current Plan
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Card */}
      <Card className="bg-tennis-green-bg/50 border-tennis-green-primary/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-tennis-green-primary/10 rounded-lg">
              <Crown className="h-5 w-5 text-tennis-green-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-tennis-green-dark mb-2">
                Subscription Benefits
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Monthly token allocation automatically added to your account</li>
                <li>• Access to premium features and exclusive content</li>
                <li>• Cancel or change your subscription anytime</li>
                <li>• {targetType === 'club' ? 'Complete club management and member services' : 
                       targetType === 'coach' ? 'Professional coaching tools and client management' :
                       'Enhanced gameplay features and priority access'}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}