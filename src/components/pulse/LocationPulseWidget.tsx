import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Globe } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface LocationStats {
  userLocation: string | null;
  nearbyPlayersCount: number;
  nearbyCoachesCount: number;
  popularCourts: string[];
}

export function LocationPulseWidget() {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ['profile-location', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('location')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const { data: locationStats, isLoading } = useQuery({
    queryKey: ['location-stats', profile?.location],
    queryFn: async (): Promise<LocationStats> => {
      const stats: LocationStats = {
        userLocation: profile?.location || null,
        nearbyPlayersCount: 0,
        nearbyCoachesCount: 0,
        popularCourts: []
      };

      if (profile?.location) {
        // Get users in same location area
        const { data: nearbyUsers } = await supabase
          .from('profiles')
          .select('role')
          .ilike('location', `%${profile.location.split(',')[0]}%`)
          .neq('id', user?.id || '');

        if (nearbyUsers) {
          stats.nearbyPlayersCount = nearbyUsers.filter(u => u.role === 'player').length;
          stats.nearbyCoachesCount = nearbyUsers.filter(u => u.role === 'coach').length;
        }

        // Mock popular courts data (would be real in production)
        stats.popularCourts = ['Central Park Tennis', 'City Sports Complex', 'Tennis Academy'];
      }

      return stats;
    },
    enabled: !!profile?.location
  });

  if (!profile?.location) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm border-tennis-green-light shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
            <MapPin className="h-5 w-5" />
            Your Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Globe className="h-12 w-12 mx-auto text-tennis-green-medium mb-3" />
            <p className="text-tennis-green-dark/70 text-sm">
              Add your location to see nearby players and activity!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm border-tennis-green-light shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
            <MapPin className="h-5 w-5" />
            Your Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-tennis-green-light shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
          <MapPin className="h-5 w-5" />
          Your Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-tennis-green-medium" />
          <span className="font-medium text-tennis-green-dark">
            {locationStats?.userLocation}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-tennis-green-bg/30 rounded-lg">
            <div className="font-bold text-tennis-green-dark text-xl">
              {locationStats?.nearbyPlayersCount || 0}
            </div>
            <div className="text-xs text-tennis-green-medium">
              Nearby Players
            </div>
          </div>
          <div className="text-center p-3 bg-tennis-green-bg/30 rounded-lg">
            <div className="font-bold text-tennis-green-dark text-xl">
              {locationStats?.nearbyCoachesCount || 0}
            </div>
            <div className="text-xs text-tennis-green-medium">
              Nearby Coaches
            </div>
          </div>
        </div>

        {locationStats?.popularCourts && locationStats.popularCourts.length > 0 && (
          <div>
            <h4 className="font-medium text-tennis-green-dark mb-2 text-sm">
              Popular Courts Nearby
            </h4>
            <div className="flex flex-wrap gap-1">
              {locationStats.popularCourts.slice(0, 3).map((court) => (
                <Badge 
                  key={court}
                  variant="secondary" 
                  className="text-xs bg-tennis-green-bg/20 text-tennis-green-dark border-tennis-green-bg"
                >
                  {court}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}