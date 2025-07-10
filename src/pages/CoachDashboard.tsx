
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCoachProfile } from '@/hooks/useCoachProfile';
import { useHP } from '@/hooks/useHP';
import { useXP } from '@/hooks/useXP';
import { useTokens } from '@/hooks/useTokens';
import { PlayerStats } from '@/components/coach/PlayerStats';
import { CoachProfileCard } from '@/components/coach/CoachProfileCard';
import { UpcomingSessions } from '@/components/coach/UpcomingSessions';
import { CoachToolsPanel } from '@/components/coach/CoachToolsPanel';

const CoachDashboard = () => {
  const { user } = useAuth();
  const { value: hp } = useHP();
  const { value: xp } = useXP();
  const { value: tokens } = useTokens();

  // Extract first name from user data
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Coach';

  return (
    <div className="p-3 sm:p-4 max-w-7xl mx-auto space-y-6">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <h1 className="text-2xl sm:text-3xl font-bold">
          Welcome back, Coach {firstName}! 🎾
        </h1>
        <p className="text-muted-foreground">
          Ready to join sessions, coach players, or build your club.
        </p>
        
        {/* Player Stats */}
        <PlayerStats hp={hp} xp={xp} tokens={tokens} />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          <CoachProfileCard />
          <CoachToolsPanel />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <UpcomingSessions />
        </div>
      </div>
    </div>
  );
};

export default CoachDashboard;
