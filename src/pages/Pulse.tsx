
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ActivityTimeline } from '@/components/dashboard/activity/ActivityTimeline';
import { AchievementDisplay } from '@/components/achievements/AchievementDisplay';
import { LeaderboardWidget } from '@/components/leaderboards/LeaderboardWidget';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { usePlayerAchievements } from '@/hooks/usePlayerAchievements';
import { usePlayerHP } from '@/hooks/usePlayerHP';
import { 
  Bolt, 
  Clock, 
  TrendingUp, 
  Sparkles, 
  AlertTriangle 
} from 'lucide-react';

const Pulse = () => {
  const [timeFilter, setTimeFilter] = useState('week');
  const [activityFilter, setActivityFilter] = useState('all');
  
  // Fetch activity data
  const { activities, stats, loading: activityLoading } = useActivityLogs();
  
  // Fetch achievements data
  const { playerAchievements, loading: achievementsLoading } = usePlayerAchievements();
  
  // Fetch HP data for energy level
  const { hpData } = usePlayerHP();

  // Calculate activity intelligence data
  const getActivityIntelligence = () => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyActivityCount = activities?.filter(activity => 
      new Date(activity.created_at) > weekAgo
    ).length || 0;
    
    const hpPercentage = hpData ? (hpData.current_hp / hpData.max_hp) * 100 : 0;
    const energyLevel = hpPercentage > 80 ? 'High' : 
                       hpPercentage > 60 ? 'Good' : 
                       hpPercentage > 40 ? 'Moderate' : 
                       hpPercentage > 20 ? 'Low' : 'Critical';
    
    const lastActivity = activities?.[0];
    const hoursSinceLastActivity = lastActivity ? 
      (Date.now() - new Date(lastActivity.created_at).getTime()) / (1000 * 60 * 60) : 24;
    
    return {
      weeklyCount: weeklyActivityCount,
      energyLevel,
      hpPercentage,
      hoursSinceLastActivity
    };
  };

  const activityIntelligence = getActivityIntelligence();

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

      {/* Activity Intelligence Widget */}
      <Card className="bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200 shadow-md">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <span className="font-bold text-gray-800 text-sm sm:text-base">Activity Intelligence</span>
                <p className="text-gray-600 mt-0.5 text-xs sm:text-sm">
                  Real-time insights from your tennis data
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 shadow-sm border">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                <div>
                  <div className="text-xs text-gray-500">This Week</div>
                  <div className="font-bold text-gray-800 text-sm">{activityIntelligence.weeklyCount}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 shadow-sm border">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                <div>
                  <div className="text-xs text-gray-500">Energy</div>
                  <div className="font-bold text-gray-800 text-sm">{activityIntelligence.energyLevel}</div>
                </div>
              </div>
              {activityIntelligence.hoursSinceLastActivity > 24 && (
                <div className="flex items-center gap-2 bg-orange-50 rounded-lg px-3 py-1.5 shadow-sm border border-orange-200">
                  <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                  <div>
                    <div className="text-xs text-orange-600">Last Activity</div>
                    <div className="font-bold text-orange-800 text-sm">{Math.round(activityIntelligence.hoursSinceLastActivity)}h ago</div>
                  </div>
                </div>
              )}
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
