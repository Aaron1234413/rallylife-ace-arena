import React, { useMemo, useState, useEffect } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlayerLeaderboardEntry } from './PlayerLeaderboardEntry';
import { LeaderboardEntry } from './LeaderboardEntry';
import { LeaderboardFilters } from './LeaderboardFilters';
import { usePlayerLeaderboards } from '@/hooks/usePlayerLeaderboards';
import { useCoachLeaderboards } from '@/hooks/useCoachLeaderboards';
import { useAuth } from '@/hooks/useAuth';
import { 
  Trophy, 
  TrendingUp, 
  Users, 
  RefreshCw,
  ChevronDown,
  Loader2
} from 'lucide-react';

interface VirtualizedLeaderboardProps {
  userType: 'player' | 'coach';
  filters: any;
  height?: number;
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  isLoadingMore?: boolean;
}

const ITEM_HEIGHT = 80;
const ITEMS_PER_PAGE = 50;

// Loading skeleton component
const LeaderboardSkeleton = () => (
  <div className="p-4 space-y-3">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-3 w-[150px]" />
        </div>
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-20" />
      </div>
    ))}
  </div>
);

// Optimistic update overlay
const OptimisticOverlay = ({ isVisible, action }: { isVisible: boolean; action?: string }) => {
  if (!isVisible) return null;
  
  return (
    <div className="absolute inset-0 bg-tennis-green-bg/20 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
      <div className="bg-white rounded-lg p-4 shadow-lg flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-tennis-green-primary" />
        <span className="text-tennis-green-dark text-sm">
          {action || 'Processing...'}
        </span>
      </div>
    </div>
  );
};

export function VirtualizedLeaderboard({ 
  userType, 
  filters, 
  height = 600,
  onLoadMore,
  hasNextPage,
  isLoadingMore 
}: VirtualizedLeaderboardProps) {
  const { user } = useAuth();
  const [optimisticActions, setOptimisticActions] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [allData, setAllData] = useState<any[]>([]);

  // Determine current user role for action visibility
  const currentUserRole = user?.user_metadata?.role || 'player';

  // Fetch data based on user type and filters
  const playerQuery = usePlayerLeaderboards();
  const coachQuery = useCoachLeaderboards();

  // Current query based on user type
  const currentData = userType === 'player' 
    ? playerQuery.leaderboard 
    : coachQuery.getLeaderboard(filters.category || 'overall', filters.period || 'all_time').data;
  
  const isLoading = userType === 'player' 
    ? playerQuery.isLoading 
    : coachQuery.getLeaderboard(filters.category || 'overall', filters.period || 'all_time').isLoading;
    
  const error = userType === 'player' 
    ? playerQuery.error 
    : coachQuery.getLeaderboard(filters.category || 'overall', filters.period || 'all_time').error;
    
  const refetch = () => {
    if (userType === 'player') {
      playerQuery.refresh();
    } else {
      coachQuery.getLeaderboard(filters.category || 'overall', filters.period || 'all_time').refetch();
    }
  };

  // Filter and sort data based on filters
  const filteredData = useMemo(() => {
    if (!currentData) return [];

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

    // Apply level range filter
    if (filters.levelRange && filters.levelRange[0] !== 1 || filters.levelRange[1] !== 100) {
      filtered = filtered.filter(item => {
        const level = userType === 'player' 
          ? item.current_level 
          : item.metadata?.current_level || 1;
        return level >= filters.levelRange[0] && level <= filters.levelRange[1];
      });
    }

    // Apply location filter (mock implementation)
    if (filters.location) {
      // In a real app, this would filter by actual location data
      filtered = filtered.filter(() => Math.random() > 0.5); // Mock filter
    }

    // Apply specialization filter for coaches
    if (userType === 'coach' && filters.specialization) {
      filtered = filtered.filter(() => Math.random() > 0.3); // Mock filter
    }

    // Apply custom sorting
    if (filters.sortBy === 'recent_activity') {
      filtered.sort(() => Math.random() - 0.5); // Mock sorting
    } else if (filters.sortBy === 'connections') {
      filtered.sort(() => Math.random() - 0.5); // Mock sorting
    }

    return filtered;
  }, [currentData, filters, userType]);

  // Handle optimistic actions
  const handleOptimisticAction = async (targetId: string, action: string, actionFn: () => Promise<void>) => {
    setOptimisticActions(prev => ({ ...prev, [targetId]: action }));
    
    try {
      await actionFn();
      setTimeout(() => {
        setOptimisticActions(prev => {
          const newState = { ...prev };
          delete newState[targetId];
          return newState;
        });
      }, 1000);
    } catch (error) {
      setOptimisticActions(prev => {
        const newState = { ...prev };
        delete newState[targetId];
        return newState;
      });
    }
  };

  // Load more data
  const handleLoadMore = () => {
    if (!isLoadingMore && hasNextPage) {
      setCurrentPage(prev => prev + 1);
      onLoadMore?.();
    }
  };

  // Row renderer for virtualization
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = filteredData[index];
    const isOptimisticUpdate = optimisticActions[item?.player_id || item?.coach_id];

    if (!item) {
      return (
        <div style={style} className="p-2">
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      );
    }

    // Load more trigger
    if (index === filteredData.length - 5 && hasNextPage && !isLoadingMore) {
      handleLoadMore();
    }

    return (
      <div style={style} className="p-2">
        <div className="relative">
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
          <OptimisticOverlay 
            isVisible={!!isOptimisticUpdate}
            action={isOptimisticUpdate}
          />
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <LeaderboardSkeleton />;
  }

  if (error) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm border-tennis-green-light shadow-lg">
        <CardContent className="p-8 text-center">
          <TrendingUp className="h-12 w-12 text-tennis-green-medium mx-auto mb-4" />
          <h3 className="text-heading-md text-tennis-green-dark mb-2">
            Unable to load leaderboard
          </h3>
          <p className="text-tennis-green-medium mb-4">
            Please try again or check your connection
          </p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
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
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="text-tennis-green-medium hover:text-tennis-green-dark"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
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
          <div className="relative">
            <List
              height={height}
              width="100%"
              itemCount={filteredData.length}
              itemSize={ITEM_HEIGHT}
              overscanCount={5}
              className="scrollbar-thin scrollbar-thumb-tennis-green-light scrollbar-track-transparent"
            >
              {Row}
            </List>
            
            {/* Load More Indicator */}
            {(hasNextPage || isLoadingMore) && (
              <div className="p-4 text-center border-t border-tennis-green-light/20">
                {isLoadingMore ? (
                  <div className="flex items-center justify-center gap-2 text-tennis-green-medium">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading more...
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={handleLoadMore}
                    className="text-tennis-green-medium hover:text-tennis-green-dark"
                  >
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Load More
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}