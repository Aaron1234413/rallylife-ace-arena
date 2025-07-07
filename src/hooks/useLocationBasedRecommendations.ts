import { useState, useEffect, useMemo } from 'react';
import { useLocationBasedSessions } from './useLocationBasedSessions';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface RecommendedSession {
  id: string;
  title: string;
  distance_km: number;
  session_type: string;
  max_players: number;
  participant_count: number;
  creator_name: string;
  location: string;
  stakes_amount: number;
  created_at: string;
  recommendation_score: number;
  recommendation_reason: string;
  user_joined?: boolean;
}

interface UserPreferences {
  preferred_session_types: string[];
  preferred_stakes_range: [number, number];
  activity_level: 'low' | 'medium' | 'high';
  recent_activities: string[];
}

export function useLocationBasedRecommendations(radiusKm: number = 50) {
  const { user } = useAuth();
  const { nearbySessions, loading: sessionLoading } = useLocationBasedSessions(radiusKm);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user preferences and activity history
  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (!user) return;

      try {
        // Get user's recent activity to infer preferences
        const { data: recentActivity } = await supabase
          .from('activity_logs')
          .select('activity_type, activity_category')
          .eq('player_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        // Get user's session participation history
        const { data: sessionHistory } = await supabase
          .from('session_participants')
          .select(`
            sessions!inner(session_type, stakes_amount)
          `)
          .eq('user_id', user.id)
          .eq('status', 'joined')
          .limit(10);

        // Analyze preferences
        const sessionTypes = sessionHistory?.map(s => s.sessions.session_type) || [];
        const stakes = sessionHistory?.map(s => s.sessions.stakes_amount) || [];
        const activities = recentActivity?.map(a => a.activity_type) || [];

        const preferences: UserPreferences = {
          preferred_session_types: [...new Set(sessionTypes)],
          preferred_stakes_range: stakes.length > 0 
            ? [Math.min(...stakes), Math.max(...stakes)]
            : [0, 100],
          activity_level: activities.length > 10 ? 'high' : activities.length > 5 ? 'medium' : 'low',
          recent_activities: [...new Set(activities)]
        };

        setUserPreferences(preferences);
      } catch (error) {
        console.error('Error fetching user preferences:', error);
        // Set default preferences
        setUserPreferences({
          preferred_session_types: [],
          preferred_stakes_range: [0, 100],
          activity_level: 'medium',
          recent_activities: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserPreferences();
  }, [user]);

  // Calculate recommendations
  const recommendations = useMemo(() => {
    if (!userPreferences || !nearbySessions.length) return [];

    const scoredSessions = nearbySessions
      .filter(session => {
        // For nearby sessions, we don't have participant details, so we'll use the main sessions list
        // to check if user has joined by looking up in the availableSessions array
        return true; // We'll filter joined sessions later in the component
      })
      .map(session => {
        let score = 0;
        let reasons: string[] = [];

        // Distance score (closer = better, max 30 points)
        const distanceScore = Math.max(0, 30 - (session.distance_km * 2));
        score += distanceScore;
        if (session.distance_km <= 5) {
          reasons.push('Very close to your location');
        } else if (session.distance_km <= 15) {
          reasons.push('Nearby location');
        }

        // Session type preference (20 points)
        if (userPreferences.preferred_session_types.includes(session.session_type)) {
          score += 20;
          reasons.push('Matches your preferred activity type');
        }

        // Stakes preference (15 points)
        const [minStakes, maxStakes] = userPreferences.preferred_stakes_range;
        if (session.stakes_amount >= minStakes && session.stakes_amount <= maxStakes) {
          score += 15;
          reasons.push('Stakes match your comfort level');
        }

        // Availability score (15 points)
        const availableSpots = session.max_players - session.participant_count;
        if (availableSpots === 1) {
          score += 15;
          reasons.push('Perfect timing - just one spot left');
        } else if (availableSpots <= 3) {
          score += 10;
          reasons.push('Filling up fast');
        } else {
          score += 5;
        }

        // Recency bonus (10 points)
        const createdAt = new Date(session.created_at);
        const hoursOld = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
        if (hoursOld <= 1) {
          score += 10;
          reasons.push('Just created');
        } else if (hoursOld <= 6) {
          score += 5;
          reasons.push('Recently created');
        }

        // Activity level match (10 points)
        if (userPreferences.activity_level === 'high' && session.stakes_amount > 50) {
          score += 10;
          reasons.push('High-stakes match for active players');
        } else if (userPreferences.activity_level === 'low' && session.stakes_amount === 0) {
          score += 10;
          reasons.push('Casual, no-pressure session');
        }

        const finalScore = Math.min(100, score) / 100; // Normalize to 0-1
        const primaryReason = reasons[0] || 'Good match for you';

        return {
          ...session,
          title: `${session.session_type.charAt(0).toUpperCase() + session.session_type.slice(1)} Session`,
          creator_name: session.creator_name || 'Unknown',
          recommendation_score: finalScore,
          recommendation_reason: primaryReason,
          user_joined: false
        };
      })
      .filter(session => session.recommendation_score > 0.3) // Only show reasonably good matches
      .sort((a, b) => b.recommendation_score - a.recommendation_score)
      .slice(0, 5); // Top 5 recommendations

    return scoredSessions;
  }, [nearbySessions, userPreferences]);

  return {
    recommendations,
    loading: loading || sessionLoading,
    userPreferences
  };
}