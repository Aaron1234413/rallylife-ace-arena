import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[MONTHLY-TOKEN-ALLOCATION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Monthly token allocation started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    logStep("Processing for month", { month: currentMonth });

    // Get all active clubs with subscriptions
    const { data: clubs, error: clubsError } = await supabaseClient
      .from('clubs')
      .select(`
        id, 
        name, 
        subscription_tier,
        club_subscriptions(*)
      `)
      .eq('subscription_status', 'active');

    if (clubsError) throw clubsError;
    logStep("Found active clubs", { count: clubs?.length });

    let processedClubs = 0;
    let totalTokensAllocated = 0;

    for (const club of clubs || []) {
      try {
        // Initialize monthly pool for this club
        await supabaseClient.rpc('initialize_monthly_token_pool', {
          club_id_param: club.id,
          month_year_param: currentMonth
        });

        // Get the allocated amount for tracking
        const { data: pool } = await supabaseClient
          .from('club_token_pools')
          .select('allocated_tokens, rollover_tokens')
          .eq('club_id', club.id)
          .eq('month_year', currentMonth)
          .single();

        if (pool) {
          totalTokensAllocated += pool.allocated_tokens + pool.rollover_tokens;
        }

        processedClubs++;
        logStep("Processed club", { 
          clubId: club.id, 
          clubName: club.name,
          allocated: pool?.allocated_tokens,
          rollover: pool?.rollover_tokens
        });

      } catch (error) {
        logStep("Error processing club", { 
          clubId: club.id, 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
    }

    // Process player monthly subscription tokens
    const { data: playerSubscriptions, error: playersError } = await supabaseClient
      .from('player_subscriptions')
      .select('player_id, tier')
      .eq('status', 'active');

    if (playersError) throw playersError;

    let processedPlayers = 0;
    for (const subscription of playerSubscriptions || []) {
      try {
        let monthlyTokens = 0;
        switch (subscription.tier) {
          case 'pro': monthlyTokens = 500; break;
          case 'premium': monthlyTokens = 1500; break;
          default: monthlyTokens = 100; break;
        }

        await supabaseClient.rpc('add_monthly_subscription_tokens', {
          user_id_param: subscription.player_id,
          token_amount: monthlyTokens
        });

        processedPlayers++;
      } catch (error) {
        logStep("Error processing player subscription", { 
          playerId: subscription.player_id, 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
    }

    // Process coach monthly subscription tokens
    const { data: coachSubscriptions, error: coachesError } = await supabaseClient
      .from('coach_subscriptions')
      .select('coach_id, tier')
      .eq('status', 'active');

    if (coachesError) throw coachesError;

    let processedCoaches = 0;
    for (const subscription of coachSubscriptions || []) {
      try {
        let monthlyTokens = 0;
        switch (subscription.tier) {
          case 'pro': monthlyTokens = 1000; break;
          case 'enterprise': monthlyTokens = 3000; break;
          default: monthlyTokens = 300; break;
        }

        await supabaseClient.rpc('add_coach_tokens', {
          coach_id: subscription.coach_id,
          token_amount: monthlyTokens,
          token_type: 'coaching',
          transaction_type: 'monthly_allocation',
          description: 'Monthly subscription tokens'
        });

        processedCoaches++;
      } catch (error) {
        logStep("Error processing coach subscription", { 
          coachId: subscription.coach_id, 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
    }

    // Process overdraft recovery for Pro clubs
    const { data: overdraftClubs, error: overdraftError } = await supabaseClient
      .from('club_token_pools')
      .select('club_id, overdraft_tokens')
      .eq('month_year', currentMonth)
      .gt('overdraft_tokens', 0);

    if (!overdraftError && overdraftClubs) {
      for (const club of overdraftClubs) {
        // Reduce overdraft by 25% of monthly allocation
        const { data: allocation } = await supabaseClient
          .from('club_token_pools')
          .select('allocated_tokens')
          .eq('club_id', club.club_id)
          .eq('month_year', currentMonth)
          .single();

        if (allocation) {
          const recovery = Math.floor(allocation.allocated_tokens * 0.25);
          const newOverdraft = Math.max(0, club.overdraft_tokens - recovery);
          
          await supabaseClient
            .from('club_token_pools')
            .update({ overdraft_tokens: newOverdraft })
            .eq('club_id', club.club_id)
            .eq('month_year', currentMonth);

          logStep("Overdraft recovery processed", { 
            clubId: club.club_id, 
            recovered: recovery, 
            remaining: newOverdraft 
          });
        }
      }
    }

    const result = {
      success: true,
      month: currentMonth,
      processed_clubs: processedClubs,
      processed_players: processedPlayers,
      processed_coaches: processedCoaches,
      total_tokens_allocated: totalTokensAllocated,
      timestamp: new Date().toISOString()
    };

    logStep("Monthly allocation completed", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in monthly-token-allocation", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});