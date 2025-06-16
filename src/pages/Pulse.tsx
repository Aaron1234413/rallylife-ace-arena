
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ActivityTimeline } from '@/components/dashboard/activity/ActivityTimeline';
import { AchievementDisplay } from '@/components/achievements/AchievementDisplay';
import { LeaderboardWidget } from '@/components/leaderboards/LeaderboardWidget';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { usePlayerAchievements } from '@/hooks/usePlayerAchievements';
import { Bolt } from 'lucide-react';

const Pulse = () => {
  const [timeFilter, setTimeFilter] = useState('week');
  const [activityFilter, setActivityFilter] = useState('all');
  
  // Fetch activity data
  const { activities, stats, loading: activityLoading } = useActivityLogs();
  
  // Fetch achievements data
  const { playerAchievements, loading: achievementsLoading } = usePlayerAchievements();

  // Mock leaderboard data for now
  const getLeaderboardData = async () => {
    // This would be replaced with actual Supabase query
    return [
      { id: '1', name: 'Alex Chen', xp: 2450, matches_won: 18, avatar_url: null },
      { id: '2', name: 'Sarah Johnson', xp: 2380, matches_won: 16, avatar_url: null },
      { id: '3', name: 'Mike Rodriguez', xp: 2290, matches_won: 15, avatar_url: null },
      { id: '4', name: 'Emma Wilson', xp: 2180, matches_won: 14, avatar_url: null },
      { id: '5', name: 'David Park', xp: 2050, matches_won: 12, avatar_url: null }
    ];
  };

  return (
    <div className="p-3 sm:p-4 max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bolt className="h-6 w-6 text-yellow-500" />
            Pulse
          </CardTitle>
          <p className="text-muted-foreground">
            Your activity timeline, achievements, and leaderboard standings
          </p>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Time:</span>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Activity:</span>
              <Select value={activityFilter} onValueChange={setActivityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="match">Matches</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="lesson">Lessons</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column - Activity Timeline (60% on desktop) */}
        <div className="lg:col-span-3">
          <ActivityTimeline
            activities={activities}
            timeFilter={timeFilter}
            activityFilter={activityFilter}
            loading={activityLoading}
          />
        </div>

        {/* Right Column - Achievements and Leaderboard (40% on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Achievements Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <AchievementDisplay
                achievements={playerAchievements.slice(0, 3)}
                loading={achievementsLoading}
                variant="compact"
              />
              {playerAchievements.length > 3 && (
                <div className="mt-4 text-center">
                  <a 
                    href="/achievements" 
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View All Achievements →
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Leaderboard Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Players</CardTitle>
            </CardHeader>
            <CardContent>
              <LeaderboardWidget
                getData={getLeaderboardData}
                title="XP Leaders"
                metric="xp"
                showRank={true}
                limit={5}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Pulse;
