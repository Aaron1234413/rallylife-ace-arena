import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  Info,
  Navigation,
  Shield
} from 'lucide-react';
import { useEnhancedLocation } from '@/hooks/useEnhancedLocation';

interface LocationPermissionHandlerProps {
  onLocationObtained?: (location: { lat: number; lng: number }) => void;
  autoRequest?: boolean;
  showDetails?: boolean;
  compact?: boolean;
}

export const LocationPermissionHandler: React.FC<LocationPermissionHandlerProps> = ({
  onLocationObtained,
  autoRequest = false,
  showDetails = true,
  compact = false
}) => {
  const {
    currentLocation,
    permission,
    isLoading,
    error,
    hasLocation,
    accuracy,
    lastUpdated,
    getCurrentLocation,
    requestPermission,
    updateLocation,
    isUpdatingLocation
  } = useEnhancedLocation();

  const [showHelp, setShowHelp] = useState(false);

  React.useEffect(() => {
    if (hasLocation && onLocationObtained) {
      onLocationObtained(currentLocation!);
    }
  }, [hasLocation, currentLocation, onLocationObtained]);

  React.useEffect(() => {
    if (autoRequest && permission?.permission === 'prompt') {
      handleRequestLocation();
    }
  }, [autoRequest, permission?.permission]);

  const handleRequestLocation = async () => {
    try {
      await getCurrentLocation(true);
    } catch (error) {
      console.error('Failed to get location:', error);
    }
  };

  const handleRequestPermission = async () => {
    try {
      const result = await requestPermission();
      if (result === 'granted') {
        await getCurrentLocation();
      }
    } catch (error) {
      console.error('Failed to request permission:', error);
    }
  };

  const handleUpdateInDatabase = () => {
    if (currentLocation) {
      updateLocation({ location: currentLocation, isSharing: true });
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {hasLocation ? (
          <Badge variant="secondary" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-600" />
            Location Active
          </Badge>
        ) : (
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleRequestLocation}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <MapPin className="h-3 w-3" />
            )}
            {isLoading ? 'Getting...' : 'Get Location'}
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Navigation className="h-5 w-5 text-blue-600" />
          Location Services
          {hasLocation && (
            <Badge variant="secondary" className="ml-2">
              <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
              Active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Permission Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Permission Status</span>
            <Badge 
              variant={permission?.permission === 'granted' ? 'secondary' : 'outline'}
              className="flex items-center gap-1"
            >
              {permission?.permission === 'granted' && <CheckCircle className="h-3 w-3 text-green-600" />}
              {permission?.permission === 'denied' && <AlertTriangle className="h-3 w-3 text-red-600" />}
              {permission?.permission === 'prompt' && <Clock className="h-3 w-3 text-yellow-600" />}
              {permission?.permission || 'Unknown'}
            </Badge>
          </div>

          {showDetails && currentLocation && (
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Coordinates: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}</div>
              {accuracy && <div>Accuracy: ±{Math.round(accuracy)}m</div>}
              {lastUpdated && <div>Last updated: {lastUpdated.toLocaleTimeString()}</div>}
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Permission States */}
        {permission?.permission === 'prompt' && (
          <div className="space-y-3">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Location access will help you find nearby tennis sessions and players.
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleRequestPermission}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <MapPin className="h-4 w-4 mr-2" />
                )}
                Allow Location Access
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowHelp(!showHelp)}
              >
                <Info className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {permission?.permission === 'denied' && (
          <div className="space-y-3">
            <Alert variant="destructive">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Location access has been denied. You can still browse all sessions, but won't see nearby recommendations.
              </AlertDescription>
            </Alert>
            
            <Button 
              variant="outline" 
              onClick={() => setShowHelp(!showHelp)}
              className="w-full"
            >
              <Info className="h-4 w-4 mr-2" />
              How to Enable Location
            </Button>
          </div>
        )}

        {permission?.permission === 'granted' && !hasLocation && (
          <div className="space-y-3">
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Location permission granted. Click below to get your current location.
              </AlertDescription>
            </Alert>
            
            <Button 
              onClick={handleRequestLocation}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <MapPin className="h-4 w-4 mr-2" />
              )}
              Get Current Location
            </Button>
          </div>
        )}

        {hasLocation && (
          <div className="space-y-3">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Location obtained successfully! You can now see nearby sessions and players.
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => getCurrentLocation(true)}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh Location
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleUpdateInDatabase}
                disabled={isUpdatingLocation}
                className="flex-1"
              >
                {isUpdatingLocation ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Shield className="h-4 w-4 mr-2" />
                )}
                Share Location
              </Button>
            </div>
          </div>
        )}

        {/* Help Section */}
        {showHelp && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="space-y-2">
              <div className="font-medium">How to enable location:</div>
              <div className="text-xs space-y-1">
                <div>• Look for the location icon in your browser's address bar</div>
                <div>• Click "Allow" when prompted for location access</div>
                <div>• Or go to browser settings and enable location for this site</div>
                <div>• On mobile: Check app permissions in device settings</div>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};