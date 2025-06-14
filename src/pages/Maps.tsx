
import React, { useState } from 'react';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useGooglePlaces } from '@/hooks/useGooglePlaces';
import { MapView } from '@/components/maps/MapView';
import { UserLocationCard } from '@/components/maps/UserLocationCard';
import { LocationControls } from '@/components/maps/LocationControls';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2, RefreshCw, AlertCircle } from 'lucide-react';

export default function Maps() {
  const [isLocationSharing, setIsLocationSharing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const {
    currentLocation,
    locationPermission,
    locationError,
    nearbyUsers,
    isLoadingNearby,
    updateLocation,
    isUpdatingLocation,
  } = useUserLocation();

  const { searchPlaces, isSearching } = useGooglePlaces();

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

  const handleRetryLocation = () => {
    window.location.reload();
  };

  const coachCount = nearbyUsers.filter(user => user.role === 'coach').length;
  const playerCount = nearbyUsers.filter(user => user.role === 'player').length;

  if (locationPermission === 'denied' || locationError) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center space-y-6 max-w-md mx-auto">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
          <h1 className="text-2xl font-bold">Location Access Required</h1>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              {locationError || 'To find nearby tennis courts, coaches, and players, please enable location access in your browser settings.'}
            </p>
            <div className="space-y-2 text-sm text-muted-foreground text-left bg-muted p-4 rounded-lg">
              <p className="font-medium">To enable location access:</p>
              <ul className="space-y-1 ml-4">
                <li>• Click the location icon in your browser's address bar</li>
                <li>• Select "Allow" for location permissions</li>
                <li>• Refresh the page after granting permission</li>
              </ul>
            </div>
            <Button onClick={handleRetryLocation} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Location Access
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentLocation) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 mx-auto animate-spin" />
          <h1 className="text-2xl font-bold">Getting Your Location...</h1>
          <p className="text-muted-foreground">
            Please wait while we determine your current location.
          </p>
          <p className="text-sm text-muted-foreground">
            Make sure you've allowed location access when prompted by your browser.
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
          />

          {/* Nearby Users List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Nearby Users
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
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
            </CardContent>
          </Card>
        </div>

        {/* Map View */}
        <div className="lg:col-span-2">
          <Card className="h-[600px]">
            <CardContent className="p-0 h-full">
              <MapView
                center={currentLocation}
                nearbyUsers={nearbyUsers}
                onUserClick={handleUserClick}
                onMapClick={(lat, lng) => console.log('Map clicked:', lat, lng)}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
