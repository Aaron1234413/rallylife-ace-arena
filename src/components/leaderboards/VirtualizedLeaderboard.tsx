import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlayerLeaderboardEntry } from './PlayerLeaderboardEntry';
import { LeaderboardEntry } from './LeaderboardEntry';
import { usePlayerLeaderboards } from '@/hooks/usePlayerLeaderboards';
import { useCoachLeaderboards } from '@/hooks/useCoachLeaderboards';
import { useAuth } from '@/hooks/useAuth';
import { 
  Trophy, 
  TrendingUp, 
  Users, 
  RefreshCw
} from 'lucide-react';

interface VirtualizedLeaderboardProps {
  userType: 'player' | 'coach';
  filters: any;
  height?: number;
}

export function VirtualizedLeaderboard({ 
  userType, 
  filters, 
  height = 600
}: VirtualizedLeaderboardProps) {
  const { user } = useAuth();
  const currentUserRole = user?.user_metadata?.role || 'player';

  // Fetch data based on user type
  const playerQuery = usePlayerLeaderboards();
  const coachQuery = useCoachLeaderboards();

  const currentData = userType === 'player' 
    ? playerQuery.leaderboard 
    : coachQuery.getLeaderboard(filters.category || 'overall', filters.period || 'all_time').data;
  
  const isLoading = userType === 'player' 
    ? playerQuery.isLoading 
    : coachQuery.getLeaderboard(filters.category || 'overall', filters.period || 'all_time').isLoading;

  // Filter data based on filters
  const filteredData = useMemo(() => {
    if (!currentData) return [];
    
    let filtered = [...currentData];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(item => {
        const name = userType === 'player' 
          ? item.player_name?.toLowerCase() 
          : item.coach_name?.toLowerCase();
        return name?.includes(searchLower);
      });
    }

    return filtered;
  }, [currentData, filters, userType]);

  if (isLoading) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm border-tennis-green-light shadow-lg">
        <CardContent className="p-4 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-3 w-[150px]" />
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-tennis-green-light shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-tennis-yellow-dark" />
            <CardTitle className="orbitron-heading text-heading-md text-tennis-green-dark">
              {userType === 'player' ? 'Player Leaderboard' : 'Coach Leaderboard'}
            </CardTitle>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {filteredData.length} {userType}s
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {filteredData.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="h-12 w-12 text-tennis-green-medium mx-auto mb-4" />
            <h3 className="text-heading-md text-tennis-green-dark mb-2">
              No {userType}s found
            </h3>
            <p className="text-tennis-green-medium">
              Try adjusting your filters or search terms
            </p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {filteredData.map((item, index) => (
              <div key={item.player_id || item.coach_id} className="p-2">
                {userType === 'player' ? (
                  <PlayerLeaderboardEntry
                    entry={item}
                    index={index}
                    currentUserRole={currentUserRole}
                  />
                ) : (
                  <LeaderboardEntry
                    entry={item}
                    leaderboardType={filters.category || 'overall'}
                    index={index}
                    currentUserRole={currentUserRole}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}