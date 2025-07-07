import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[TOKEN-PACK-PURCHASE] ${step}${detailsStr}`);
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
    if (!user?.email) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { pack_id, target_type, club_id } = await req.json();
    logStep("Request data received", { pack_id, target_type, club_id });

    // Validate target type and club ownership for club purchases
    if (target_type === 'club') {
      if (!club_id) throw new Error("Club ID required for club token pack purchases");
      
      const { data: membership, error: membershipError } = await supabaseClient
        .from('club_memberships')
        .select('role')
        .eq('club_id', club_id)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (membershipError || !membership || !['owner', 'admin'].includes(membership.role)) {
        throw new Error("Only club owners and admins can purchase club token packs");
      }
    }

    // Get token pack details (would come from your store data)
    const tokenPacks = {
      'player-starter': { name: 'Player Starter Pack', tokens: 1000, bonus: 100, price: 7.00, target: 'player' },
      'player-standard': { name: 'Player Standard Pack', tokens: 2500, bonus: 300, price: 15.00, target: 'player' },
      'player-premium': { name: 'Player Premium Pack', tokens: 5000, bonus: 750, price: 25.00, target: 'player' },
      'coach-professional': { name: 'Coach Professional Pack', tokens: 3000, bonus: 500, price: 20.00, target: 'coach' },
      'coach-enterprise': { name: 'Coach Enterprise Pack', tokens: 7500, bonus: 1500, price: 45.00, target: 'coach' },
      'club-community': { name: 'Club Community Pack', tokens: 10000, bonus: 1000, price: 70.00, target: 'club' },
      'club-standard': { name: 'Club Standard Pack', tokens: 25000, bonus: 3000, price: 150.00, target: 'club' },
      'club-premium': { name: 'Club Premium Pack', tokens: 50000, bonus: 7500, price: 280.00, target: 'club' },
      'club-enterprise': { name: 'Club Enterprise Pack', tokens: 100000, bonus: 15000, price: 500.00, target: 'club' }
    };

    const pack = tokenPacks[pack_id as keyof typeof tokenPacks];
    if (!pack) throw new Error("Invalid token pack ID");
    if (pack.target !== target_type) throw new Error("Token pack target type mismatch");

    const totalTokens = pack.tokens + pack.bonus;
    const priceInCents = Math.round(pack.price * 100);

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id }
      });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: pack.name,
              description: `${pack.tokens.toLocaleString()} base tokens + ${pack.bonus.toLocaleString()} bonus tokens (${totalTokens.toLocaleString()} total)`
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/${target_type === 'club' ? `clubs/${club_id}` : 'dashboard'}?tokens=purchased`,
      cancel_url: `${req.headers.get("origin")}/${target_type === 'club' ? `clubs/${club_id}` : 'store'}?tokens=cancelled`,
      metadata: {
        pack_id,
        target_type,
        club_id: club_id || '',
        user_id: user.id,
        base_tokens: pack.tokens.toString(),
        bonus_tokens: pack.bonus.toString(),
        total_tokens: totalTokens.toString()
      }
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in token-pack-purchase", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});