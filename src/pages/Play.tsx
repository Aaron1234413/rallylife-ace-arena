import React, { useState, useMemo } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Trophy, 
  Calendar, 
  MapPin, 
  Clock, 
  Star,
  Search,
  Filter,
  Plus,
  Gamepad2,
  Coins,
  SlidersHorizontal,
  Trash2,
  Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Link, useSearchParams } from 'react-router-dom';
import { useLocationBasedSessions } from '@/hooks/useLocationBasedSessions';
import { useLocationBasedRecommendations } from '@/hooks/useLocationBasedRecommendations';
import { useAuth } from '@/hooks/useAuth';
import { EnhancedLocationFilters } from '@/components/play/EnhancedLocationFilters';
import { NearbyPlayersWidget } from '@/components/play/NearbyPlayersWidget';
import { useEnhancedLocation } from '@/hooks/useEnhancedLocation';
import { LocationPermissionHandler } from '@/components/location/LocationPermissionHandler';
import { useJoinSessionState } from '@/hooks/useJoinSessionState';
import { usePlayerTokens } from '@/hooks/usePlayerTokens';
import { usePlayerXP } from '@/hooks/usePlayerXP';
import { usePlayerHP } from '@/hooks/usePlayerHP';
import { useMatchHistory } from '@/hooks/useMatchHistory';
import { useUnifiedSessions } from '@/hooks/useUnifiedSessions';
import { useStandardSessionFetch } from '@/hooks/useStandardSessionFetch';
import { useSessionAutomation } from '@/hooks/useSessionAutomation';
import { toast } from 'sonner';
import { MobileSessionCard } from '@/components/play/MobileSessionCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { PlayerStatsWidget } from '@/components/play/PlayerStatsWidget';
import { SessionCard } from '@/components/sessions/SessionCard';
import { RecommendedSection } from '@/components/play/RecommendedSection';
import { SessionCreationDialog } from '@/components/sessions/SessionCreationDialog';
import { SessionErrorWrapper } from '@/components/sessions/SessionErrorWrapper';
import { SessionListSkeleton } from '@/components/sessions/SessionSkeletons';
import { SessionLoadingState } from '@/components/sessions/SessionLoadingState';
import { PlayerSuggestions } from '@/components/matchmaking/PlayerSuggestions';
import { MatchCard } from '@/components/matchmaking/MatchCard';
import { useMatchmaking } from '@/hooks/useMatchmaking';

const Play = () => {
  const { user } = useAuth();
  const { isJoining, startJoining, stopJoining } = useJoinSessionState();
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get initial tab from URL params or default to "for-you"
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'for-you');
  
  // Matchmaking data
  const { 
    getPendingChallenges,
    getActiveMatches,
    isLoading: matchmakingLoading 
  } = useMatchmaking();
  
  const pendingMatches = getPendingChallenges();
  const activeMatches = getActiveMatches();
  
  // Session creation dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // Standardized session fetching with enhanced error handling
  const { 
    sessions: allSessions,
    availableSessions,
    mySessions,
    loading: sessionsLoading,
    joining,
    joinSession,
    cancelSession,
    refreshSessions
  } = useStandardSessionFetch({
    includeNonClubSessions: true
  });
  
  // Enable real-time updates for Play page sessions
  useSessionAutomation(refreshSessions);
  
  // State for delete operations
  const [deletingStates, setDeletingStates] = useState<Record<string, boolean>>({});
  
  // Token balance for checking stakes
  const { 
    regularTokens, 
    loading: tokensLoading,
    refreshTokens 
  } = usePlayerTokens();

  // Player XP and stats
  const { xpData, loading: xpLoading } = usePlayerXP();
  
  // Player HP data
  const { hpData, loading: hpLoading } = usePlayerHP();
  
  // Match history data  
  const { matchHistory, loading: matchLoading } = useMatchHistory();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Location and filter states
  const [radiusKm, setRadiusKm] = useState(50);
  const [sortBy, setSortBy] = useState('created_at'); // Default to created_at instead of distance
  const [sessionTypeFilter, setSessionTypeFilter] = useState('all');
  const [stakesFilter, setStakesFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [showOnlyWithLocation, setShowOnlyWithLocation] = useState(false);
  const [showTravelTime, setShowTravelTime] = useState(true);
  
  // Enhanced location service
  const {
    hasLocation,
    currentLocation,
    permission,
    isLoading: locationLoading,
    filterByDistance,
    formatDistance,
    formatTravelTime
  } = useEnhancedLocation();
  
  // Location-based data
  const { 
    nearbySessions, 
    nearbyPlayers, 
    loading: nearbyDataLoading
  } = useLocationBasedSessions(radiusKm);

  // Recommendations
  const { recommendations, loading: recommendationsLoading } = useLocationBasedRecommendations(radiusKm);

  // Auto-switch to distance sorting when location becomes available
  React.useEffect(() => {
    if (hasLocation && sortBy === 'created_at') {
      setSortBy('distance');
    }
  }, [hasLocation, sortBy]);

  // Handle tab switching from URL parameters
  React.useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['for-you', 'matchmaking', 'nearby', 'all', 'mine'].includes(tabParam)) {
      setActiveTab(tabParam);
      // Clear the URL parameter after switching
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Use data from standardized hook that already provides filtered sessions
  // No need for manual filtering since useStandardSessionFetch handles this
  
  // Debug logging
  console.log('All sessions:', allSessions.length);
  console.log('Available sessions:', availableSessions.length);
  console.log('My sessions:', mySessions.length);
  console.log('User ID:', user?.id);
  
  // Use static loading state from standardized sessions
  const availableLoading = sessionsLoading;
  const mySessionsLoading = sessionsLoading;

  // Enhanced session filtering and sorting with location integration
  const filteredAndSortedSessions = useMemo(() => {
    let filtered = availableSessions.filter(session => {
      // Search filter
      const matchesSearch = !searchQuery || 
        session.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.creator?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.session_type.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Format filter
      const matchesFormat = selectedFormat === 'all' || 
        session.session_type === selectedFormat ||
        session.format === selectedFormat;

      // Session type filter
      const matchesSessionType = sessionTypeFilter === 'all' || 
        session.session_type === sessionTypeFilter;

      // Stakes filter
      const matchesStakes = stakesFilter === 'all' || 
        (stakesFilter === 'free' && session.stakes_amount === 0) ||
        (stakesFilter === 'low' && session.stakes_amount > 0 && session.stakes_amount <= 50) ||
        (stakesFilter === 'medium' && session.stakes_amount > 50 && session.stakes_amount <= 200) ||
        (stakesFilter === 'high' && session.stakes_amount > 200);

      // Location filter
      const matchesLocation = !showOnlyWithLocation || 
        (session.latitude && session.longitude);
      
      return matchesSearch && matchesFormat && matchesSessionType && matchesStakes && matchesLocation;
    });

    // Apply distance filtering if location is available
    if (hasLocation && currentLocation) {
      const sessionsWithLocation = filtered.filter(s => s.latitude && s.longitude);
      const filteredByDistance = filterByDistance(sessionsWithLocation, radiusKm);
      
      // Combine with sessions without location if not filtering by location only
      if (!showOnlyWithLocation) {
        const sessionsWithoutLocation = filtered.filter(s => !s.latitude || !s.longitude);
        filtered = [...filteredByDistance, ...sessionsWithoutLocation];
      } else {
        filtered = filteredByDistance;
      }
    }

    // Enhanced sorting with location awareness
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          if (!hasLocation || !currentLocation) return 0;
          
          const aHasLocation = a.latitude && a.longitude;
          const bHasLocation = b.latitude && b.longitude;
          
          if (!aHasLocation && !bHasLocation) return 0;
          if (!aHasLocation) return 1;
          if (!bHasLocation) return -1;
          
          // Use enhanced location service for distance calculation
          const aDistance = filterByDistance([a], radiusKm)[0]?.distance?.distanceKm ?? 999;
          const bDistance = filterByDistance([b], radiusKm)[0]?.distance?.distanceKm ?? 999;
          return aDistance - bDistance;
          
        case 'travel_time':
          if (!hasLocation || !currentLocation) return 0;
          
          const aTravelTime = filterByDistance([a], radiusKm)[0]?.distance?.drivingTimeMinutes ?? 999;
          const bTravelTime = filterByDistance([b], radiusKm)[0]?.distance?.drivingTimeMinutes ?? 999;
          return aTravelTime - bTravelTime;
          
        case 'participants':
          return (b.participant_count || 0) - (a.participant_count || 0);
        case 'stakes':
          return b.stakes_amount - a.stakes_amount;
        case 'created_at':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return filtered;
  }, [
    availableSessions, 
    searchQuery, 
    selectedFormat, 
    sessionTypeFilter, 
    stakesFilter, 
    sortBy, 
    showOnlyWithLocation,
    hasLocation,
    currentLocation,
    radiusKm,
    filterByDistance
  ]);

  // Count active filters
  const activeFiltersCount = [
    sessionTypeFilter !== 'all',
    stakesFilter !== 'all',
    levelFilter !== 'all',
    availabilityFilter !== 'all',
    showOnlyWithLocation,
    sortBy !== (hasLocation ? 'distance' : 'created_at')
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSessionTypeFilter('all');
    setStakesFilter('all');
    setLevelFilter('all');
    setAvailabilityFilter('all');
    setShowOnlyWithLocation(false);
    setShowTravelTime(true);
    setSortBy(hasLocation ? 'distance' : 'created_at');
  };

  // For now, all sessions are considered "active" (available)
  const activeSessions = filteredAndSortedSessions;
  const upcomingSessions = []; // We'll enhance this later with scheduled sessions

  // Mobile-first session handlers
  const handleJoinSession = async (sessionId: string): Promise<boolean> => {
    if (isJoining(sessionId)) return false;
    
    startJoining(sessionId);
    
    try {
      await joinSession(sessionId);
      return true;
    } catch (error) {
      console.error('Failed to join session:', error);
      return false;
    } finally {
      stopJoining();
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    setDeletingStates(prev => ({ ...prev, [sessionId]: true }));
    try {
      const success = await cancelSession(sessionId);
      if (success) {
        toast.success('Session deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Failed to delete session');
    } finally {
      setDeletingStates(prev => ({ ...prev, [sessionId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Play Tennis</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="relative"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {isMobile && "Filters"}
                {activeFiltersCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center p-0">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
              <Button size="sm" onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4" />
                {!isMobile && "Create"}
              </Button>
            </div>
          </div>
          
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by location, player, or session type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 pb-24">
        {/* Player Stats Widget */}
        <div className="my-6">
          <PlayerStatsWidget
            level={xpData?.current_level || 1}
            currentXP={xpData?.current_xp || 0}
            xpToNext={xpData?.xp_to_next_level || 100}
            tokens={regularTokens}
            hp={hpData?.current_hp || 100}
            maxHP={hpData?.max_hp || 100}
            matchesWon={matchHistory.matchesWon}
            totalMatches={matchHistory.totalMatches}
            loading={xpLoading || hpLoading || tokensLoading || matchLoading}
          />
        </div>

        {/* Enhanced Filters */}
        {showFilters && (
          <EnhancedLocationFilters
            radiusKm={radiusKm}
            onRadiusChange={setRadiusKm}
            sortBy={sortBy}
            onSortChange={setSortBy}
            sessionTypeFilter={sessionTypeFilter}
            onSessionTypeFilterChange={setSessionTypeFilter}
            stakesFilter={stakesFilter}
            onStakesFilterChange={setStakesFilter}
            levelFilter={levelFilter}
            onLevelFilterChange={setLevelFilter}
            availabilityFilter={availabilityFilter}
            onAvailabilityFilterChange={setAvailabilityFilter}
            showOnlyWithLocation={showOnlyWithLocation}
            onShowOnlyWithLocationChange={setShowOnlyWithLocation}
            showTravelTime={showTravelTime}
            onShowTravelTimeChange={setShowTravelTime}
            hasLocation={hasLocation}
            activeFiltersCount={activeFiltersCount}
            onClearFilters={clearFilters}
            currentLocation={currentLocation}
          />
        )}

        {/* Enhanced Tabs */}
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger 
              value="for-you" 
              className="flex items-center gap-2"
            >
              <Star className="h-4 w-4" />
              For You
            </TabsTrigger>
            <TabsTrigger 
              value="matchmaking"
              className="flex items-center gap-2"
            >
              <Gamepad2 className="h-4 w-4" />
              Matches
            </TabsTrigger>
            <TabsTrigger 
              value="nearby"
              className="flex items-center gap-2"
            >
              <MapPin className="h-4 w-4" />
              Nearby
            </TabsTrigger>
            <TabsTrigger 
              value="all"
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              All ({activeSessions.length})
            </TabsTrigger>
            <TabsTrigger 
              value="mine"
              className="flex items-center gap-2"
            >
              <Trophy className="h-4 w-4" />
              Mine ({mySessions.length})
            </TabsTrigger>
          </TabsList>

          {/* For You Tab */}
          <TabsContent value="for-you" className="space-y-4">
            <RecommendedSection
              recommendations={recommendations}
              onJoinSession={handleJoinSession}
              loading={recommendationsLoading}
            />
            
            {/* Recent Sessions */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Recent Sessions</h2>
              <SessionErrorWrapper 
                context="recent sessions"
                onRetry={refreshSessions}
              >
                {availableLoading ? (
                  <SessionListSkeleton count={3} />
                ) : activeSessions.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <div className="space-y-4">
                        <Gamepad2 className="h-12 w-12 text-muted-foreground mx-auto" />
                        <div>
                          <h3 className="text-lg font-semibold">No Sessions Available</h3>
                          <p className="text-muted-foreground">Be the first to create a session and start playing!</p>
                        </div>
                        <Button onClick={() => setShowCreateDialog(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Session
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {activeSessions.slice(0, 3).map((session) => (
                       <SessionCard
                         key={session.id}
                          session={{...session, status: 'waiting'}}
                         participants={session.participants || []}
                         onJoin={handleJoinSession}
                         onRefresh={refreshSessions}
                         isJoining={isJoining(session.id)}
                         showJoinButton={true}
                       />
                     ))}
                  </div>
                )}
              </SessionErrorWrapper>
            </div>
          </TabsContent>

           {/* Matchmaking Tab */}
          <TabsContent value="matchmaking" className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Find Players</h2>
              <PlayerSuggestions />
            </div>

            {/* Active Matches */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Your Matches</h2>
              
              {(activeMatches.length > 0 || pendingMatches.length > 0) ? (
                <>
                  {/* Pending Matches */}
                  {pendingMatches.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-md font-medium text-muted-foreground">Pending Challenges</h3>
                      {pendingMatches.map((match: any) => (
                        <MatchCard key={match.id} match={match} variant="challenge" />
                      ))}
                    </div>
                  )}

                  {/* Active Matches */}
                  {activeMatches.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-md font-medium text-muted-foreground">Active Matches</h3>
                      {activeMatches.map((match: any) => (
                        <MatchCard key={match.id} match={match} variant="active" />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="space-y-4">
                      <Gamepad2 className="h-12 w-12 text-muted-foreground mx-auto" />
                      <div>
                        <h3 className="text-lg font-semibold">No Matches Yet</h3>
                        <p className="text-muted-foreground">Challenge players above to start your first match!</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Nearby Tab */}
          <TabsContent value="nearby" className="space-y-4">
            {!hasLocation && (
              <LocationPermissionHandler 
                onLocationObtained={() => {
                  toast.success('Location enabled! Finding nearby sessions...');
                }}
                autoRequest={false}
                showDetails={true}
                compact={false}
              />
            )}
            
            <SessionErrorWrapper 
              context="nearby sessions"
              onRetry={refreshSessions}
            >
              {(locationLoading || nearbyDataLoading) ? (
                <SessionListSkeleton count={3} />
              ) : !hasLocation ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="space-y-4">
                      <MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
                      <div>
                        <h3 className="text-lg font-semibold">Location Services Required</h3>
                        <p className="text-muted-foreground">Enable location access to find nearby sessions and players.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : filteredAndSortedSessions.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="space-y-4">
                      <MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
                      <div>
                        <h3 className="text-lg font-semibold">No Nearby Sessions</h3>
                        <p className="text-muted-foreground">No sessions found within {radiusKm}km of your location.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredAndSortedSessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={{...session, status: 'waiting'}}
                      participants={session.participants || []}
                      onJoin={handleJoinSession}
                      onRefresh={refreshSessions}
                      isJoining={isJoining(session.id)}
                      showJoinButton={true}
                      showDistance={true}
                    />
                  ))}
                </div>
              )}
            </SessionErrorWrapper>
          </TabsContent>

          {/* All Sessions Tab */}
          <TabsContent value="all" className="space-y-4">
            <SessionErrorWrapper 
              context="all sessions"
              onRetry={refreshSessions}
            >
              {availableLoading ? (
                <SessionListSkeleton count={6} />
              ) : activeSessions.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="space-y-4">
                      <Gamepad2 className="h-12 w-12 text-muted-foreground mx-auto" />
                      <div>
                        <h3 className="text-lg font-semibold">No Active Sessions</h3>
                        <p className="text-muted-foreground">Be the first to create a session and start playing!</p>
                      </div>
                      <Button onClick={() => setShowCreateDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Session
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {activeSessions.map((session) => (
                         <SessionCard
                           key={session.id}
                           session={{...session, status: 'waiting'}}
                           participants={session.participants || []}
                           onJoin={handleJoinSession}
                           onRefresh={refreshSessions}
                           isJoining={isJoining(session.id)}
                           showJoinButton={true}
                         />
                  ))}
                </div>
              )}
            </SessionErrorWrapper>
          </TabsContent>

          {/* Mine Tab */}
          <TabsContent value="mine" className="space-y-4">
            <SessionErrorWrapper 
              context="my sessions"
              onRetry={refreshSessions}
            >
              {mySessionsLoading ? (
                <SessionListSkeleton count={4} />
              ) : mySessions.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="space-y-4">
                      <Trophy className="h-12 w-12 text-muted-foreground mx-auto" />
                      <div>
                        <h3 className="text-lg font-semibold">No Sessions Yet</h3>
                        <p className="text-muted-foreground">You haven't joined or created any sessions.</p>
                      </div>
                      <Button onClick={() => setShowCreateDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Session
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                 <div className="space-y-4">
                  {mySessions.map((session) => (
                     <SessionCard
                       key={session.id}
                       session={{...session, status: 'waiting'}}
                       participants={session.participants || []}
                       onJoin={handleJoinSession}
                       onRefresh={refreshSessions}
                       isJoining={isJoining(session.id)}
                       showJoinButton={true}
                     />
                  ))}
                </div>
              )}
            </SessionErrorWrapper>
          </TabsContent>
        </Tabs>
      </div>

      {/* Session Creation Dialog */}
      <SessionCreationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          setShowCreateDialog(false);
          // Refresh sessions after creation
          refreshSessions();
        }}
      />
    </div>
  );
};

export default function WrappedPlay() {
  return (
    <ErrorBoundary fallbackTitle="Play Page Error">
      <Play />
    </ErrorBoundary>
  );
}