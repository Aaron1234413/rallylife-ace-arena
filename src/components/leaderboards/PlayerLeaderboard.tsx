import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trophy, RefreshCw, ChevronDown, Users, Search } from 'lucide-react';
import { usePlayerLeaderboards } from '@/hooks/usePlayerLeaderboards';
import { PlayerLeaderboardEntry } from './PlayerLeaderboardEntry';
import { useAuth } from '@/hooks/useAuth';
import { useProfiles } from '@/hooks/useProfiles';

interface PlayerLeaderboardProps {
  maxEntries?: number;
  showFilters?: boolean;
  compact?: boolean;
  mobileOptimized?: boolean;
}

export function PlayerLeaderboard({ 
  maxEntries = 50,
  showFilters = true,
  compact = false,
  mobileOptimized = false
}: PlayerLeaderboardProps) {
  const { user } = useAuth();
  const [limit, setLimit] = useState(maxEntries);
  const [showMore, setShowMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { leaderboard, isLoading, error, refresh } = usePlayerLeaderboards(
    showMore ? limit * 2 : limit, 
    0
  );

  // Get current user profile to determine role
  const { data: profiles } = useProfiles();
  const currentUserProfile = profiles?.find(p => p.id === user?.id);
  const currentUserRole = currentUserProfile?.role as 'player' | 'coach' | undefined;

  // Filter leaderboard based on search query
  const filteredLeaderboard = leaderboard?.filter(entry => 
    entry.player_name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleLoadMore = () => {
    setShowMore(true);
  };

  const handleRefresh = () => {
    setShowMore(false);
    setSearchQuery('');
    refresh();
  };

  if (error) {
    return (
      <Card className="border-tennis-green-light">
        <CardContent className="p-6">
          <p className="text-red-600">Failed to load player leaderboard</p>
          <Button onClick={handleRefresh} className="mt-2">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {!compact && showFilters && (
        <Card className="border-tennis-green-light">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search players..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-10"
                  />
                </div>
              </div>
              <Button 
                onClick={handleRefresh} 
                disabled={isLoading}
                size="sm"
                variant="outline"
                className="w-full sm:w-auto h-10"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
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
      )}

      <Card className="border-tennis-green-light">
        {compact && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Top Players
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className={compact ? "p-3 sm:p-4" : "p-4 sm:p-6"}>
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
          ) : filteredLeaderboard.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-tennis-green-medium">
                {searchQuery ? `No players found matching "${searchQuery}"` : 'No players found'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {searchQuery ? 'Try a different search term' : 'Be the first to start earning XP!'}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2 sm:space-y-4">
                {filteredLeaderboard.map((entry, index) => (
                  <PlayerLeaderboardEntry
                    key={entry.player_id}
                    entry={entry}
                    index={index}
                    currentUserRole={currentUserRole}
                    mobileOptimized={mobileOptimized}
                  />
                ))}
              </div>
              
              {!showMore && filteredLeaderboard.length >= limit && !searchQuery && (
                <div className="mt-4 sm:mt-6 text-center">
                  <Button
                    onClick={handleLoadMore}
                    variant="outline"
                    className="border-tennis-green-light text-tennis-green-dark hover:bg-tennis-green-bg w-full sm:w-auto h-11"
                  >
                    <ChevronDown className="mr-2 h-4 w-4" />
                    Load More Players
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}