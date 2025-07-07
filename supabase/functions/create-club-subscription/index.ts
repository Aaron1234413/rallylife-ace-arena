import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CLUB-SUBSCRIPTION] ${step}${detailsStr}`);
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
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { clubId, tierId } = await req.json();
    if (!clubId || !tierId) throw new Error("Club ID and tier ID are required");

    // Verify user owns the club
    const { data: club, error: clubError } = await supabaseClient
      .from('clubs')
      .select('*')
      .eq('id', clubId)
      .eq('owner_id', user.id)
      .single();

    if (clubError || !club) {
      throw new Error("Club not found or user not authorized");
    }
    logStep("Club verified", { clubId, clubName: club.name });

    // Get tier details
    const { data: tier, error: tierError } = await supabaseClient
      .from('subscription_tiers')
      .select('*')
      .eq('id', tierId)
      .single();

    if (tierError || !tier) {
      throw new Error("Subscription tier not found");
    }
    logStep("Tier retrieved", { tierId, tierName: tier.name, price: tier.price_monthly });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check/create Stripe customer
    let customerId;
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.user_metadata?.full_name || user.email,
        metadata: { userId: user.id, clubId }
      });
      customerId = customer.id;
      logStep("New customer created", { customerId });
    }

    // Create Stripe product and price if needed
    const productName = `RallyLife Club - ${tier.name}`;
    let priceId;

    const products = await stripe.products.list({ limit: 100 });
    let product = products.data.find(p => p.name === productName);

    if (!product) {
      product = await stripe.products.create({
        name: productName,
        description: `${tier.name} tier subscription for tennis clubs`,
        metadata: { tierId }
      });
      logStep("Product created", { productId: product.id });
    }

    const prices = await stripe.prices.list({ product: product.id });
    let price = prices.data.find(p => 
      p.unit_amount === Math.round(tier.price_monthly * 100) && 
      p.recurring?.interval === 'month'
    );

    if (!price) {
      price = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(tier.price_monthly * 100),
        currency: 'usd',
        recurring: { interval: 'month' },
        metadata: { tierId }
      });
      logStep("Price created", { priceId: price.id, amount: price.unit_amount });
    }
    priceId = price.id;

    // Create checkout session
    const origin = req.headers.get("origin") || "http://localhost:5173";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      success_url: `${origin}/club/${clubId}?subscription=success`,
      cancel_url: `${origin}/club/${clubId}?subscription=cancelled`,
      metadata: {
        clubId,
        tierId,
        userId: user.id
      }
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ 
      success: true, 
      checkoutUrl: session.url,
      sessionId: session.id 
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