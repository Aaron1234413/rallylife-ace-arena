
import React, { useState } from 'react';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useGooglePlaces, PlaceResult } from '@/hooks/useGooglePlaces';
import { MapView } from '@/components/maps/MapView';
import { UserLocationCard } from '@/components/maps/UserLocationCard';
import { LocationControls } from '@/components/maps/LocationControls';
import { PlacesList } from '@/components/maps/PlacesList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Loader2, Users, MapIcon } from 'lucide-react';

export default function Maps() {
  const [isLocationSharing, setIsLocationSharing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);

  const {
    currentLocation,
    locationPermission,
    nearbyUsers,
    isLoadingNearby,
    updateLocation,
    isUpdatingLocation,
  } = useUserLocation();

  const { searchResults, isSearching, searchPlaces, getPlaceDetails, clearResults } = useGooglePlaces();

  const handleToggleSharing = (enabled: boolean) => {
    setIsLocationSharing(enabled);
    if (currentLocation) {
      updateLocation({
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        isSharing: enabled
      });
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim() && currentLocation) {
      searchPlaces(searchQuery, currentLocation);
    }
  };

  const handleUserClick = (user: any) => {
    setSelectedUser(user);
  };

  const handlePlaceClick = (place: PlaceResult) => {
    setSelectedPlace(place);
  };

  const coachCount = nearbyUsers.filter(user => user.role === 'coach').length;
  const playerCount = nearbyUsers.filter(user => user.role === 'player').length;

  if (locationPermission === 'denied') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-tennis-green-dark via-tennis-green-medium to-tennis-green-light">
        <div className="container mx-auto p-6">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 p-12">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-tennis-green-bg/30 rounded-full flex items-center justify-center mx-auto">
                <MapPin className="h-10 w-10 text-tennis-green-medium" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-tennis-green-dark mb-3">Location Access Required</h1>
                <p className="text-tennis-green-dark/70 text-lg max-w-md mx-auto">
                  To find nearby tennis courts, coaches, and players, please enable location access in your browser settings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentLocation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-tennis-green-dark via-tennis-green-medium to-tennis-green-light">
        <div className="container mx-auto p-6">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 p-12">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-tennis-green-bg/30 rounded-full flex items-center justify-center mx-auto">
                <Loader2 className="h-10 w-10 animate-spin text-tennis-green-medium" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-tennis-green-dark mb-3">Getting Your Location...</h1>
                <p className="text-tennis-green-dark/70 text-lg">
                  Please wait while we determine your current location.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-tennis-green-dark via-tennis-green-medium to-tennis-green-light">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-white/20 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-tennis-green-primary rounded-full flex items-center justify-center shadow-lg">
              <MapIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-tennis-green-dark">Rako Maps</h1>
              <p className="text-tennis-green-dark/70">Find nearby courts, coaches, and players</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Panel */}
          <div className="space-y-6">
            <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
              <CardContent className="p-0">
                <LocationControls
                  isLocationSharing={isLocationSharing}
                  onToggleSharing={handleToggleSharing}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onSearch={handleSearch}
                  nearbyCount={nearbyUsers.length}
                  coachCount={coachCount}
                  playerCount={playerCount}
                  isSearching={isSearching}
                />
              </CardContent>
            </Card>

            {/* Results Tabs */}
            <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
                  <MapPin className="h-5 w-5" />
                  Search Results
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs defaultValue="users" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mx-4 mb-4 bg-tennis-green-bg/30">
                    <TabsTrigger 
                      value="users" 
                      className="data-[state=active]:bg-tennis-green-primary data-[state=active]:text-white flex items-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      Users ({nearbyUsers.length})
                    </TabsTrigger>
                    <TabsTrigger 
                      value="places"
                      className="data-[state=active]:bg-tennis-green-primary data-[state=active]:text-white flex items-center gap-2"
                    >
                      <MapPin className="w-4 h-4" />
                      Places ({searchResults.length})
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="users" className="mt-0">
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-3 p-4">
                        {isLoadingNearby ? (
                          <div className="text-center py-8">
                            <Loader2 className="h-6 w-6 mx-auto animate-spin text-tennis-green-medium" />
                            <p className="text-sm text-tennis-green-dark/70 mt-2">
                              Finding nearby users...
                            </p>
                          </div>
                        ) : nearbyUsers.length === 0 ? (
                          <div className="text-center py-8">
                            <Users className="h-12 w-12 mx-auto text-tennis-green-medium mb-4" />
                            <p className="text-sm text-tennis-green-dark/70">
                              No users found nearby. Try enabling location sharing to see others!
                            </p>
                          </div>
                        ) : (
                          nearbyUsers.map((user) => (
                            <div key={user.user_id}>
                              <UserLocationCard
                                user={user}
                                onMessage={() => console.log('Message', user.full_name)}
                                onSchedule={() => console.log('Schedule', user.full_name)}
                              />
                              <Separator className="mt-3" />
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="places" className="mt-0">
                    <PlacesList 
                      places={searchResults}
                      onPlaceClick={handlePlaceClick}
                      selectedPlace={selectedPlace}
                      isLoading={isSearching}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Map View */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
              <CardContent className="p-0 h-full">
                <MapView
                  center={currentLocation}
                  nearbyUsers={nearbyUsers}
                  places={searchResults}
                  selectedPlace={selectedPlace}
                  onUserClick={handleUserClick}
                  onPlaceClick={handlePlaceClick}
                  onMapClick={(lat, lng) => console.log('Map clicked:', lat, lng)}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
