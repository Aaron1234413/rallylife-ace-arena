
import React from 'react';
import { HPActivityLog } from '@/components/hp/HPActivityLog';
import { XPActivityLog } from '@/components/xp/XPActivityLog';
import { TokenTransactionHistory } from '@/components/tokens/TokenTransactionHistory';
import { AchievementDisplay } from '@/components/achievements/AchievementDisplay';

interface PlayerActivityLogsProps {
  activities: any[];
  loading: boolean;
}

export function PlayerActivityLogs({ activities, loading }: PlayerActivityLogsProps) {
  // Filter different types of activities
  const hpLogs = activities.filter(a => a.hp_impact !== undefined && a.hp_impact !== 0);
  const xpLogs = activities.filter(a => a.xp_earned > 0);
  const tokenLogs: any[] = []; // Token transactions are handled separately, not in activity logs

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <HPActivityLog activities={hpLogs} loading={loading} />
      <XPActivityLog activities={xpLogs} loading={loading} />
      <TokenTransactionHistory transactions={tokenLogs} loading={loading} />
      <AchievementDisplay showRecent={true} maxItems={3} />
    </div>
  );
}
