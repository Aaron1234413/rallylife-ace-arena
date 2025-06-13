
import React from 'react';
import { HPRestoreActions } from '@/components/hp/HPRestoreActions';
import { XPEarnActions } from '@/components/xp/XPEarnActions';
import { TokenEarnActions } from '@/components/tokens/TokenEarnActions';

interface PlayerActionCardsProps {
  hpData: any;
  xpData: any;
  tokenData: any;
  onRestoreHP: (amount: number, activityType: string, description?: string) => Promise<void>;
  onAddXP: (amount: number, activityType: string, description?: string) => Promise<any>;
  onAddTokens: (amount: number, tokenType?: string, source?: string, description?: string) => Promise<void>;
}

export function PlayerActionCards({
  hpData,
  xpData,
  tokenData,
  onRestoreHP,
  onAddXP,
  onAddTokens
}: PlayerActionCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {hpData && (
        <HPRestoreActions
          onRestoreHP={onRestoreHP}
          currentHP={hpData.current_hp}
          maxHP={hpData.max_hp}
        />
      )}

      {xpData && (
        <XPEarnActions
          onEarnXP={onAddXP}
        />
      )}

      {tokenData && (
        <TokenEarnActions
          onEarnTokens={onAddTokens}
        />
      )}
    </div>
  );
}
