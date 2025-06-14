
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, ExternalLink } from 'lucide-react';
import { useCoachLeaderboards } from '@/hooks/useCoachLeaderboards';
import { LeaderboardEntry } from './LeaderboardEntry';

interface LeaderboardWidgetProps {
  title?: string;
  leaderboardType?: string;
  periodType?: string;
  maxEntries?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
}

export function LeaderboardWidget({
  title = "Top Coaches",
  leaderboardType = 'overall',
  periodType = 'all_time',
  maxEntries = 5,
  showViewAll = true,
  onViewAll
}: LeaderboardWidgetProps) {
  const { getLeaderboard } = useCoachLeaderboards();
  
  const { data: leaderboardData = [], isLoading } = getLeaderboard(
    leaderboardType,
    periodType,
    maxEntries
  );

  return (
    <Card className="border-tennis-green-light">
      <CardHeader className="bg-tennis-green-light text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="h-5 w-5" />
              {title}
            </CardTitle>
            <CardDescription className="text-tennis-green-bg text-sm">
              Leading coaches this {periodType.replace('_', ' ')}
            </CardDescription>
          </div>
          {showViewAll && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewAll}
              className="text-white hover:bg-white/20"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : leaderboardData.length === 0 ? (
          <div className="text-center py-4">
            <Trophy className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-tennis-green-medium">No data available</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboardData.map((entry, index) => (
              <LeaderboardEntry
                key={entry.coach_id}
                entry={entry}
                leaderboardType={leaderboardType}
                index={index}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
