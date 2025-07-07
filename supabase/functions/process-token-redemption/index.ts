import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-TOKEN-REDEMPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const {
      club_id,
      service_type,
      service_details,
      tokens_to_use,
      total_service_value
    } = await req.json();

    logStep("Request data received", {
      club_id,
      service_type,
      tokens_to_use,
      total_service_value
    });

    // Validate inputs
    if (!club_id || !service_type || !tokens_to_use || !total_service_value) {
      throw new Error("Missing required fields");
    }

    if (tokens_to_use <= 0 || total_service_value <= 0) {
      throw new Error("Invalid token or service value amounts");
    }

    // Check if user is a member of the club
    const { data: membership, error: membershipError } = await supabaseClient
      .from('club_memberships')
      .select('*')
      .eq('club_id', club_id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (membershipError || !membership) {
      throw new Error("User is not an active member of this club");
    }

    logStep("Membership verified", { membershipId: membership.id });

    // Calculate cash amount
    const tokenValue = tokens_to_use * 0.007; // $0.007 per token
    const cashAmount = total_service_value - tokenValue;

    if (cashAmount < 0) {
      throw new Error("Token value cannot exceed total service value");
    }

    // Process the redemption using the database function
    const { data: redemptionResult, error: redemptionError } = await supabaseClient.rpc(
      'process_token_redemption',
      {
        club_id_param: club_id,
        player_id_param: user.id,
        service_type_param: service_type,
        service_details_param: service_details,
        tokens_to_use: tokens_to_use,
        cash_amount_param: cashAmount,
        total_service_value_param: total_service_value
      }
    );

    if (redemptionError) {
      logStep("Redemption failed", { error: redemptionError });
      throw new Error(`Redemption failed: ${redemptionError.message}`);
    }

    if (!redemptionResult) {
      throw new Error("Insufficient tokens available for redemption");
    }

    logStep("Redemption processed successfully", {
      tokensUsed: tokens_to_use,
      cashAmount,
      tokenValue,
      redemptionPercentage: (tokenValue / total_service_value) * 100
    });

    return new Response(JSON.stringify({
      success: true,
      redemption: {
        tokens_used: tokens_to_use,
        token_value: tokenValue,
        cash_amount: cashAmount,
        total_service_value: total_service_value,
        redemption_percentage: (tokenValue / total_service_value) * 100,
        savings: tokenValue
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in process-token-redemption", { message: errorMessage });
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});