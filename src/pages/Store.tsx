import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePlayerTokens } from '@/hooks/usePlayerTokens';
import { useCoachTokens } from '@/hooks/useCoachTokens';
import { usePlayerHP } from '@/hooks/usePlayerHP';
import { usePlayerSubscription } from '@/hooks/usePlayerSubscription';
import { useCoachSubscription } from '@/hooks/useCoachSubscription';
import { useRealTimeTokens } from '@/hooks/useRealTimeTokens';
import { EnhancedStoreLayout } from '@/components/store/EnhancedStoreLayout';
import { HealthPackStore } from '@/components/store/HealthPackStore';
import { TokenPackStore } from '@/components/store/TokenPackStore';
import { SubscriptionStore } from '@/components/store/SubscriptionStore';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingBag, 
  Heart,
  Coins, 
  Crown, 
  Zap, 
  Star,
  Gift,
  Package,
  Shirt,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { HealthPackItem, TokenPackItem, SubscriptionPlan } from '@/types/store';

const Store = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedClubId, setSelectedClubId] = useState<string>('');
  
  // Player hooks
  const { tokenData: playerTokenData, loading: playerLoading, spendTokens } = usePlayerTokens();
  const { hpData, loading: hpLoading, restoreHP } = usePlayerHP();
  const { subscription: playerSub, createSubscription: createPlayerSub } = usePlayerSubscription();
  
  // Coach hooks
  const { tokenData: coachTokenData, loading: coachLoading } = useCoachTokens();
  const { subscription: coachSub, createSubscription: createCoachSub } = useCoachSubscription();

  // Real-time updates
  const { notifications } = useRealTimeTokens();

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

  // Purchase handlers for new store system
  const handleHealthPackPurchase = async (item: HealthPackItem): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Spend tokens
      const success = await spendTokens(item.price_tokens, 'regular', 'health_pack', `Purchased ${item.name}`);
      
      if (success) {
        // Restore HP
        await restoreHP(item.hp_restore, 'health_pack', `Used ${item.name}`);
        
        // Handle special effects
        if (item.effects) {
          // In a real implementation, you'd apply these effects to the player
          console.log('Applying effects:', item.effects);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error purchasing health pack:', error);
      toast.error('Failed to purchase health pack');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleTokenPackPurchase = async (pack: TokenPackItem): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Create Stripe checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          pack_id: pack.id,
          target_type: pack.target_type,
          club_id: pack.target_type === 'club' ? selectedClubId : undefined
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error purchasing token pack:', error);
      toast.error('Failed to initiate token pack purchase');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionPurchase = async (plan: SubscriptionPlan, billing: 'monthly' | 'yearly'): Promise<boolean> => {
    try {
      setLoading(true);
      
      if (plan.target_type === 'player') {
        await createPlayerSub('premium' as any); // Use existing subscription system
        return true;
      } else if (plan.target_type === 'coach') {
        await createCoachSub('pro' as any); // Use existing subscription system  
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast.error('Failed to create subscription');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error('Failed to open subscription management');
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
          
          {/* Real-time notifications */}
          {notifications.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-700">
                Recent: {notifications[0].message}
              </div>
            </div>
          )}
        </div>

        <Tabs defaultValue="subscriptions" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="subscriptions" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              <span className="hidden sm:inline">Subscriptions</span>
            </TabsTrigger>
            <TabsTrigger value="health-packs" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Health</span>
            </TabsTrigger>
            <TabsTrigger value="token-packs" className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              <span className="hidden sm:inline">Tokens</span>
            </TabsTrigger>
            <TabsTrigger value="avatar-items" className="flex items-center gap-2">
              <Shirt className="h-4 w-4" />
              <span className="hidden sm:inline">Avatar</span>
            </TabsTrigger>
            <TabsTrigger value="legacy" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Legacy</span>
            </TabsTrigger>
          </TabsList>

          {/* Subscriptions */}
          <TabsContent value="subscriptions">
            <SubscriptionStore
              targetType={isPlayer ? 'player' : isCoach ? 'coach' : 'player'}
              currentSubscription={undefined} // Will be enhanced later to map existing subscriptions
              onSubscribe={handleSubscriptionPurchase}
              onManageSubscription={handleManageSubscription}
            />
          </TabsContent>

          {/* Health Packs */}
          <TabsContent value="health-packs">
            {isPlayer ? (
              <HealthPackStore
                onPurchase={handleHealthPackPurchase}
                regularTokens={playerTokenData?.regular_tokens || 0}
                premiumTokens={playerTokenData?.premium_tokens || 0}
                userHP={hpData?.current_hp || 0}
                maxHP={hpData?.max_hp || 100}
              />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-medium mb-2 text-tennis-green-dark">Player Feature</h3>
                  <p className="text-sm text-tennis-green-medium">
                    Health packs are available for players only.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Token Packs */}
          <TabsContent value="token-packs">
            <TokenPackStore
              targetType={isPlayer ? 'player' : isCoach ? 'coach' : 'player'}
              onPurchase={handleTokenPackPurchase}
              clubId={selectedClubId}
            />
          </TabsContent>

          {/* Avatar Items */}
          <TabsContent value="avatar-items">
            {isPlayer ? (
              <EnhancedStoreLayout
                tokenData={playerTokenData}
                onSpendTokens={spendTokens}
              />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Shirt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-medium mb-2 text-tennis-green-dark">Player Feature</h3>
                  <p className="text-sm text-tennis-green-medium">
                    Avatar customization is available for players only.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Legacy Items (existing store components) */}
          <TabsContent value="legacy">
            <div className="text-center mb-6">
              <Package className="h-12 w-12 text-tennis-green-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-tennis-green-dark mb-2">
                Legacy Store Items
              </h2>
              <p className="text-gray-600">
                Previous store items and functionality
              </p>
            </div>
            
            {isPlayer && (
              <EnhancedStoreLayout
                tokenData={playerTokenData}
                onSpendTokens={spendTokens}
              />
            )}
            
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