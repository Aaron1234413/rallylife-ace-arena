
import { supabase } from '@/integrations/supabase/client';

interface SearchFilters {
  level: string;
  location: string;
  skillLevel: string;
  coachingFocus: string;
}

interface SearchParams {
  query: string;
  userType: 'player' | 'coach';
  filters: SearchFilters;
}

export interface SearchResult {
  id: string;
  full_name: string;
  avatar_url?: string;
  role: string;
  level?: number;
  skill_level?: string;
  coaching_focus?: string;
  experience_years?: number;
  location?: string;
  match_percentage?: number;
  current_level?: number;
}

export async function fetchSearchResults({ query, userType, filters }: SearchParams): Promise<SearchResult[]> {
  console.log('Searching users with:', { query, userType, filters });
  
  // Simple base query without complex joins
  let baseQuery = supabase
    .from('profiles')
    .select('id, full_name, avatar_url, role')
    .eq('role', userType);

  // Add search query filter
  if (query.trim()) {
    baseQuery = baseQuery.ilike('full_name', `%${query}%`);
  }

  const { data: profiles, error } = await baseQuery;

  if (error) {
    console.error('Search error:', error);
    throw error;
  }

  console.log('Raw search results:', profiles);

  if (!profiles || profiles.length === 0) {
    return [];
  }

  // Get additional profile data separately to avoid complex joins
  const profileIds = profiles.map(p => p.id);
  
  let additionalData: any[] = [];
  
  if (userType === 'player') {
    const { data: playerData } = await supabase
      .from('player_profiles')
      .select('id, skill_level, location')
      .in('id', profileIds);
    
    const { data: xpData } = await supabase
      .from('player_xp')
      .select('id, current_level')
      .in('id', profileIds);
      
    additionalData = (playerData || []).map((player: any) => ({
      ...player,
      current_level: (xpData || []).find((xp: any) => xp.id === player.id)?.current_level || 1
    }));
  } else {
    const { data: coachData } = await supabase
      .from('coach_profiles')
      .select('id, coaching_focus, experience_years, location')
      .in('id', profileIds);
    
    additionalData = coachData || [];
  }

  // Transform results
  const transformedResults = profiles.map(profile => {
    const additional = additionalData.find(data => data.id === profile.id);
    const matchPercentage = Math.floor(Math.random() * 40) + 60;

    return {
      id: profile.id,
      full_name: profile.full_name || 'Unknown User',
      avatar_url: profile.avatar_url,
      role: profile.role,
      skill_level: additional?.skill_level,
      location: additional?.location,
      coaching_focus: additional?.coaching_focus,
      experience_years: additional?.experience_years,
      match_percentage: matchPercentage,
      current_level: additional?.current_level || 1
    };
  });

  // Apply filters
  let filteredResults = transformedResults;

  if (filters.skillLevel !== 'all' && userType === 'player') {
    filteredResults = filteredResults.filter(user => 
      user.skill_level === filters.skillLevel
    );
  }

  if (filters.coachingFocus !== 'all' && userType === 'coach') {
    filteredResults = filteredResults.filter(user => 
      user.coaching_focus === filters.coachingFocus
    );
  }

  if (filters.location.trim()) {
    filteredResults = filteredResults.filter(user => 
      user.location?.toLowerCase().includes(filters.location.toLowerCase())
    );
  }

  console.log('Filtered search results:', filteredResults);
  return filteredResults;
}
