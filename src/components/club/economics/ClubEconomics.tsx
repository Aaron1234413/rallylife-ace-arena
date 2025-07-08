import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DollarSign,
  Coins,
  TrendingUp,
  Users,
  CreditCard,
  Target,
  BarChart3,
  Crown
} from 'lucide-react';
import { ClubSubscriptionManagement } from './ClubSubscriptionManagement';
import { TokenPoolManagement } from './TokenPoolManagement';
import { ServicePricingManager } from './ServicePricingManager';
import { PlayerStakingInterface } from './PlayerStakingInterface';
import { EconomicsAnalytics } from './EconomicsAnalytics';

interface ClubEconomicsProps {
  club: {
    id: string;
    name: string;
    subscription_tier?: string;
  };
  isOwner: boolean;
  canManage: boolean;
}

export function ClubEconomics({ club, isOwner, canManage }: ClubEconomicsProps) {
  const [activeEconomicsTab, setActiveEconomicsTab] = useState('overview');

  // Mock token pool data
  const tokenPoolData = {
    monthly_allocation: 50000,
    current_balance: 32500,
    used_this_month: 17500,
    rollover_tokens: 5000,
    expires_at: '2025-02-01'
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
                {tokenPoolData.current_balance.toLocaleString()}
              </div>
              <div className="text-sm text-emerald-700">Tokens Available</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Economics Navigation */}
      <Tabs value={activeEconomicsTab} onValueChange={setActiveEconomicsTab}>
        <TabsList className="grid w-full grid-cols-5 bg-white border shadow-sm">
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
            value="tokens"
            className="flex items-center gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
          >
            <Coins className="h-4 w-4" />
            <span className="hidden sm:inline">Token Pool</span>
          </TabsTrigger>
          <TabsTrigger 
            value="services"
            className="flex items-center gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
          >
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Services</span>
          </TabsTrigger>
          <TabsTrigger 
            value="staking"
            className="flex items-center gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
          >
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Staking</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <EconomicsAnalytics club={club} tokenPoolData={tokenPoolData} />
        </TabsContent>

        <TabsContent value="subscription">
          <ClubSubscriptionManagement club={club} isOwner={isOwner} />
        </TabsContent>

        <TabsContent value="tokens">
          <TokenPoolManagement club={club} tokenPoolData={tokenPoolData} canManage={canManage} />
        </TabsContent>

        <TabsContent value="services">
          <ServicePricingManager club={club} canManage={canManage} />
        </TabsContent>

        <TabsContent value="staking">
          <PlayerStakingInterface club={club} />
        </TabsContent>
      </Tabs>
    </div>
  );
}