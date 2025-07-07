import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserLocation } from '@/hooks/useUserLocation';

interface LocationBasedSession {
  id: string;
  creator_id: string;
  session_type: string;
  location: string;
  distance_km: number;
  status: string;
  participant_count: number;
  max_players: number;
  stakes_amount: number;
  created_at: string;
  creator_name?: string;
}

interface LocationBasedPlayer {
  id: string;
  full_name: string;
  role: string;
  avatar_url?: string;
  distance_km: number;
  city?: string;
  last_updated: string;
}

export function useLocationBasedSessions(radiusKm: number = 50) {
  const { currentLocation } = useUserLocation();
  const [nearbySessions, setNearbySessions] = useState<LocationBasedSession[]>([]);
  const [nearbyPlayers, setNearbyPlayers] = useState<LocationBasedPlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNearbyData = async () => {
      if (!currentLocation) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch nearby sessions
        const { data: sessionsData, error: sessionsError } = await supabase.rpc('get_nearby_sessions', {
          user_lat: currentLocation.lat,
          user_lng: currentLocation.lng,
          radius_km: radiusKm
        });

        if (sessionsError) throw sessionsError;

        // Get full session details for nearby sessions
        if (sessionsData && sessionsData.length > 0) {
          const sessionIds = sessionsData.map((s: any) => s.session_id);
          
          const { data: fullSessions, error: fullSessionsError } = await supabase
            .from('sessions')
            .select(`
              *,
              participants:session_participants(
                id,
                user_id,
                status,
                user:profiles(full_name)
              ),
              creator:profiles(full_name)
            `)
            .in('id', sessionIds)
            .eq('status', 'waiting');

          if (fullSessionsError) throw fullSessionsError;

          const processedSessions = fullSessions?.map((session: any) => {
            const sessionDistance = sessionsData.find((s: any) => s.session_id === session.id);
            const activeParticipants = session.participants?.filter((p: any) => p.status === 'joined') || [];
            
            return {
              ...session,
              distance_km: sessionDistance?.distance_km || 0,
              participant_count: activeParticipants.length,
              creator_name: session.creator?.full_name || 'Unknown'
            };
          }) || [];

          setNearbySessions(processedSessions);
        } else {
          setNearbySessions([]);
        }

        // Fetch nearby players
        const { data: playersData, error: playersError } = await supabase.rpc('get_nearby_players', {
          user_lat: currentLocation.lat,
          user_lng: currentLocation.lng,
          radius_km: radiusKm
        });

        if (playersError) throw playersError;

        // Get full player details
        if (playersData && playersData.length > 0) {
          const playerIds = playersData.map((p: any) => p.player_id);
          
          const { data: fullPlayers, error: fullPlayersError } = await supabase
            .from('profiles')
            .select('id, full_name, role, avatar_url, location, location_updated_at')
            .in('id', playerIds);

          if (fullPlayersError) throw fullPlayersError;

          const processedPlayers = fullPlayers?.map((player: any) => {
            const playerDistance = playersData.find((p: any) => p.player_id === player.id);
            
            return {
              ...player,
              distance_km: playerDistance?.distance_km || 0,
              city: player.location || 'Unknown',
              last_updated: player.location_updated_at || player.updated_at
            };
          }) || [];

          setNearbyPlayers(processedPlayers);
        } else {
          setNearbyPlayers([]);
        }

      } catch (err: any) {
        console.error('Error fetching nearby data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNearbyData();
  }, [currentLocation, radiusKm]);

  return {
    nearbySessions,
    nearbyPlayers,
    loading,
    error,
    hasLocation: !!currentLocation,
    currentLocation
  };
}