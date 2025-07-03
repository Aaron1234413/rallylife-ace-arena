
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePlayerTokens } from '@/hooks/usePlayerTokens';
import { useCoachTokens } from '@/hooks/useCoachTokens';
import { EnhancedStoreLayout } from '@/components/store/EnhancedStoreLayout';
import { CXPEarnActions } from '@/components/cxp/CXPEarnActions';
import { CTKEarnActions } from '@/components/ctk/CTKEarnActions';
import { CTKStore } from '@/components/ctk/CTKStore';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Store = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  
  // Player hooks
  const { tokenData: playerTokenData, transactions, loading: playerLoading, spendTokens } = usePlayerTokens();
  
  // Coach hooks
  const { tokenData: coachTokenData, loading: coachLoading } = useCoachTokens();

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

  const isPlayer = profile?.role === 'player';
  const isCoach = profile?.role === 'coach';
  const loading = playerLoading || coachLoading || profileLoading;

  if (loading) {
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
            <span className="text-xl">🛒</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-tennis-green-dark tracking-tight">
            {isCoach ? 'Coach Store' : 'Player Store'}
          </h1>
          <p className="text-tennis-green-medium">
            {isCoach ? 'Invest in your coaching career and earn experience' : 'Spend your tokens on items and upgrades'}
          </p>
        </div>

        {isPlayer && (
          <EnhancedStoreLayout
            tokenData={playerTokenData}
            onSpendTokens={spendTokens}
          />
        )}

        {isCoach && (
          <Tabs defaultValue="store" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 h-11 p-1">
              <TabsTrigger value="store" className="text-sm font-medium">CTK Store</TabsTrigger>
              <TabsTrigger value="earn-ctk" className="text-sm font-medium">Earn CTK</TabsTrigger>
              <TabsTrigger value="earn-cxp" className="text-sm font-medium">Earn CXP</TabsTrigger>
            </TabsList>

            <TabsContent value="store">
              <CTKStore />
            </TabsContent>

            <TabsContent value="earn-ctk">
              <CTKEarnActions />
            </TabsContent>

            <TabsContent value="earn-cxp">
              <CXPEarnActions />
            </TabsContent>
          </Tabs>
        )}

        {!isPlayer && !isCoach && (
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="font-medium mb-2 text-tennis-green-dark">Profile Setup Required</h3>
              <p className="text-sm text-tennis-green-medium">
                Please complete your profile setup to access the store.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Store;
