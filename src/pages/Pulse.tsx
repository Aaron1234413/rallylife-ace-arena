
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
  AlertTriangle,
  Trophy
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
    <div className="min-h-screen bg-tennis-neutral-50 tennis-court-pattern">
      <div className="p-3 sm:p-4 max-w-7xl mx-auto space-y-6">
        {/* Tennis Court Header Section */}
        <Card className="bg-gradient-to-r from-white via-tennis-green-subtle to-white border-tennis-green-light shadow-lg tennis-court-lines relative overflow-hidden">
          {/* Tennis Net Pattern Background */}
          <div className="absolute inset-0 tennis-net-pattern pointer-events-none"></div>
          
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-tennis-green-primary to-tennis-green-accent flex items-center justify-center shadow-lg">
                  <Bolt className="h-5 w-5 text-white" />
                </div>
                {/* Tennis ball decoration */}
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-tennis-yellow border-2 border-white tennis-ball-texture"></div>
              </div>
              <div>
                <span className="text-tennis-green-dark text-xl sm:text-2xl">Tennis Pulse</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-tennis-yellow animate-tennis-ball-bounce"></div>
                  <div className="w-1 h-1 rounded-full bg-tennis-green-accent" style={{ animationDelay: '0.3s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-tennis-yellow animate-tennis-ball-bounce" style={{ animationDelay: '0.6s' }}></div>
                </div>
              </div>
            </CardTitle>
            <p className="text-tennis-neutral-600 relative z-10">
              Your activity timeline, achievements, and leaderboard standings
            </p>
          </CardHeader>
          <CardContent className="relative z-10">
            {/* Tennis Court Style Filters */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-tennis-green-light">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-tennis-green-primary flex items-center justify-center">
                  <Clock className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-medium text-tennis-green-dark">Time Period:</span>
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="w-32 border-tennis-green-light bg-white hover:bg-tennis-green-subtle transition-colors">
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
              
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-tennis-yellow flex items-center justify-center">
                  <Trophy className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-medium text-tennis-green-dark">Activity Type:</span>
                <Select value={activityFilter} onValueChange={setActivityFilter}>
                  <SelectTrigger className="w-32 border-tennis-green-light bg-white hover:bg-tennis-green-subtle transition-colors">
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

        {/* Tennis Scoreboard Intelligence Widget */}
        <Card className="tennis-card-action bg-gradient-to-r from-white via-tennis-yellow-light to-white border-tennis-yellow shadow-md backdrop-blur-sm relative overflow-hidden">
          {/* Tennis ball texture background */}
          <div className="absolute inset-0 tennis-ball-texture pointer-events-none"></div>
          
          <CardContent className="p-4 sm:p-6 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-tennis-green-primary to-tennis-green-accent text-white shadow-lg">
                    <Clock className="h-5 w-5" />
                  </div>
                  {/* Bouncing tennis ball */}
                  <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-tennis-yellow animate-tennis-ball-bounce"></div>
                </div>
                <div>
                  <span className="font-bold text-tennis-green-dark text-lg sm:text-xl">Match Intelligence</span>
                  <p className="text-tennis-neutral-600 mt-1 text-sm sm:text-base">
                    Live insights from your tennis performance data
                  </p>
                </div>
              </div>
              
              {/* Tennis Scoreboard Style Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="tennis-card-stats flex items-center gap-3 bg-white/90 rounded-lg px-4 py-3 shadow-sm border border-tennis-green-light backdrop-blur-sm hover-lift">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-tennis-green-accent" />
                  <div>
                    <div className="text-xs text-tennis-neutral-500 font-medium">This Week</div>
                    <div className="font-bold text-tennis-green-dark text-lg">{activityIntelligence.weeklyCount}</div>
                  </div>
                </div>
                
                <div className="tennis-card-stats flex items-center gap-3 bg-white/90 rounded-lg px-4 py-3 shadow-sm border border-tennis-yellow backdrop-blur-sm hover-lift">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-tennis-yellow-dark" />
                  <div>
                    <div className="text-xs text-tennis-neutral-500 font-medium">Energy Level</div>
                    <div className="font-bold text-tennis-green-dark text-lg">{activityIntelligence.energyLevel}</div>
                  </div>
                </div>
                
                {activityIntelligence.hoursSinceLastActivity > 24 && (
                  <div className="flex items-center gap-3 bg-orange-50/90 rounded-lg px-4 py-3 shadow-sm border border-orange-200/50 backdrop-blur-sm hover-lift col-span-2 sm:col-span-1">
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                    <div>
                      <div className="text-xs text-orange-600 font-medium">Last Match</div>
                      <div className="font-bold text-orange-800 text-lg">{Math.round(activityIntelligence.hoursSinceLastActivity)}h ago</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tennis Court Layout - Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Court - Activity Timeline (60% on desktop) */}
          <div className="lg:col-span-3">
            <div className="tennis-card-stats rounded-lg overflow-hidden">
              <ActivityTimeline
                activities={activities}
                timeFilter={timeFilter}
                activityFilter={activityFilter}
                loading={activityLoading}
              />
            </div>
          </div>

          {/* Right Court - Achievements and Leaderboard (40% on desktop) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tennis Trophy Achievements Section */}
            <Card className="tennis-achievement-glow bg-gradient-to-br from-tennis-yellow-light via-white to-tennis-yellow-light border-tennis-yellow shadow-lg relative overflow-hidden">
              {/* Tennis net pattern */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-tennis-green-primary to-transparent opacity-30"></div>
              
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-tennis-green-dark">
                  <div className="relative">
                    <Trophy className="h-6 w-6 text-tennis-yellow-dark" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-tennis-green-accent animate-pulse"></div>
                  </div>
                  Recent Trophies
                </CardTitle>
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
                      className="text-sm text-tennis-green-accent hover:text-tennis-green-primary font-medium transition-colors hover:underline"
                    >
                      View All Achievements →
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tennis Leaderboard Section */}
            <Card className="tennis-card-stats bg-white/95 backdrop-blur-sm border-tennis-green-light shadow-lg relative overflow-hidden">
              {/* Court line decoration */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-tennis-green-primary to-transparent opacity-30"></div>
              
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-tennis-green-dark">
                  <div className="relative">
                    <TrendingUp className="h-6 w-6 text-tennis-green-accent" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-tennis-yellow animate-tennis-ball-bounce"></div>
                  </div>
                  Court Champions
                </CardTitle>
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
    </div>
  );
};

export default Pulse;
