import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePlayerTokens } from '@/hooks/usePlayerTokens';
import { usePlayerXP } from '@/hooks/usePlayerXP';
import { usePlayerHP } from '@/hooks/usePlayerHP';
import { useMatchmaking } from '@/hooks/useMatchmaking';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ActiveMatches } from '@/components/dashboard/ActiveMatches';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { regularTokens, loading: tokensLoading } = usePlayerTokens();
  const { xpData, loading: xpLoading } = usePlayerXP();
  const { hpData, loading: hpLoading } = usePlayerHP();
  const { 
    getPendingChallenges,
    getActiveMatches,
    isLoading: matchesLoading 
  } = useMatchmaking();

  const pendingChallenges = getPendingChallenges();
  const activeMatches = getActiveMatches();
  const allMatches = [...pendingChallenges, ...activeMatches];

  const goToPlay = () => navigate('/play');
  const goToStore = () => navigate('/store');

  return (
    <div className="min-h-screen bg-gradient-to-br from-tennis-green-dark via-tennis-green-medium to-tennis-green-light">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Welcome Message */}
        <div className="text-center mb-6 sm:mb-8 space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg">
            <span className="text-xl">🎾</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Welcome back, {user?.email?.split('@')[0]}!
          </h2>
          <p className="text-tennis-green-bg/90">Ready for your next challenge?</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Hero Stats Panel */}
          <DashboardHeader 
            tokens={tokensLoading ? 0 : regularTokens}
            xp={xpLoading ? 0 : xpData?.current_xp || 0}
            level={xpLoading ? 1 : xpData?.current_level || 1}
            hp={hpLoading ? 100 : hpData?.current_hp || 100}
            maxHp={hpLoading ? 100 : hpData?.max_hp || 100}
          />

          {/* Choose Your Adventure Quick Actions */}
          <QuickActions
            actions={[
              { icon: "🎾", label: "Start Match", onClick: goToPlay },
              { icon: "🛍️", label: "Purchase Items", onClick: goToStore },
              { icon: "👤", label: "Find Matches", onClick: goToPlay },
            ]}
          />

          {/* Upcoming Matches */}
          <ActiveMatches matches={allMatches} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;