import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[UPGRADE-CLUB-SUBSCRIPTION] ${step}${detailsStr}`);
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

    const { clubId, newTierId } = await req.json();
    if (!clubId || !newTierId) throw new Error("Club ID and new tier ID are required");

    // Verify user owns the club and get current subscription
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
    logStep("Current subscription verified", { clubId, currentTier: subscription.tier_id });

    // Get new tier details
    const { data: newTier, error: tierError } = await supabaseClient
      .from('subscription_tiers')
      .select('*')
      .eq('id', newTierId)
      .single();

    if (tierError || !newTier) {
      throw new Error("New subscription tier not found");
    }
    logStep("New tier retrieved", { tierId: newTierId, tierName: newTier.name });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    if (!subscription.stripe_subscription_id) {
      throw new Error("No Stripe subscription found for this club");
    }

    // Get the current Stripe subscription
    const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);
    logStep("Current Stripe subscription retrieved", { subscriptionId: stripeSubscription.id });

    // Create/get the new price
    const productName = `RallyLife Club - ${newTier.name}`;
    let priceId;

    const products = await stripe.products.list({ limit: 100 });
    let product = products.data.find(p => p.name === productName);

    if (!product) {
      product = await stripe.products.create({
        name: productName,
        description: `${newTier.name} tier subscription for tennis clubs`,
        metadata: { tierId: newTierId }
      });
    }

    const prices = await stripe.prices.list({ product: product.id });
    let price = prices.data.find(p => 
      p.unit_amount === Math.round(newTier.price_monthly * 100) && 
      p.recurring?.interval === 'month'
    );

    if (!price) {
      price = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(newTier.price_monthly * 100),
        currency: 'usd',
        recurring: { interval: 'month' },
        metadata: { tierId: newTierId }
      });
    }
    priceId = price.id;

    // Update the subscription
    const updatedSubscription = await stripe.subscriptions.update(stripeSubscription.id, {
      items: [{
        id: stripeSubscription.items.data[0].id,
        price: priceId,
      }],
      proration_behavior: 'always_invoice',
      metadata: {
        clubId,
        tierId: newTierId,
        userId: user.id
      }
    });

    logStep("Stripe subscription updated", { subscriptionId: updatedSubscription.id });

    // Update local subscription record
    const { error: updateError } = await supabaseClient
      .from('club_subscriptions')
      .update({
        tier_id: newTierId,
        current_period_start: new Date(updatedSubscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(updatedSubscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', subscription.id);

    if (updateError) {
      logStep("Error updating local subscription", { error: updateError });
      throw new Error("Failed to update local subscription record");
    }

    logStep("Local subscription updated successfully");

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Subscription upgraded successfully",
      newTier: newTier.name
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