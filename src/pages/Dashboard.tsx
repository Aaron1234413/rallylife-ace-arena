import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentProfile } from '@/hooks/useCurrentProfile';
import { useDashboardSubscriptions } from '@/hooks/useDashboardSubscriptions';
import { CompactDashboardHeader } from '@/components/dashboard/CompactDashboardHeader';
import { QuickActions } from '@/components/dashboard/FloatingQuickActions';
import { ActiveMatches } from '@/components/dashboard/ActiveMatches';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
const Dashboard = () => {
  const { data: profile, isLoading: profileLoading } = useCurrentProfile();
  const { 
    dashboardData: { 
      playerHP, 
      playerXP, 
      playerTokens, 
      recentActivities, 
      pendingChallenges, 
      activeMatches 
    },
    loading
  } = useDashboardSubscriptions();

  const allMatches = [...pendingChallenges, ...activeMatches];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Welcome Header */}
        <div className="text-center mb-6 sm:mb-8 space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-tennis-green-primary rounded-full shadow-lg">
            <span className="text-xl">🎾</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-tennis-green-dark tracking-tight">
            Welcome back, {profileLoading ? 'Player' : profile?.full_name || 'Player'}!
          </h2>
          <p className="text-tennis-green-medium">Ready for your next challenge?</p>
        </div>

        <div className="max-w-6xl mx-auto space-y-6">
          {/* Compact Player Vitals */}
          <CompactDashboardHeader 
            tokens={loading.tokens ? 0 : playerTokens?.regular_tokens || 0}
            xp={loading.xp ? 0 : playerXP?.current_xp || 0}
            level={loading.xp ? 1 : playerXP?.current_level || 1}
            hp={loading.hp ? 100 : playerHP?.current_hp || 100}
            maxHp={loading.hp ? 100 : playerHP?.max_hp || 100}
            xpToNextLevel={loading.xp ? 0 : playerXP?.xp_to_next_level || 0}
          />

          {/* Quick Actions */}
          <QuickActions />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upcoming Matches */}
            <div className="space-y-6">
              <ActiveMatches matches={allMatches} />
            </div>

            {/* Recent Activity */}
            <div className="space-y-6">
              <RecentActivity activities={recentActivities} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;