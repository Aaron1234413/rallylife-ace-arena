import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-HYBRID-PAYMENT] ${step}${detailsStr}`);
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
    if (!user?.email) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { 
      service_type, 
      service_details, 
      total_amount, 
      tokens_to_use, 
      cash_amount,
      club_id,
      provider_id 
    } = await req.json();

    logStep("Processing hybrid payment", { 
      service_type, 
      total_amount, 
      tokens_to_use, 
      cash_amount, 
      club_id 
    });

    // Validate payment amounts
    if (tokens_to_use + cash_amount !== total_amount) {
      throw new Error("Token amount + cash amount must equal total amount");
    }

    // Process token payment if needed
    if (tokens_to_use > 0 && club_id) {
      const { data: tokenResult, error: tokenError } = await supabaseClient.rpc(
        'process_token_redemption',
        {
          club_id_param: club_id,
          player_id_param: user.id,
          service_type_param: service_type,
          service_details_param: service_details,
          tokens_to_use: tokens_to_use,
          cash_amount_param: cash_amount,
          total_service_value_param: total_amount
        }
      );

      if (tokenError || !tokenResult) {
        throw new Error(`Token redemption failed: ${tokenError?.message || 'Insufficient tokens'}`);
      }
      logStep("Token redemption successful", { tokens_used: tokens_to_use });
    }

    // Process cash payment if needed
    let paymentResult = null;
    if (cash_amount > 0) {
      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
        apiVersion: "2023-10-16",
      });

      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      let customerId = customers.data.length > 0 ? customers.data[0].id : undefined;

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        customer_email: customerId ? undefined : user.email,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { 
                name: `${service_type} - Hybrid Payment`,
                description: `Cash portion: $${cash_amount.toFixed(2)}, Tokens used: ${tokens_to_use}`
              },
              unit_amount: Math.round(cash_amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.headers.get("origin")}/dashboard?payment=success`,
        cancel_url: `${req.headers.get("origin")}/dashboard?payment=cancelled`,
        metadata: {
          service_type,
          total_amount: total_amount.toString(),
          tokens_used: tokens_to_use.toString(),
          user_id: user.id,
          club_id: club_id || '',
          provider_id: provider_id || ''
        }
      });

      paymentResult = { url: session.url, session_id: session.id };
      logStep("Stripe session created", { sessionId: session.id });
    }

    // Award tokens to service provider if applicable
    if (provider_id && total_amount > 0) {
      const providerTokens = Math.floor(total_amount * 0.1); // 10% commission in tokens
      
      await supabaseClient.rpc('add_tokens', {
        user_id: provider_id,
        token_amount: providerTokens,
        token_type: 'regular',
        transaction_type: 'service_payment',
        description: `Service payment for ${service_type}`
      });
      
      logStep("Provider tokens awarded", { providerId: provider_id, tokens: providerTokens });
    }

    logStep("Hybrid payment processed successfully");

    return new Response(JSON.stringify({
      success: true,
      tokens_used: tokens_to_use,
      cash_amount: cash_amount,
      payment_url: paymentResult?.url,
      session_id: paymentResult?.session_id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in process-hybrid-payment", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});