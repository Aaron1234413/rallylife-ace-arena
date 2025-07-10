import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
import { useSafeRealTimeSessions } from '@/hooks/useSafeRealTimeSessions';
import { useLocationBasedSessions } from '@/hooks/useLocationBasedSessions';
import { useLocationBasedRecommendations } from '@/hooks/useLocationBasedRecommendations';
import { useAuth } from '@/hooks/useAuth';
import { EnhancedLocationFilters } from '@/components/play/EnhancedLocationFilters';
import { NearbyPlayersWidget } from '@/components/play/NearbyPlayersWidget';
import { useJoinSessionState } from '@/hooks/useJoinSessionState';
import { usePlayerTokens } from '@/hooks/usePlayerTokens';
import { TokenInsufficientError } from '@/components/tokens/TokenInsufficientError';
import { useUnifiedSessions } from '@/hooks/useUnifiedSessions';
import { toast } from 'sonner';
import { MobileSessionCard } from '@/components/play/MobileSessionCard';
import { useIsMobile } from '@/hooks/use-mobile';

const Play = () => {
  const { user } = useAuth();
  const { isJoining, startJoining, stopJoining } = useJoinSessionState();
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get initial tab from URL params or default to "active"
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'active');
  
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
    if (tabParam && ['active', 'upcoming', 'my-sessions'].includes(tabParam)) {
      setActiveTab(tabParam);
      // Clear the URL parameter after switching
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Get real session data
  const { 
    sessions: availableSessions, 
    loading: availableLoading, 
    joinSession,
    error: sessionError 
  } = useSafeRealTimeSessions('available', user?.id);
  
  const { 
    sessions: mySessions, 
    loading: mySessionsLoading 
  } = useSafeRealTimeSessions('my-sessions', user?.id);

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'match': return 'bg-red-100 text-red-700';
      case 'social': return 'bg-green-100 text-green-700';
      case 'training': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'match': return Trophy;
      case 'social': return Users;
      case 'training': return Star;
      default: return Gamepad2;
    }
  };

  const SessionCard = ({ session }: { session: any }) => {
    const TypeIcon = getTypeIcon(session.session_type || session.type);
    const sessionType = session.session_type || session.type;
    
    // Find distance data if available
    const nearbySession = nearbySessions.find(ns => ns.id === session.id);
    const distance = nearbySession?.distance_km;
    
    // Check if current user is the session creator
    const isCreator = user && session.creator_id === user.id;
    
    // Token balance checking
    const hasStakes = session.stakes_amount > 0;
    const hasInsufficientTokens = hasStakes && regularTokens < session.stakes_amount;
    const tokensShort = hasInsufficientTokens ? session.stakes_amount - regularTokens : 0;
    
    const handleJoinSession = async () => {
      if (session.user_joined || isJoining(session.id)) return;
      
      startJoining(session.id);
      
      try {
        await joinSession(session.id);
      } catch (error) {
        console.error('Failed to join session:', error);
        // Error is already handled by the hook, just need to ensure we stop joining
      } finally {
        stopJoining();
      }
    };

    const handleDeleteSession = async () => {
      setDeletingStates(prev => ({ ...prev, [session.id]: true }));
      try {
        const success = await cancelSession(session.id);
        if (success) {
          toast.success('Session deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting session:', error);
        toast.error('Failed to delete session');
      } finally {
        setDeletingStates(prev => ({ ...prev, [session.id]: false }));
      }
    };
    
    // Determine card styling based on token availability
    const cardBorderClass = hasInsufficientTokens 
      ? "border-l-red-500" 
      : "border-l-tennis-green-primary";
    
    return (
      <Card className={`hover:shadow-lg transition-all duration-300 border-l-4 ${cardBorderClass}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <TypeIcon className="h-4 w-4 text-tennis-green-primary" />
              <CardTitle className="text-lg">
                {session.title || `${sessionType.charAt(0).toUpperCase() + sessionType.slice(1)} Session`}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-end gap-1">
                <Badge className={getTypeColor(sessionType)}>
                  {sessionType.charAt(0).toUpperCase() + sessionType.slice(1)}
                </Badge>
                {distance && (
                  <Badge variant="outline" className="text-xs">
                    {distance.toFixed(1)}km away
                  </Badge>
                )}
              </div>
              {isCreator && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                      disabled={deletingStates[session.id]}
                      title="Delete session"
                    >
                      {deletingStates[session.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Session</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this session? This action cannot be undone.
                        {session.participant_count && session.participant_count > 0 && (
                          <span className="block mt-2 text-orange-600 font-medium">
                            Warning: This session has {session.participant_count} participant(s) who will be notified of the cancellation.
                          </span>
                        )}
                        {session.stakes_amount > 0 && (
                          <span className="block mt-2 text-blue-600 font-medium">
                            Stakes will be refunded to participants.
                          </span>
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteSession}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete Session
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{session.location || 'Location TBD'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {session.format && <Badge variant="outline">{session.format}</Badge>}
                <Badge variant="outline">{session.status}</Badge>
              </div>
              <div className="text-sm font-medium">
                {session.participant_count || 0}/{session.max_players} players
              </div>
            </div>
            
            {hasStakes && (
              <div className={`flex items-center gap-2 text-sm ${hasInsufficientTokens ? 'text-red-600' : 'text-yellow-600'}`}>
                <Coins className="h-3 w-3" />
                <span className="font-medium">
                  Stakes: {session.stakes_amount} tokens
                </span>
                {hasInsufficientTokens && (
                  <Badge variant="destructive" className="text-xs">
                    Need {tokensShort} more
                  </Badge>
                )}
              </div>
            )}
            
            {/* Token insufficient warning */}
            {hasInsufficientTokens && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">
                    Insufficient Tokens
                  </span>
                </div>
                <p className="text-xs text-red-700 mb-2">
                  You have {regularTokens} tokens but need {session.stakes_amount} to join.
                </p>
                <Link to="/store?category=tokens">
                  <Button size="sm" variant="outline" className="text-xs h-7">
                    Get More Tokens
                  </Button>
                </Link>
              </div>
            )}
            
            {session.notes && (
              <p className="text-sm text-gray-600 italic">{session.notes}</p>
            )}
            
            <div className="flex items-center justify-between pt-2">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">
                  Created by {session.creator_name || 'Unknown'}
                  {isCreator && (
                    <span className="ml-2 text-xs bg-tennis-green-primary/10 text-tennis-green-primary px-2 py-1 rounded">
                      You created this
                    </span>
                  )}
                </span>
                {!tokensLoading && user && (
                  <span className="text-xs text-gray-400">
                    Your balance: {regularTokens} tokens
                  </span>
                )}
              </div>
              
              {!isCreator && (
                hasInsufficientTokens ? (
                  <Button 
                    size="sm" 
                    variant="outline"
                    disabled
                    className="text-red-600 border-red-300"
                  >
                    Need {tokensShort} More Tokens
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    className={session.user_joined 
                      ? "bg-green-500 hover:bg-green-600 text-white" 
                      : "bg-tennis-green-primary hover:bg-tennis-green-medium"
                    }
                    onClick={handleJoinSession}
                    disabled={session.user_joined || !user || isJoining(session.id)}
                    title={!user ? 'Please log in to join sessions' : undefined}
                  >
                    {isJoining(session.id) ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                        Joining...
                      </div>
                    ) : session.user_joined ? '✓ Joined' : 'Join Session'}
                  </Button>
                )
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Play</h1>
              <p className="text-sm text-muted-foreground">Find players and join games in your area</p>
            </div>
            <Link to="/sessions/create">
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Create Session
              </Button>
            </Link>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search sessions, players, or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              <Filter className="h-4 w-4" />
              {activeFiltersCount > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Player Stats Widget */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Your Stats</h3>
              <Badge variant="outline" className="bg-primary/10">Level {Math.floor((regularTokens || 0) / 100) + 1}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{regularTokens || 0}</div>
                <div className="text-sm text-muted-foreground">Tokens</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">{Math.floor((regularTokens || 0) * 1.5)}</div>
                <div className="text-sm text-muted-foreground">XP</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{Math.max(85, 100 - Math.floor((regularTokens || 0) / 20))}</div>
                <div className="text-sm text-muted-foreground">Health</div>
              </div>
            </div>
          </CardContent>
        </Card>

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

        {/* Smart Recommendations - Show top recommendations */}
        {hasLocation && recommendations.length > 0 && (
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-blue-600" />
                Recommended for You
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {recommendations.slice(0, 2).map((session) => (
                  <div key={session.id} className="p-3 border rounded-lg bg-blue-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{session.title}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(session.recommendation_score * 100)}% match
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{session.recommendation_reason}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{session.distance_km.toFixed(1)}km away</span>
                      <Button size="sm" onClick={() => joinSession(session.id)}>
                        Join Session
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Location Status and Nearby Players */}
        {!hasLocation && (
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-yellow-600" />
                <div>
                  <h3 className="font-medium text-yellow-800">Location Access Needed</h3>
                  <p className="text-sm text-yellow-700">
                    Enable location services to see nearby players and sessions. 
                    Click the location icon in your browser's address bar to allow location access.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {hasLocation && (
          <NearbyPlayersWidget
            players={nearbyPlayers}
            loading={locationLoading}
            onMessagePlayer={(playerId) => {
              // Navigate to messages with this player
              console.log('Message player:', playerId);
            }}
            onInvitePlayer={(playerId) => {
              // Create invitation to join session
              console.log('Invite player:', playerId);
            }}
          />
        )}

        {/* Session Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="for-you">For You</TabsTrigger>
            <TabsTrigger value="nearby">
              Nearby
              {hasLocation && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {nearbySessions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="active">
              All
              <Badge variant="secondary" className="ml-1 text-xs">
                {activeSessions.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="my-sessions">
              Mine
              <Badge variant="secondary" className="ml-1 text-xs">
                {mySessions.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="for-you" className="space-y-4">
            <div className="space-y-4">
              {/* Recommended Sessions */}
              {hasLocation && recommendations.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Recommended for You</h3>
                  {recommendations.slice(0, 3).map((session) => (
                    <Card key={session.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{session.title}</h4>
                          <Badge className="bg-primary/10 text-primary">
                            {Math.round(session.recommendation_score * 100)}% match
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{session.recommendation_reason}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{session.distance_km.toFixed(1)}km away</span>
                          <Button size="sm" onClick={() => joinSession(session.id)}>
                            Join Session
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              {/* Popular Sessions */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Popular Sessions</h3>
                <div className={`space-y-4 ${!isMobile && 'md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-y-0'}`}>
                  {activeSessions.slice(0, 6).map((session) => {
                    const nearbySession = nearbySessions.find(ns => ns.id === session.id);
                    const distance = nearbySession?.distance_km;
                    
                    return isMobile ? (
                      <MobileSessionCard
                        key={session.id}
                        session={session}
                        user={user}
                        onJoinSession={handleJoinSession}
                        onDeleteSession={handleDeleteSession}
                        isJoining={isJoining(session.id)}
                        isDeleting={deletingStates[session.id] || false}
                        regularTokens={regularTokens}
                        distance={distance}
                      />
                    ) : (
                      <SessionCard key={session.id} session={session} />
                    );
                  })}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="nearby" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Nearby Sessions
                {hasLocation && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    (Within {radiusKm}km)
                  </span>
                )}
              </h2>
              {hasLocation && (
                <Badge variant="outline">
                  {nearbySessions.length} nearby
                </Badge>
              )}
            </div>
            
            {!hasLocation ? (
              <Card className="border-l-4 border-l-yellow-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-yellow-600" />
                    <div>
                      <h3 className="font-medium text-yellow-800">Location Access Needed</h3>
                      <p className="text-sm text-yellow-700">
                        Enable location services to see nearby sessions.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className={`space-y-4 ${!isMobile && 'md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-y-0'}`}>
                {nearbySessions.map((nearbySession) => {
                  const session = activeSessions.find(s => s.id === nearbySession.id);
                  if (!session) return null;
                  
                  return isMobile ? (
                    <MobileSessionCard
                      key={session.id}
                      session={session}
                      user={user}
                      onJoinSession={handleJoinSession}
                      onDeleteSession={handleDeleteSession}
                      isJoining={isJoining(session.id)}
                      isDeleting={deletingStates[session.id] || false}
                      regularTokens={regularTokens}
                      distance={nearbySession.distance_km}
                    />
                  ) : (
                    <SessionCard key={session.id} session={session} />
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                All Sessions
                {hasLocation && sortBy === 'distance' && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    (Sorted by distance)
                  </span>
                )}
              </h2>
              <div className="flex items-center gap-2">
                {hasLocation && (
                  <Badge variant="outline" className="text-xs">
                    Within {radiusKm}km
                  </Badge>
                )}
                <Badge variant="outline">
                  {activeSessions.length} available
                </Badge>
              </div>
            </div>
            
            {sessionError && (
              <Card className="border-l-4 border-l-red-500 mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 text-red-600">⚠️</div>
                    <div>
                      <h3 className="font-medium text-red-800">Failed to Load Sessions</h3>
                      <p className="text-sm text-red-700">
                        There was an error loading sessions. Please try refreshing the page.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {availableLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-tennis-green-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading sessions...</p>
              </div>
            ) : activeSessions.length === 0 ? (
              <div className="text-center py-12">
                <Gamepad2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  No Active Sessions
                </h3>
                <p className="text-gray-500 mb-4">
                  Be the first to create a session in your area!
                </p>
                <Link to="/sessions/create">
                  <Button className="bg-tennis-green-primary hover:bg-tennis-green-medium">
                    Create Session
                  </Button>
                </Link>
              </div>
            ) : (
              <div className={`space-y-4 ${!isMobile && 'md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-y-0'}`}>
                {activeSessions.map((session) => {
                  const nearbySession = nearbySessions.find(ns => ns.id === session.id);
                  const distance = nearbySession?.distance_km;
                  
                  return isMobile ? (
                    <MobileSessionCard
                      key={session.id}
                      session={session}
                      user={user}
                      onJoinSession={handleJoinSession}
                      onDeleteSession={handleDeleteSession}
                      isJoining={isJoining(session.id)}
                      isDeleting={deletingStates[session.id] || false}
                      regularTokens={regularTokens}
                      distance={distance}
                    />
                  ) : (
                    <SessionCard key={session.id} session={session} />
                  );
                })}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="upcoming" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-tennis-green-dark">
                Upcoming Sessions
              </h2>
              <Badge variant="outline">
                {upcomingSessions.length} scheduled
              </Badge>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingSessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="my-sessions" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-tennis-green-dark">
                My Sessions
              </h2>
              <Badge variant="outline">
                {mySessions.length} sessions
              </Badge>
            </div>
            
            {mySessionsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-tennis-green-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading your sessions...</p>
              </div>
            ) : mySessions.length === 0 ? (
              <div className="text-center py-12">
                <Gamepad2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  No Active Sessions
                </h3>
                <p className="text-gray-500 mb-4">
                  You haven't joined any sessions yet. Start playing!
                </p>
                <Link to="/sessions/create">
                  <Button className="bg-tennis-green-primary hover:bg-tennis-green-medium">
                    Create Your First Session
                  </Button>
                </Link>
              </div>
            ) : (
              <div className={`space-y-4 ${!isMobile && 'md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-y-0'}`}>
                {mySessions.map((session) => {
                  const nearbySession = nearbySessions.find(ns => ns.id === session.id);
                  const distance = nearbySession?.distance_km;
                  
                  return isMobile ? (
                    <MobileSessionCard
                      key={session.id}
                      session={session}
                      user={user}
                      onJoinSession={handleJoinSession}
                      onDeleteSession={handleDeleteSession}
                      isJoining={isJoining(session.id)}
                      isDeleting={deletingStates[session.id] || false}
                      regularTokens={regularTokens}
                      distance={distance}
                    />
                  ) : (
                    <SessionCard key={session.id} session={session} />
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
};

export default Play;