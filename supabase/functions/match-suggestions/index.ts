import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MatchPreferences {
  maxDistance?: number;
  skillLevelRange?: number;
  stakeRange?: { min: number; max: number };
  availability?: string[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { preferences }: { preferences?: MatchPreferences } = await req.json()

    // Get user's profile data
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Build query for potential matches
    let query = supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        avatar_url,
        skill_level,
        location,
        utr_rating,
        usta_rating,
        availability,
        stake_preference
      `)
      .neq('id', user.id)
      .eq('role', 'player')

    // Filter by skill level range (±1 level by default)
    const skillRange = preferences?.skillLevelRange ?? 1
    const userSkillNum = parseInt(userProfile.skill_level?.replace('level_', '') || '3')
    const minSkill = Math.max(1, userSkillNum - skillRange)
    const maxSkill = Math.min(5, userSkillNum + skillRange)
    
    query = query.gte('skill_level', `level_${minSkill}`)
    query = query.lte('skill_level', `level_${maxSkill}`)

    const { data: potentialMatches, error: matchError } = await query

    if (matchError) {
      console.error('Match query error:', matchError)
      return new Response(JSON.stringify({ error: 'Failed to fetch matches' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Calculate match scores and filter
    const scoredMatches = potentialMatches
      .map(match => {
        let score = 0
        
        // Skill level compatibility (higher score for closer levels)
        const matchSkillNum = parseInt(match.skill_level?.replace('level_', '') || '3')
        const skillDiff = Math.abs(userSkillNum - matchSkillNum)
        score += Math.max(0, 50 - (skillDiff * 15)) // 50 for exact match, decreasing
        
        // UTR rating compatibility
        if (userProfile.utr_rating && match.utr_rating) {
          const utrDiff = Math.abs(userProfile.utr_rating - match.utr_rating)
          score += Math.max(0, 30 - (utrDiff * 3)) // 30 for exact match
        }
        
        // Location proximity (simplified - in real app would use proper geo distance)
        if (userProfile.location && match.location) {
          const sameLocation = userProfile.location.toLowerCase() === match.location.toLowerCase()
          score += sameLocation ? 20 : 0
        }
        
        // Availability overlap
        if (userProfile.availability && match.availability) {
          const userAvail = Object.entries(userProfile.availability || {}).flat()
          const matchAvail = Object.entries(match.availability || {}).flat()
          const overlap = userAvail.filter(time => matchAvail.includes(time)).length
          score += overlap * 5
        }
        
        // Stake preference compatibility
        if (userProfile.stake_preference && match.stake_preference) {
          if (userProfile.stake_preference === match.stake_preference ||
              userProfile.stake_preference === 'any' || 
              match.stake_preference === 'any') {
            score += 15
          }
        }

        return {
          ...match,
          match_score: score,
          compatibility_factors: {
            skill_compatibility: Math.max(0, 50 - (skillDiff * 15)),
            location_match: userProfile.location === match.location,
            stake_compatible: true // simplified
          }
        }
      })
      .filter(match => match.match_score > 20) // Minimum score threshold
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 20) // Return top 20 matches

    return new Response(JSON.stringify({ 
      matches: scoredMatches,
      user_profile: {
        skill_level: userProfile.skill_level,
        location: userProfile.location,
        utr_rating: userProfile.utr_rating
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Match suggestions error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})