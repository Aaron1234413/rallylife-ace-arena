
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Medal, Award, RefreshCw, Crown, Star, TrendingUp } from 'lucide-react';
import { useCoachLeaderboards } from '@/hooks/useCoachLeaderboards';
import { LeaderboardEntry } from './LeaderboardEntry';
import { useAuth } from '@/hooks/useAuth';
import { useProfiles } from '@/hooks/useProfiles';

interface CoachLeaderboardProps {
  defaultType?: string;
  defaultPeriod?: string;
  maxEntries?: number;
}

export function CoachLeaderboard({ 
  defaultType = 'overall',
  defaultPeriod = 'all_time',
  maxEntries = 50 
}: CoachLeaderboardProps) {
  const { user } = useAuth();
  const [leaderboardType, setLeaderboardType] = useState(defaultType);
  const [periodType, setPeriodType] = useState(defaultPeriod);
  const { getLeaderboard, calculateLeaderboards, isCalculating } = useCoachLeaderboards();

  // Get current user profile to determine role
  const { data: profiles } = useProfiles();
  const currentUserProfile = profiles?.find(p => p.id === user?.id);
  const currentUserRole = currentUserProfile?.role as 'player' | 'coach' | undefined;

  const { data: leaderboardData = [], isLoading, error } = getLeaderboard(
    leaderboardType,
    periodType,
    maxEntries
  );

  const handleRefresh = () => {
    calculateLeaderboards({ 
      leaderboardType: leaderboardType === 'overall' ? 'all' : leaderboardType,
      periodType 
    });
  };

  const getLeaderboardIcon = (type: string) => {
    switch (type) {
      case 'crp': return <Award className="h-5 w-5" />;
      case 'cxp': return <TrendingUp className="h-5 w-5" />;
      case 'player_success': return <Star className="h-5 w-5" />;
      default: return <Crown className="h-5 w-5" />;
    }
  };

  const getLeaderboardTitle = (type: string) => {
    switch (type) {
      case 'crp': return 'Coach Reputation (CRP)';
      case 'cxp': return 'Coach Experience (CXP)';
      case 'player_success': return 'Player Success Rating';
      default: return 'Overall Ranking';
    }
  };

  const getLeaderboardDescription = (type: string) => {
    switch (type) {
      case 'crp': return 'Ranked by current reputation points and overall reputation level';
      case 'cxp': return 'Ranked by total experience points earned and coaching level';
      case 'player_success': return 'Ranked by average player feedback rating and success metrics';
      default: return 'Composite ranking based on CRP, CXP, and player success';
    }
  };

  if (error) {
    return (
      <Card className="border-tennis-green-light">
        <CardContent className="p-6">
          <p className="text-red-600">Failed to load leaderboards</p>
          <Button onClick={handleRefresh} className="mt-2">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <Card className="border-tennis-green-light">
        <CardHeader className="bg-tennis-green-light text-white">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6" />
            Coach Leaderboards
          </CardTitle>
          <CardDescription className="text-tennis-green-bg">
            Top performing coaches across different metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={periodType} onValueChange={setPeriodType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_time">All Time</SelectItem>
                  <SelectItem value="yearly">This Year</SelectItem>
                  <SelectItem value="monthly">This Month</SelectItem>
                  <SelectItem value="weekly">This Week</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleRefresh} 
              disabled={isCalculating}
              size="sm"
            >
              {isCalculating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard tabs */}
      <Tabs value={leaderboardType} onValueChange={setLeaderboardType}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overall">Overall</TabsTrigger>
          <TabsTrigger value="crp">CRP</TabsTrigger>
          <TabsTrigger value="cxp">CXP</TabsTrigger>
          <TabsTrigger value="player_success">Success</TabsTrigger>
        </TabsList>

        {(['overall', 'crp', 'cxp', 'player_success'] as const).map((type) => (
          <TabsContent key={type} value={type}>
            <Card className="border-tennis-green-light">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getLeaderboardIcon(type)}
                  {getLeaderboardTitle(type)}
                </CardTitle>
                <CardDescription>
                  {getLeaderboardDescription(type)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="animate-pulse flex items-center gap-4">
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="w-16 h-6 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : leaderboardData.length === 0 ? (
                  <div className="text-center py-8">
                    <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-tennis-green-medium">No data available</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Check back later or try refreshing the leaderboards
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {leaderboardData.map((entry, index) => (
                      <LeaderboardEntry
                        key={entry.coach_id}
                        entry={entry}
                        leaderboardType={type}
                        index={index}
                        currentUserRole={currentUserRole}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
