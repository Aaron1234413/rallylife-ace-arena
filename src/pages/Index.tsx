
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

export default function DashboardPage() {
  const testProfile = { name: 'Test User', avatar_url: '', skill_level: 'Intermediate' };
  const testUser = { email: 'test@rallylife.com' };

  return (
    <DashboardLayout
      hpData={{ current_hp: 70, max_hp: 100, last_activity: '2024-06-14' }}
      xpData={{ current_level: 2, current_xp: 150, total_xp_earned: 300, xp_to_next_level: 50 }}
      tokenData={{ regular_tokens: 40, premium_tokens: 5, lifetime_earned: 100 }}
      hpLoading={false}
      xpLoading={false}
      tokensLoading={false}
      profile={testProfile}
      user={testUser}
      profileLoading={false}
      isPlayer={true}
      onRestoreHP={async () => {}}
      onAddXP={async () => {}}
      onAddTokens={async () => {}}
    />
  );
}
