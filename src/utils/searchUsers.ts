
import { supabase } from '@/integrations/supabase/client';

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

export async function fetchSearchResults({ query, userType, filters }: SearchParams): Promise<SearchResult[]> {
  console.log('Searching users with:', { query, userType, filters });
  
  // Get base profiles with explicit typing to avoid deep instantiation
  const profilesQuery = supabase
    .from('profiles')
    .select('id, full_name, avatar_url, role')
    .eq('role', userType)
    .ilike('full_name', `%${query}%`)
    .limit(20);

  const { data: profiles, error } = await profilesQuery;

  if (error) {
    console.error('Search error:', error);
    throw error;
  }

  if (!profiles || profiles.length === 0) {
    return [];
  }

  // Get additional data for each profile
  const profileIds = profiles.map(p => p.id);
  
  // Get player profiles if searching for players
  let playerProfiles: any[] = [];
  if (userType === 'player') {
    const playerQuery = supabase
      .from('player_profiles')
      .select('player_id, skill_level, location')
      .in('player_id', profileIds);
    
    const { data: playerData } = await playerQuery;
    playerProfiles = playerData || [];
  }

  // Get coach profiles if searching for coaches
  let coachProfiles: any[] = [];
  if (userType === 'coach') {
    const coachQuery = supabase
      .from('coach_profiles')
      .select('coach_id, coaching_focus, experience_years, location')
      .in('coach_id', profileIds);
    
    const { data: coachData } = await coachQuery;
    coachProfiles = coachData || [];
  }

  // Get player XP data
  let playerXPData: any[] = [];
  if (userType === 'player') {
    const xpQuery = supabase
      .from('player_xp')
      .select('player_id, current_level')
      .in('player_id', profileIds);
    
    const { data: xpData } = await xpQuery;
    playerXPData = xpData || [];
  }

  console.log('Raw search results:', { profiles, playerProfiles, coachProfiles, playerXPData });

  // Transform and filter the results
  const transformedResults: SearchResult[] = profiles.map((user) => {
    const playerProfile = playerProfiles.find(pp => pp.player_id === user.id);
    const coachProfile = coachProfiles.find(cp => cp.coach_id === user.id);
    const playerXP = playerXPData.find(xp => xp.player_id === user.id);
    
    // Calculate a simple match percentage (placeholder logic)
    const matchPercentage = Math.floor(Math.random() * 40) + 60; // 60-100%

    return {
      id: user.id,
      full_name: user.full_name || 'Unknown User',
      avatar_url: user.avatar_url || undefined,
      role: user.role,
      skill_level: playerProfile?.skill_level || undefined,
      location: playerProfile?.location || coachProfile?.location || undefined,
      coaching_focus: coachProfile?.coaching_focus || undefined,
      experience_years: coachProfile?.experience_years || undefined,
      match_percentage: matchPercentage,
      current_level: playerXP?.current_level || 1
    };
  });

  // Apply additional filters
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
