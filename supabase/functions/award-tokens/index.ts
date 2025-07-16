import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { 
      userId, 
      amount, 
      type, 
      matchId = null, 
      description = null 
    } = await req.json()

    console.log(`Awarding ${amount} tokens to user ${userId} for ${type}`)

    // Call the award_tokens database function
    const { data, error } = await supabaseClient.rpc('award_tokens', {
      target_user_id: userId,
      token_amount: amount,
      transaction_type: type,
      match_id: matchId,
      description_text: description
    })

    if (error) {
      console.error('Error awarding tokens:', error)
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Tokens awarded successfully:', data)

    // Additional logic for specific token types
    switch (type) {
      case 'match_completed':
        // Award bonus tokens for win streaks
        await handleMatchCompletionBonus(supabaseClient, userId)
        break
      case 'weekly_streak':
        // Award weekly streak bonuses
        await handleWeeklyStreakBonus(supabaseClient, userId, amount)
        break
    }

    return new Response(
      JSON.stringify({ success: true, result: data }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function handleMatchCompletionBonus(supabaseClient: any, userId: string) {
  try {
    // Check for recent match wins to calculate streak bonus
    const { data: recentMatches } = await supabaseClient
      .from('challenges')
      .select('winner_id, completed_at')
      .eq('winner_id', userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(5)

    if (recentMatches && recentMatches.length >= 3) {
      // Award streak bonus for 3+ recent wins
      const streakBonus = recentMatches.length * 5
      await supabaseClient.rpc('award_tokens', {
        target_user_id: userId,
        token_amount: streakBonus,
        transaction_type: 'match_completed',
        description_text: `Win streak bonus: ${recentMatches.length} wins`
      })
      console.log(`Awarded ${streakBonus} streak bonus tokens`)
    }
  } catch (error) {
    console.error('Error handling match completion bonus:', error)
  }
}

async function handleWeeklyStreakBonus(supabaseClient: any, userId: string, baseAmount: number) {
  try {
    // Get user's current daily streak
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('daily_streak')
      .eq('id', userId)
      .single()

    if (profile?.daily_streak >= 7) {
      // Award bonus for maintaining weekly streak
      const weeklyBonus = Math.floor(profile.daily_streak / 7) * 25
      await supabaseClient.rpc('award_tokens', {
        target_user_id: userId,
        token_amount: weeklyBonus,
        transaction_type: 'weekly_streak',
        description_text: `Weekly streak milestone: ${profile.daily_streak} days`
      })
      console.log(`Awarded ${weeklyBonus} weekly milestone bonus`)
    }
  } catch (error) {
    console.error('Error handling weekly streak bonus:', error)
  }
}