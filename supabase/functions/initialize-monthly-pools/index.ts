import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[INITIALIZE-MONTHLY-POOLS] ${step}${detailsStr}`);
};

serve(async (req) => {
  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const currentMonthYear = new Date().toISOString().slice(0, 7); // YYYY-MM format
    logStep("Processing month", { currentMonthYear });

    // Get all active clubs
    const { data: clubs, error: clubsError } = await supabaseClient
      .from('clubs')
      .select('id, subscription_tier');

    if (clubsError) {
      logStep("Error fetching clubs", { error: clubsError });
      throw clubsError;
    }

    logStep("Found clubs", { count: clubs?.length || 0 });

    let processed = 0;
    let errors = 0;

    // Initialize token pools for each club
    for (const club of clubs || []) {
      try {
        const { error } = await supabaseClient.rpc('initialize_monthly_token_pool', {
          club_id_param: club.id,
          month_year_param: currentMonthYear
        });

        if (error) {
          logStep("Error initializing pool for club", { clubId: club.id, error });
          errors++;
        } else {
          logStep("Pool initialized for club", { clubId: club.id });
          processed++;
        }
      } catch (error) {
        logStep("Exception initializing pool for club", { clubId: club.id, error });
        errors++;
      }
    }

    // Also allocate tokens to player and coach subscriptions
    logStep("Starting player token allocation");
    
    const { data: playerSubs, error: playerSubsError } = await supabaseClient
      .from('player_subscriptions')
      .select('player_id, monthly_token_allocation')
      .eq('status', 'active');

    if (!playerSubsError && playerSubs) {
      for (const sub of playerSubs) {
        try {
          // Add tokens to player's regular token balance
          await supabaseClient.rpc('add_tokens', {
            user_id: sub.player_id,
            token_amount: sub.monthly_token_allocation,
            token_type: 'regular',
            activity_type: 'monthly_allocation',
            description: 'Monthly subscription token allocation'
          });
          logStep("Tokens allocated to player", { playerId: sub.player_id, tokens: sub.monthly_token_allocation });
        } catch (error) {
          logStep("Error allocating tokens to player", { playerId: sub.player_id, error });
        }
      }
    }

    logStep("Starting coach token allocation");
    
    const { data: coachSubs, error: coachSubsError } = await supabaseClient
      .from('coach_subscriptions')
      .select('coach_id, monthly_token_allocation')
      .eq('status', 'active');

    if (!coachSubsError && coachSubs) {
      for (const sub of coachSubs) {
        try {
          // Add tokens to coach's CTK balance
          await supabaseClient.rpc('add_ctk', {
            coach_id: sub.coach_id,
            ctk_amount: sub.monthly_token_allocation,
            activity_type: 'monthly_allocation',
            description: 'Monthly subscription token allocation'
          });
          logStep("Tokens allocated to coach", { coachId: sub.coach_id, tokens: sub.monthly_token_allocation });
        } catch (error) {
          logStep("Error allocating tokens to coach", { coachId: sub.coach_id, error });
        }
      }
    }

    const result = {
      success: true,
      month_year: currentMonthYear,
      clubs_processed: processed,
      errors: errors,
      total_clubs: clubs?.length || 0,
      timestamp: new Date().toISOString()
    };

    logStep("Monthly pool initialization completed", result);

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in initialize-monthly-pools", { message: errorMessage });
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage,
      timestamp: new Date().toISOString()
    }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});