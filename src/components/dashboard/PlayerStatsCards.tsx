
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { HPCard } from '@/components/hp/HPDisplay';
import { XPCard } from '@/components/xp/XPCard';
import { TokenCard } from '@/components/tokens/TokenCard';

interface PlayerStatsCardsProps {
  hpData: any;
  xpData: any;
  tokenData: any;
  hpLoading: boolean;
  xpLoading: boolean;
  tokensLoading: boolean;
}

export function PlayerStatsCards({
  hpData,
  xpData,
  tokenData,
  hpLoading,
  xpLoading,
  tokensLoading
}: PlayerStatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {hpData ? (
        <HPCard
          currentHP={hpData.current_hp}
          maxHP={hpData.max_hp}
          lastActivity={hpData.last_activity}
        />
      ) : hpLoading ? (
        <Card>
          <CardContent className="p-4">
            <p className="text-center text-sm">Loading HP data...</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <p className="text-center text-muted-foreground text-sm">
              HP system initializing...
            </p>
          </CardContent>
        </Card>
      )}

      {xpData ? (
        <XPCard
          currentLevel={xpData.current_level}
          currentXP={xpData.current_xp}
          totalXPEarned={xpData.total_xp_earned}
          xpToNextLevel={xpData.xp_to_next_level}
        />
      ) : xpLoading ? (
        <Card>
          <CardContent className="p-4">
            <p className="text-center text-sm">Loading XP data...</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <p className="text-center text-muted-foreground text-sm">
              XP system initializing...
            </p>
          </CardContent>
        </Card>
      )}

      {tokenData ? (
        <TokenCard
          regularTokens={tokenData.regular_tokens}
          premiumTokens={tokenData.premium_tokens}
          lifetimeEarned={tokenData.lifetime_earned}
        />
      ) : tokensLoading ? (
        <Card>
          <CardContent className="p-4">
            <p className="text-center text-sm">Loading token data...</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <p className="text-center text-muted-foreground text-sm">
              Token system initializing...
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
