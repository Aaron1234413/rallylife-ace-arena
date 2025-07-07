import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CLUB-CUSTOMER-PORTAL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

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
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const { clubId } = await req.json();
    if (!clubId) throw new Error("Club ID is required");

    // Verify user owns the club and get subscription
    const { data: subscription, error: subError } = await supabaseClient
      .from('club_subscriptions')
      .select(`
        *,
        clubs!inner(owner_id, name)
      `)
      .eq('club_id', clubId)
      .single();

    if (subError || !subscription) {
      throw new Error("Club subscription not found");
    }

    if (subscription.clubs.owner_id !== user.id) {
      throw new Error("User not authorized to manage this club");
    }
    logStep("Club and subscription verified", { clubId, clubName: subscription.clubs.name });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Get customer ID from Stripe subscription or find by email
    let customerId;
    if (subscription.stripe_subscription_id) {
      const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);
      customerId = stripeSubscription.customer as string;
      logStep("Customer ID from subscription", { customerId });
    } else {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length === 0) {
        throw new Error("No Stripe customer found for this user");
      }
      customerId = customers.data[0].id;
      logStep("Customer ID from email search", { customerId });
    }

    // Create customer portal session
    const origin = req.headers.get("origin") || "http://localhost:5173";
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/club/${clubId}`,
    });

    logStep("Customer portal session created", { sessionId: portalSession.id, url: portalSession.url });

    return new Response(JSON.stringify({ 
      success: true, 
      portalUrl: portalSession.url 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});