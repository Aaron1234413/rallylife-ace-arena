
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, RefreshCw, TrendingUp } from 'lucide-react';
import { useCoachLeaderboards } from '@/hooks/useCoachLeaderboards';

interface CoachLeaderboardProps {
  maxEntries?: number;
}

export function CoachLeaderboard({ 
  maxEntries = 50 
}: CoachLeaderboardProps) {
  const { getCXPLeaderboard, refresh } = useCoachLeaderboards();

  const { data: leaderboardData = [], isLoading, error } = getCXPLeaderboard(maxEntries);

  const handleRefresh = () => {
    refresh();
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
            Ranked by coaching level and total experience points earned
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex justify-end">
            <Button 
              onClick={handleRefresh} 
              disabled={isLoading}
              size="sm"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Simple CXP Leaderboard */}
      <Card className="border-tennis-green-light">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Coach Experience (CXP)
          </CardTitle>
          <CardDescription>
            Ranked by coaching level and total experience points earned
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
                <div key={entry.coach_id} className="flex items-center justify-between p-3 rounded-lg border border-tennis-green-subtle">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-tennis-green-primary text-white flex items-center justify-center font-bold text-sm">
                      {entry.rank_position}
                    </div>
                    <div>
                      <div className="font-semibold text-tennis-green-dark">{entry.coach_name}</div>
                      <div className="text-sm text-tennis-green-medium">
                        Level {entry.current_level} • {entry.coaching_tier}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-tennis-green-dark">{entry.total_cxp_earned.toLocaleString()} CXP</div>
                    <div className="text-sm text-tennis-green-medium">{entry.current_cxp}/{entry.current_cxp + entry.cxp_to_next_level}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
