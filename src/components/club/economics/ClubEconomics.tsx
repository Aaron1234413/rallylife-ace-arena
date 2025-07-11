import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DollarSign,
  CreditCard,
  BarChart3,
  Crown,
  AlertCircle
} from 'lucide-react';
import { ClubSubscriptionManagement } from './ClubSubscriptionManagement';
import { TokenPoolManagement } from './TokenPoolManagement';
import { ServicePricingManager } from './ServicePricingManager';
import { EconomicsAnalytics } from './EconomicsAnalytics';
import { useClubTokenPool } from '@/hooks/useClubTokenPool';

interface ClubEconomicsProps {
  club: {
    id: string;
    name: string;
    subscription_tier?: string;
  };
  isOwner: boolean;
  canManage: boolean;
  initialTab?: string;
}

export function ClubEconomics({ club, isOwner, canManage, initialTab = 'overview' }: ClubEconomicsProps) {
  const [activeEconomicsTab, setActiveEconomicsTab] = useState(initialTab);
  
  // Update the active tab when initialTab changes
  React.useEffect(() => {
    setActiveEconomicsTab(initialTab);
  }, [initialTab]);
  const { tokenPoolData, usageBreakdown, loading, error } = useClubTokenPool(club.id);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-emerald-50 to-emerald-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center animate-pulse">
                <DollarSign className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="flex-1">
                <div className="h-6 bg-emerald-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-emerald-200 rounded animate-pulse"></div>
              </div>
              <div className="text-right">
                <div className="h-8 w-24 bg-emerald-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-20 bg-emerald-200 rounded animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div>
                <h3 className="text-lg font-semibold text-red-900">Unable to Load Economics Data</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fallback data if tokenPoolData is null
  const displayTokenData = tokenPoolData || {
    monthly_allocation: 5000,
    current_balance: 5000,
    used_this_month: 0,
    rollover_tokens: 0,
    purchased_tokens: 0,
    expires_at: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
    month_year: new Date().toISOString().slice(0, 7)
  };

  return (
    <div className="space-y-6">
      {/* Economics Header */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-emerald-50 to-emerald-100">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
              <DollarSign className="h-8 w-8 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-emerald-900 mb-1">
                Club Economics Dashboard
              </h2>
              <p className="text-emerald-700">
                Manage subscriptions, tokens, pricing, and revenue streams
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-emerald-900">
                {displayTokenData.current_balance.toLocaleString()}
              </div>
              <div className="text-sm text-emerald-700">Tokens Available</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Economics Navigation */}
      <Tabs value={activeEconomicsTab} onValueChange={setActiveEconomicsTab}>
        <TabsList className="grid w-full grid-cols-3 bg-white border shadow-sm">
          <TabsTrigger 
            value="overview" 
            className="flex items-center gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger 
            value="subscription"
            className="flex items-center gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
          >
            <Crown className="h-4 w-4" />
            <span className="hidden sm:inline">Subscription</span>
          </TabsTrigger>
          <TabsTrigger 
            value="services"
            className="flex items-center gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
          >
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Services</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <TokenPoolManagement 
            club={club} 
            tokenPoolData={displayTokenData} 
            usageBreakdown={usageBreakdown}
            canManage={canManage} 
          />
        </TabsContent>

        <TabsContent value="subscription">
          <ClubSubscriptionManagement club={club} isOwner={isOwner} />
        </TabsContent>

        <TabsContent value="services">
          <ServicePricingManager club={club} canManage={canManage} />
        </TabsContent>
      </Tabs>
    </div>
  );
}