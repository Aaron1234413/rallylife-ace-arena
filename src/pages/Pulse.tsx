
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ActivityTimeline } from '@/components/dashboard/activity/ActivityTimeline';
import { AchievementDisplay } from '@/components/achievements/AchievementDisplay';
import { LeaderboardWidget } from '@/components/leaderboards/LeaderboardWidget';
import { PlayerActivityLogs } from '@/components/dashboard/PlayerActivityLogs';
import { ActivityStats } from '@/components/activities/ActivityStats';
import { UnifiedActivityActions } from '@/components/activities/UnifiedActivityActions';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { usePlayerAchievements } from '@/hooks/usePlayerAchievements';
import { Bolt, TrendingUp, Activity, BarChart3 } from 'lucide-react';

const Pulse = () => {
  const [timeFilter, setTimeFilter] = useState('week');
  const [activityFilter, setActivityFilter] = useState('all');
  
  // Fetch activity data
  const { activities, stats, loading: activityLoading, refreshData } = useActivityLogs();
  
  // Fetch achievements data
  const { playerAchievements, loading: achievementsLoading } = usePlayerAchievements();

  const handleActivityCompleted = async () => {
    await refreshData();
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
            Your complete activity dashboard - track, analyze, and log your tennis activities
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

      {/* Activity Intelligence Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Activity Logging */}
        <UnifiedActivityActions onActivityCompleted={handleActivityCompleted} />
        
        {/* Activity Statistics */}
        <ActivityStats />
      </div>

      {/* Activity Analytics Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Activity Intelligence
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Comprehensive breakdown of your HP, XP, and token activities
          </p>
        </CardHeader>
        <CardContent>
          <PlayerActivityLogs 
            activities={activities} 
            loading={activityLoading}
          />
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
                showRecent={true}
                maxItems={3}
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
                title="XP Leaders"
                leaderboardType="overall"
                periodType="all_time"
                maxEntries={5}
                showViewAll={false}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Pulse;
