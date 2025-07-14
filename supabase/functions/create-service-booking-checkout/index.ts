import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SERVICE-BOOKING-CHECKOUT] ${step}${detailsStr}`);
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

    const {
      service_id,
      service_name,
      service_price_tokens,
      service_price_usd,
      tokens_used,
      cash_amount,
      total_amount,
      club_id,
      scheduled_date
    } = await req.json();

    logStep("Service booking data received", { 
      service_id, 
      service_name, 
      tokens_used, 
      cash_amount, 
      total_amount 
    });

    // If no cash payment needed (paid entirely with tokens)
    if (cash_amount <= 0) {
      logStep("Token-only booking, no Stripe checkout needed");

      // Create the booking directly in the database
      const { data: booking, error: bookingError } = await supabaseClient
        .from('club_service_bookings')
        .insert({
          service_id,
          player_id: user.id,
          club_id,
          booking_status: 'confirmed',
          payment_type: 'tokens_only',
          tokens_paid: tokens_used,
          usd_paid: 0,
          scheduled_date
        })
        .select()
        .single();

      if (bookingError) throw new Error(`Booking creation failed: ${bookingError.message}`);

      return new Response(JSON.stringify({ 
        success: true, 
        booking_id: booking.id,
        message: "Service booked successfully with tokens!" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Create Stripe checkout for cash portion
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
              name: service_name,
              description: `Club service booking ${tokens_used > 0 ? `(${tokens_used} tokens applied)` : ''}`
            },
            unit_amount: Math.round(total_amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/dashboard?service_booking=success`,
      cancel_url: `${req.headers.get("origin")}/clubs?service_booking=cancelled`,
      metadata: {
        service_id,
        user_id: user.id,
        club_id,
        tokens_used: tokens_used.toString(),
        cash_amount: cash_amount.toString(),
        service_type: 'club_service_booking',
        scheduled_date: scheduled_date || '',
      }
    });

    logStep("Checkout session created", { sessionId: session.id });

    return new Response(JSON.stringify({ payment_url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-service-booking-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});