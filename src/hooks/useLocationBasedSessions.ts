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
  creator_avatar?: string;
  creator_location?: string;
  precise_distance: number;
  travel_time_estimate: number;
  location_accuracy: 'high' | 'low';
}

interface LocationBasedPlayer {
  id: string;
  user_id: string;
  full_name: string;
  role: string;
  avatar_url?: string;
  distance_km: number;
  city?: string;
  last_updated: string;
  current_level: number;
  total_xp: number;
  recent_activity_count: number;
  last_activity?: string;
  activity_types: string[];
  travel_time_estimate: number;
  compatibility_score: number;
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
        // Fetch nearby sessions with enhanced data
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
                user:profiles(full_name, avatar_url)
              ),
              creator:profiles(full_name, avatar_url, location)
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
              creator_name: session.creator?.full_name || 'Unknown',
              creator_avatar: session.creator?.avatar_url,
              creator_location: session.creator?.location,
              // Enhanced location data
              precise_distance: sessionDistance?.distance_km || 0,
              travel_time_estimate: Math.round((sessionDistance?.distance_km || 0) * 2.5), // Estimate 2.5 min per km
              location_accuracy: session.latitude && session.longitude ? 'high' : 'low'
            };
          }) || [];

          setNearbySessions(processedSessions);
        } else {
          setNearbySessions([]);
        }

        // Fetch nearby players with enhanced profiles
        const { data: playersData, error: playersError } = await supabase.rpc('get_nearby_players', {
          user_lat: currentLocation.lat,
          user_lng: currentLocation.lng,
          radius_km: radiusKm
        });

        if (playersError) throw playersError;

        // Get full player details with recent activity and level info
        if (playersData && playersData.length > 0) {
          const playerIds = playersData.map((p: any) => p.player_id);
          
          const { data: fullPlayers, error: fullPlayersError } = await supabase
            .from('profiles')
            .select('id, full_name, role, avatar_url, location, location_updated_at')
            .in('id', playerIds);

          if (fullPlayersError) throw fullPlayersError;

          // Get player XP levels for better matching
          const { data: playerXP } = await supabase
            .from('player_xp')
            .select('player_id, current_level, total_xp_earned')
            .in('player_id', playerIds);

          // Get recent activity for compatibility scoring
          const { data: recentActivity } = await supabase
            .from('activity_logs')
            .select('player_id, activity_type, created_at')
            .in('player_id', playerIds)
            .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
            .order('created_at', { ascending: false });

          const processedPlayers = fullPlayers?.map((player: any) => {
            const playerDistance = playersData.find((p: any) => p.player_id === player.id);
            const xpData = playerXP?.find((xp: any) => xp.player_id === player.id);
            const playerActivities = recentActivity?.filter((a: any) => a.player_id === player.id) || [];
            
            return {
              ...player,
              user_id: player.id,
              distance_km: playerDistance?.distance_km || 0,
              city: player.location || 'Unknown',
              last_updated: player.location_updated_at || player.updated_at,
              current_level: xpData?.current_level || 1,
              total_xp: xpData?.total_xp_earned || 0,
              recent_activity_count: playerActivities.length,
              last_activity: playerActivities[0]?.created_at,
              activity_types: [...new Set(playerActivities.map(a => a.activity_type))],
              travel_time_estimate: Math.round((playerDistance?.distance_km || 0) * 2.5),
              compatibility_score: Math.random() * 0.3 + 0.7 // Enhanced scoring logic would go here
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