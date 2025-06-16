
import React, { useState } from 'react';
import { DashboardCard } from './DashboardCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HPCard } from '@/components/hp/HPDisplay';
import { XPCard } from '@/components/xp/XPCard';
import { TokenCard } from '@/components/tokens/TokenCard';
import { Badge } from '@/components/ui/badge';
import { Heart, Star, Coins } from 'lucide-react';

interface StatusPodProps {
  hpData: any;
  xpData: any;
  tokenData: any;
  hpLoading: boolean;
  xpLoading: boolean;
  tokensLoading: boolean;
}

export function StatusPod({
  hpData,
  xpData,
  tokenData,
  hpLoading,
  xpLoading,
  tokensLoading
}: StatusPodProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Determine which metric has highest priority for accent
  const getHighestPriorityMetric = () => {
    if (hpData && hpData.current_hp < hpData.max_hp * 0.3) return 'hp';
    if (xpData && xpData.xp_to_next_level < 50) return 'xp';
    return 'tokens';
  };

  const priorityMetric = getHighestPriorityMetric();

  return (
    <DashboardCard
      title="Player Status"
      priority="high"
      collapsible={true}
      isCollapsed={isCollapsed}
      onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      icon={<Heart className="h-5 w-5 text-red-500" />}
    >
      <div className="space-y-4">
        {/* Quick Status Summary */}
        <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
          <div className="flex items-center gap-4">
            {hpData && (
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="font-semibold">{hpData.current_hp}/{hpData.max_hp}</span>
              </div>
            )}
            {xpData && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-blue-500" />
                <span className="font-semibold">Lv.{xpData.current_level}</span>
              </div>
            )}
            {tokenData && (
              <div className="flex items-center gap-1">
                <Coins className="h-4 w-4 text-yellow-500" />
                <span className="font-semibold">{tokenData.regular_tokens}</span>
              </div>
            )}
          </div>
          <Badge variant={priorityMetric === 'hp' ? 'destructive' : 'secondary'}>
            {priorityMetric === 'hp' ? 'HP Low!' : 
             priorityMetric === 'xp' ? 'Close to Level Up!' : 
             'All Good'}
          </Badge>
        </div>

        {/* Detailed Status Tabs */}
        <Tabs defaultValue="hp" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="hp" className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              HP
            </TabsTrigger>
            <TabsTrigger value="xp" className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              XP
            </TabsTrigger>
            <TabsTrigger value="tokens" className="flex items-center gap-1">
              <Coins className="h-3 w-3" />
              Tokens
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="hp" className="mt-4">
            {hpData ? (
              <HPCard
                currentHP={hpData.current_hp}
                maxHP={hpData.max_hp}
                lastActivity={hpData.last_activity}
              />
            ) : hpLoading ? (
              <div className="text-center py-4">Loading HP data...</div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">HP system initializing...</div>
            )}
          </TabsContent>
          
          <TabsContent value="xp" className="mt-4">
            {xpData ? (
              <XPCard
                currentLevel={xpData.current_level}
                currentXP={xpData.current_xp}
                totalXPEarned={xpData.total_xp_earned}
                xpToNextLevel={xpData.xp_to_next_level}
              />
            ) : xpLoading ? (
              <div className="text-center py-4">Loading XP data...</div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">XP system initializing...</div>
            )}
          </TabsContent>
          
          <TabsContent value="tokens" className="mt-4">
            {tokenData ? (
              <TokenCard
                regularTokens={tokenData.regular_tokens}
                premiumTokens={tokenData.premium_tokens}
                lifetimeEarned={tokenData.lifetime_earned}
              />
            ) : tokensLoading ? (
              <div className="text-center py-4">Loading token data...</div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">Token system initializing...</div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardCard>
  );
}
