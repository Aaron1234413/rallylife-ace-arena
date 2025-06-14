
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
import { MapPin, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Maps() {
  const [isLocationSharing, setIsLocationSharing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);

  const {
    currentLocation,
    locationPermission,
    isGettingLocation,
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

  // Show loading state only while actively getting location
  if (isGettingLocation) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 mx-auto animate-spin" />
          <h1 className="text-2xl font-bold">Getting Your Location...</h1>
          <p className="text-muted-foreground">
            Please wait while we determine your current location.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tennis Maps</h1>
          <p className="text-muted-foreground">
            Find nearby courts, coaches, and players in your area
          </p>
        </div>
      </div>

      {/* Location Permission Alert */}
      {locationPermission === 'denied' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Location access is disabled. You can still search for places and use the map, but nearby user features won't be available.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <div className="space-y-4">
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

          {/* Results Tabs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Results
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="users" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="users">Users ({nearbyUsers.length})</TabsTrigger>
                  <TabsTrigger value="places">Places ({searchResults.length})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="users" className="mt-0">
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3 p-4">
                      {isLoadingNearby ? (
                        <div className="text-center py-8">
                          <Loader2 className="h-6 w-6 mx-auto animate-spin" />
                          <p className="text-sm text-muted-foreground mt-2">
                            Finding nearby users...
                          </p>
                        </div>
                      ) : nearbyUsers.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-sm text-muted-foreground">
                            {locationPermission === 'denied' 
                              ? 'Location access required to find nearby users.'
                              : 'No users found nearby. Try enabling location sharing to see others!'
                            }
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
          <Card className="h-[600px]">
            <CardContent className="p-0 h-full">
              {currentLocation ? (
                <MapView
                  center={currentLocation}
                  nearbyUsers={nearbyUsers}
                  places={searchResults}
                  selectedPlace={selectedPlace}
                  onUserClick={handleUserClick}
                  onPlaceClick={handlePlaceClick}
                  onMapClick={(lat, lng) => console.log('Map clicked:', lat, lng)}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Map Unavailable</h3>
                    <p className="text-sm text-muted-foreground">
                      Unable to load map. Please check your internet connection and try again.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
