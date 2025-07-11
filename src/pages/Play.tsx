import React, { useState, useMemo } from 'react';
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
import { useConsolidatedSessions } from '@/hooks/useConsolidatedSessions';
import { useLocationBasedSessions } from '@/hooks/useLocationBasedSessions';
import { useLocationBasedRecommendations } from '@/hooks/useLocationBasedRecommendations';
import { useAuth } from '@/hooks/useAuth';
import { EnhancedLocationFilters } from '@/components/play/EnhancedLocationFilters';
import { NearbyPlayersWidget } from '@/components/play/NearbyPlayersWidget';
import { useJoinSessionState } from '@/hooks/useJoinSessionState';
import { usePlayerTokens } from '@/hooks/usePlayerTokens';
import { usePlayerXP } from '@/hooks/usePlayerXP';
import { usePlayerHP } from '@/hooks/usePlayerHP';
import { useMatchHistory } from '@/hooks/useMatchHistory';
import { useUnifiedSessions } from '@/hooks/useUnifiedSessions';
import { toast } from 'sonner';
import { MobileSessionCard } from '@/components/play/MobileSessionCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { PlayerStatsWidget } from '@/components/play/PlayerStatsWidget';
import { EnhancedSessionCard } from '@/components/play/EnhancedSessionCard';
import { RecommendedSection } from '@/components/play/RecommendedSection';
import { SessionCreationDialog } from '@/components/sessions/SessionCreationDialog';

const Play = () => {
  const { user } = useAuth();
  const { isJoining, startJoining, stopJoining } = useJoinSessionState();
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get initial tab from URL params or default to "for-you"
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'for-you');
  
  // Session creation dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // Add unified sessions hook for delete functionality
  const { cancelSession } = useUnifiedSessions({
    includeNonClubSessions: true
  });
  
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
  
  // Location-based data
  const { 
    nearbySessions, 
    nearbyPlayers, 
    loading: locationLoading,
    hasLocation,
    currentLocation 
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
    if (tabParam && ['for-you', 'nearby', 'all', 'mine'].includes(tabParam)) {
      setActiveTab(tabParam);
      // Clear the URL parameter after switching
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Get consolidated session data with single subscription
  const { 
    availableSessions,
    mySessions, 
    loading: sessionsLoading,
    joinSession,
    error: sessionError 
  } = useConsolidatedSessions();

  // Enhanced session filtering and sorting
  const filteredAndSortedSessions = useMemo(() => {
    let filtered = availableSessions.filter(session => {
      // Search filter
      const matchesSearch = !searchQuery || 
        session.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.creator_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      
      return matchesSearch && matchesFormat && matchesSessionType && matchesStakes;
    });

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          // Use location data if available
          const aDistance = nearbySessions.find(ns => ns.id === a.id)?.distance_km ?? 999;
          const bDistance = nearbySessions.find(ns => ns.id === b.id)?.distance_km ?? 999;
          return aDistance - bDistance;
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
  }, [availableSessions, searchQuery, selectedFormat, sessionTypeFilter, stakesFilter, sortBy, nearbySessions]);

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

  // Separate sessions by timing
  const activeSessions = filteredAndSortedSessions.filter(session => session.status === 'waiting');
  const upcomingSessions = []; // We'll enhance this later with scheduled sessions

  // Mobile-first session handlers
  const handleJoinSession = async (sessionId: string) => {
    if (isJoining(sessionId)) return;
    
    startJoining(sessionId);
    
    try {
      await joinSession(sessionId);
    } catch (error) {
      console.error('Failed to join session:', error);
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
            hp={80} // TODO: Get from player HP hook
            maxHP={100}
            matchesWon={2} // TODO: Get from match history
            totalMatches={5}
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
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger 
              value="for-you" 
              className="flex items-center gap-2"
            >
              <Star className="h-4 w-4" />
              For You
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
              {sessionsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4">
                        <div className="h-20 bg-muted rounded"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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
                    <EnhancedSessionCard
                      key={session.id}
                      session={session}
                      onJoin={handleJoinSession}
                      isJoining={isJoining(session.id)}
                      userBalance={regularTokens}
                      showDistance={hasLocation}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Nearby Tab */}
          <TabsContent value="nearby" className="space-y-4">
            {locationLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-20 bg-muted rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
            ) : nearbySessions.length === 0 ? (
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
                {nearbySessions.map((session) => {
                  const fullSession = availableSessions.find(s => s.id === session.id);
                  if (!fullSession) return null;
                  
                  return (
                    <EnhancedSessionCard
                      key={session.id}
                      session={{...fullSession, distance_km: session.distance_km}}
                      onJoin={handleJoinSession}
                      isJoining={isJoining(session.id)}
                      userBalance={regularTokens}
                      showDistance={true}
                    />
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* All Sessions Tab */}
          <TabsContent value="all" className="space-y-4">
            {sessionsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-20 bg-muted rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
                  <EnhancedSessionCard
                    key={session.id}
                    session={session}
                    onJoin={handleJoinSession}
                    isJoining={isJoining(session.id)}
                    userBalance={regularTokens}
                    showDistance={hasLocation}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Mine Tab */}
          <TabsContent value="mine" className="space-y-4">
            {sessionsLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-20 bg-muted rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
                  <EnhancedSessionCard
                    key={session.id}
                    session={session}
                    onJoin={handleJoinSession}
                    isJoining={isJoining(session.id)}
                    userBalance={regularTokens}
                    showDistance={hasLocation}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Session Creation Dialog */}
      <SessionCreationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          setShowCreateDialog(false);
          toast.success('Session created! It should appear in your sessions shortly.');
        }}
      />
    </div>
  );
};

export default Play;