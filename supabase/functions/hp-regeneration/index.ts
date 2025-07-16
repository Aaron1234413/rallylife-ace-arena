import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all users who need HP regeneration (updated more than 1 hour ago)
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, hp, max_hp, last_hp_update')
      .lt('last_hp_update', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // 1 hour ago
      .lt('hp', 100) // Only users who aren't at max HP

    if (profilesError) {
      throw profilesError
    }

    let updatedCount = 0

    // Process each profile
    for (const profile of profiles || []) {
      try {
        // Calculate HP regeneration for this user
        const { error: regenError } = await supabase.rpc('calculate_hp_regen', {
          user_id: profile.id
        })

        if (!regenError) {
          updatedCount++
        }
      } catch (error) {
        console.error(`Error regenerating HP for user ${profile.id}:`, error)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `HP regeneration complete. Updated ${updatedCount} users.`,
        updatedCount
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in HP regeneration:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})