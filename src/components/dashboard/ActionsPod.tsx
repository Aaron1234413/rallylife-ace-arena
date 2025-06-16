
import React, { useState } from 'react';
import { DashboardCard } from './DashboardCard';
import { HPRestoreActions } from '@/components/hp/HPRestoreActions';
import { XPEarnActions } from '@/components/xp/XPEarnActions';
import { TokenEarnActions } from '@/components/tokens/TokenEarnActions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, TrendingUp, Coins } from 'lucide-react';

interface ActionsPodProps {
  hpData: any;
  xpData: any;
  tokenData: any;
  onRestoreHP: (amount: number, activityType: string, description?: string) => Promise<void>;
  onAddXP: (amount: number, activityType: string, description?: string) => Promise<any>;
  onAddTokens: (amount: number, tokenType?: string, source?: string, description?: string) => Promise<void>;
}

export function ActionsPod({
  hpData,
  xpData,
  tokenData,
  onRestoreHP,
  onAddXP,
  onAddTokens
}: ActionsPodProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <DashboardCard
      title="Quick Actions"
      priority="medium"
      collapsible={true}
      isCollapsed={isCollapsed}
      onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      icon={<Zap className="h-5 w-5 text-orange-500" />}
    >
      <Tabs defaultValue="hp" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hp" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Restore HP
          </TabsTrigger>
          <TabsTrigger value="xp" className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Earn XP
          </TabsTrigger>
          <TabsTrigger value="tokens" className="flex items-center gap-1">
            <Coins className="h-3 w-3" />
            Earn Tokens
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="hp" className="mt-4">
          {hpData && (
            <HPRestoreActions
              onRestoreHP={onRestoreHP}
              currentHP={hpData.current_hp}
              maxHP={hpData.max_hp}
            />
          )}
        </TabsContent>
        
        <TabsContent value="xp" className="mt-4">
          {xpData && (
            <XPEarnActions
              onEarnXP={onAddXP}
            />
          )}
        </TabsContent>
        
        <TabsContent value="tokens" className="mt-4">
          {tokenData && (
            <TokenEarnActions
              onEarnTokens={onAddTokens}
            />
          )}
        </TabsContent>
      </Tabs>
    </DashboardCard>
  );
}
