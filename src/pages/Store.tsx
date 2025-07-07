import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePlayerTokens } from '@/hooks/usePlayerTokens';
import { useCoachTokens } from '@/hooks/useCoachTokens';
import { usePlayerSubscription } from '@/hooks/usePlayerSubscription';
import { useCoachSubscription } from '@/hooks/useCoachSubscription';
import { EnhancedStoreLayout } from '@/components/store/EnhancedStoreLayout';
import { CXPEarnActions } from '@/components/cxp/CXPEarnActions';
import { CTKEarnActions } from '@/components/ctk/CTKEarnActions';
import { CTKStore } from '@/components/ctk/CTKStore';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UpgradeCard } from '@/components/subscription/UpgradeCard';
import { 
  ShoppingBag, 
  Coins, 
  Crown, 
  Zap, 
  Star,
  Gift,
  TrendingUp,
  CheckCircle,
  Package
} from 'lucide-react';
import { toast } from 'sonner';

const Store = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Player hooks
  const { tokenData: playerTokenData, transactions, loading: playerLoading, spendTokens } = usePlayerTokens();
  const { subscription: playerSub, createSubscription: createPlayerSub } = usePlayerSubscription();
  
  // Coach hooks
  const { tokenData: coachTokenData, loading: coachLoading } = useCoachTokens();
  const { subscription: coachSub, createSubscription: createCoachSub } = useCoachSubscription();

  // Enhanced token packages for purchase
  const tokenPackages = [
    {
      id: 'tokens_1000',
      name: 'Starter Pack',
      tokens: 1000,
      price: 7.00, // $0.007 per token
      bonus: 100,
      popular: false,
      description: 'Perfect for casual play',
      savings: '14% bonus tokens'
    },
    {
      id: 'tokens_5000',
      name: 'Value Pack',
      tokens: 5000,
      price: 35.00,
      bonus: 750,
      popular: true,
      description: 'Most popular choice',
      savings: '15% bonus tokens'
    },
    {
      id: 'tokens_10000',
      name: 'Pro Pack',
      tokens: 10000,
      price: 70.00,
      bonus: 2000,
      popular: false,
      description: 'For serious competitors',
      savings: '20% bonus tokens'
    },
    {
      id: 'tokens_25000',
      name: 'Club Pack',
      tokens: 25000,
      price: 175.00,
      bonus: 6250,
      popular: false,
      description: 'Perfect for club purchases',
      savings: '25% bonus tokens'
    }
  ];

  // Club token packages
  const clubTokenPackages = [
    {
      id: 'club_tokens_10000',
      name: 'Basic Club Pack',
      tokens: 10000,
      price: 70.00,
      validDays: 90,
      description: 'Monthly club token allocation',
      features: ['Valid for 90 days', 'Member redemptions', 'Service payments']
    },
    {
      id: 'club_tokens_25000',
      name: 'Standard Club Pack',
      tokens: 25000,
      price: 175.00,
      validDays: 90,
      description: 'Enhanced club operations',
      features: ['Valid for 90 days', 'Member redemptions', 'Premium services', 'Event hosting']
    },
    {
      id: 'club_tokens_50000',
      name: 'Premium Club Pack',
      tokens: 50000,
      price: 350.00,
      validDays: 90,
      description: 'Full club ecosystem',
      features: ['Valid for 90 days', 'All redemptions', 'Premium services', 'Tournament hosting', 'Priority support']
    }
  ];

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePurchaseTokens = async (packageId: string) => {
    setLoading(true);
    try {
      const pkg = tokenPackages.find(p => p.id === packageId);
      if (!pkg) throw new Error('Package not found');

      // For individual token purchases, we could implement a separate edge function
      toast.success(`Purchasing ${pkg.name} - ${pkg.tokens + pkg.bonus} tokens for $${pkg.price}`);
    } catch (error) {
      toast.error('Failed to process purchase');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseClubTokens = async (packageId: string, clubId: string) => {
    setLoading(true);
    try {
      const pkg = clubTokenPackages.find(p => p.id === packageId);
      if (!pkg) throw new Error('Package not found');

      const { data, error } = await supabase.functions.invoke('purchase-club-tokens', {
        body: {
          club_id: clubId,
          token_amount: pkg.tokens
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Club token purchase error:', error);
      toast.error('Failed to process club token purchase');
    } finally {
      setLoading(false);
    }
  };

  const isPlayer = profile?.role === 'player';
  const isCoach = profile?.role === 'coach';
  const totalLoading = playerLoading || coachLoading || profileLoading;

  if (totalLoading) {
    return (
      <div className="min-h-screen bg-tennis-green-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tennis-green-primary mx-auto"></div>
          <p className="mt-2 text-tennis-green-dark">Loading store...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tennis-green-bg">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg">
            <ShoppingBag className="text-xl text-tennis-green-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-tennis-green-dark tracking-tight">
            Rako Store
          </h1>
          <p className="text-tennis-green-medium">
            Discover premium items, token packages, and subscriptions
          </p>
        </div>

        <Tabs defaultValue="subscriptions" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="tokens">Token Packs</TabsTrigger>
            <TabsTrigger value="club-tokens">Club Tokens</TabsTrigger>
            <TabsTrigger value="items">Items</TabsTrigger>
          </TabsList>

          {/* Subscriptions */}
          <TabsContent value="subscriptions">
            <UpgradeCard variant="store" />
          </TabsContent>

          {/* Token Packs */}
          <TabsContent value="tokens" className="space-y-6">
            <div className="text-center mb-6">
              <Coins className="h-12 w-12 text-tennis-green-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-tennis-green-dark mb-2">
                Token Packages
              </h2>
              <p className="text-gray-600">
                Purchase tokens to use across the platform for various services
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {tokenPackages.map((pkg) => (
                <Card key={pkg.id} className={`relative hover:shadow-lg transition-all duration-300 ${
                  pkg.popular ? 'border-tennis-yellow shadow-md' : ''
                }`}>
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-tennis-yellow text-tennis-green-dark font-bold">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader>
                    <CardTitle className="text-lg">{pkg.name}</CardTitle>
                    <div className="text-3xl font-bold text-tennis-green-primary">
                      {pkg.tokens.toLocaleString()}
                      <span className="text-lg font-normal text-gray-600 ml-1">tokens</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      {pkg.bonus > 0 && (
                        <div className="text-sm text-green-600 font-medium">
                          +{pkg.bonus} bonus tokens ({pkg.savings})
                        </div>
                      )}
                      <p className="text-gray-600 text-sm">{pkg.description}</p>
                      <div className="text-xs text-gray-500">
                        ${(pkg.price / (pkg.tokens + pkg.bonus)).toFixed(4)} per token
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full bg-tennis-green-primary hover:bg-tennis-green-medium"
                      onClick={() => handlePurchaseTokens(pkg.id)}
                      disabled={loading}
                    >
                      Buy ${pkg.price}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Club Token Packs */}
          <TabsContent value="club-tokens" className="space-y-6">
            <div className="text-center mb-6">
              <Package className="h-12 w-12 text-tennis-green-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-tennis-green-dark mb-2">
                Club Token Packages
              </h2>
              <p className="text-gray-600">
                Purchase tokens for your club to enable member services and payments
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {clubTokenPackages.map((pkg) => (
                <Card key={pkg.id} className="relative hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      <Badge variant="outline" className="text-tennis-green-primary">
                        {pkg.validDays} days
                      </Badge>
                    </div>
                    <div className="text-3xl font-bold text-tennis-green-primary">
                      {pkg.tokens.toLocaleString()}
                      <span className="text-lg font-normal text-gray-600 ml-1">tokens</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-gray-600 text-sm mb-3">{pkg.description}</p>
                      <ul className="space-y-1">
                        {pkg.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Button 
                      className="w-full bg-tennis-green-primary hover:bg-tennis-green-medium"
                      onClick={() => {
                        // This would need club selection logic
                        toast.info('Please select a club to purchase tokens for');
                      }}
                      disabled={loading}
                    >
                      Purchase ${pkg.price}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-tennis-green-bg/50 border-tennis-green-primary/30">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-tennis-green-primary/10 rounded-lg">
                    <Zap className="h-5 w-5 text-tennis-green-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-tennis-green-dark mb-2">
                      How Club Tokens Work
                    </h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Members can use tokens for partial payments on services</li>
                      <li>• Tokens are valid for 90 days from purchase</li>
                      <li>• Each token is worth $0.007 towards services</li>
                      <li>• Perfect for coaching lessons, court rentals, and equipment</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Items */}
          <TabsContent value="items">
            {isPlayer && (
              <EnhancedStoreLayout
                tokenData={playerTokenData}
                onSpendTokens={spendTokens}
              />
            )}
            {isCoach && <CTKStore />}
            {!isPlayer && !isCoach && (
              <Card>
                <CardContent className="p-8 text-center">
                  <h3 className="font-medium mb-2 text-tennis-green-dark">Profile Setup Required</h3>
                  <p className="text-sm text-tennis-green-medium">
                    Please complete your profile setup to access items.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Store;