
import React from 'react';
import { HPActivityLog } from '@/components/hp/HPActivityLog';
import { XPActivityLog } from '@/components/xp/XPActivityLog';
import { TokenTransactionHistory } from '@/components/tokens/TokenTransactionHistory';
import { AchievementDisplay } from '@/components/achievements/AchievementDisplay';

interface PlayerActivityLogsProps {
  hpActivities: any[];
  xpActivities: any[];
  transactions: any[];
  hpLoading: boolean;
  xpLoading: boolean;
  tokensLoading: boolean;
}

export function PlayerActivityLogs({
  hpActivities,
  xpActivities,
  transactions,
  hpLoading,
  xpLoading,
  tokensLoading
}: PlayerActivityLogsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <HPActivityLog
        activities={hpActivities}
        loading={hpLoading}
      />
      <XPActivityLog
        activities={xpActivities}
        loading={xpLoading}
      />
      <TokenTransactionHistory
        transactions={transactions}
        loading={tokensLoading}
      />
      <AchievementDisplay 
        showRecent={true}
        maxItems={3}
      />
    </div>
  );
}
