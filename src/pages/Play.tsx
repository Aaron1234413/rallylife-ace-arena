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
  SlidersHorizontal
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { useSafeRealTimeSessions } from '@/hooks/useSafeRealTimeSessions';
import { useLocationBasedSessions } from '@/hooks/useLocationBasedSessions';
import { useLocationBasedRecommendations } from '@/hooks/useLocationBasedRecommendations';
import { useAuth } from '@/hooks/useAuth';
import { EnhancedLocationFilters } from '@/components/play/EnhancedLocationFilters';
import { NearbyPlayersWidget } from '@/components/play/NearbyPlayersWidget';

const Play = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Location and filter states
  const [radiusKm, setRadiusKm] = useState(50);
  const [sortBy, setSortBy] = useState('distance');
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

  // Get real session data
  const { 
    sessions: availableSessions, 
    loading: availableLoading, 
    joinSession 
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
    
    const handleJoinSession = async () => {
      if (session.user_joined) return;
      await joinSession(session.id);
    };
    
    return (
      <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-tennis-green-primary">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <TypeIcon className="h-4 w-4 text-tennis-green-primary" />
              <CardTitle className="text-lg">
                {session.title || `${sessionType.charAt(0).toUpperCase() + sessionType.slice(1)} Session`}
              </CardTitle>
            </div>
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
            
            {session.stakes_amount > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Coins className="h-3 w-3 text-yellow-600" />
                <span className="text-yellow-600 font-medium">
                  Stakes: {session.stakes_amount} tokens
                </span>
              </div>
            )}
            
            {session.notes && (
              <p className="text-sm text-gray-600 italic">{session.notes}</p>
            )}
            
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-gray-500">
                Created by {session.creator_name || 'Unknown'}
              </span>
              <Button 
                size="sm" 
                className="bg-tennis-green-primary hover:bg-tennis-green-medium"
                onClick={handleJoinSession}
                disabled={session.user_joined}
              >
                {session.user_joined ? 'Joined' : 'Join Session'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-tennis-green-bg">
      <div className="p-3 sm:p-4 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-tennis-green-dark mb-2">
            Find Your Match 🎾
          </h1>
          <p className="text-tennis-green-medium">
            Discover players, join sessions, and compete in your area
          </p>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by location, player name, or session type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant={showFilters ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
                <Link to="/sessions/create">
                  <Button size="sm" className="bg-tennis-green-primary hover:bg-tennis-green-medium">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Session
                  </Button>
                </Link>
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
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">
              Active Now
              <Badge variant="secondary" className="ml-2">
                {activeSessions.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="my-sessions">
              My Sessions
              <Badge variant="secondary" className="ml-2">
                {mySessions.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-tennis-green-dark">
                Active Sessions
                {hasLocation && sortBy === 'distance' && (
                  <span className="text-sm font-normal text-gray-600 ml-2">
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
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeSessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
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
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {mySessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
};

export default Play;