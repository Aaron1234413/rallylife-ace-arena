import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface MatchPreferences {
  maxDistance?: number;
  skillLevelRange?: number;
  stakeRange?: { min: number; max: number };
  availability?: string[];
}

interface PlayerMatch {
  id: string;
  full_name: string;
  avatar_url?: string;
  skill_level: string;
  location?: string;
  utr_rating?: number;
  usta_rating?: number;
  availability?: any;
  stake_preference?: string;
  match_score: number;
  compatibility_factors: {
    skill_compatibility: number;
    location_match: boolean;
    stake_compatible: boolean;
  };
}

export function usePlayerDiscovery() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<PlayerMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const findMatches = async (preferences?: MatchPreferences) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('match-suggestions', {
        body: { preferences }
      });

      if (functionError) {
        throw functionError;
      }

      setSuggestions(data.matches || []);
    } catch (err) {
      console.error('Error finding matches:', err);
      setError(err instanceof Error ? err.message : 'Failed to find matches');
    } finally {
      setLoading(false);
    }
  };

  // Auto-load suggestions when component mounts
  useEffect(() => {
    if (user) {
      findMatches();
    }
  }, [user]);

  const refreshSuggestions = () => {
    findMatches();
  };

  return {
    suggestions,
    loading,
    error,
    findMatches,
    refreshSuggestions
  };
}