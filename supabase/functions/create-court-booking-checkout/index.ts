import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-COURT-BOOKING-CHECKOUT] ${step}${detailsStr}`);
};

interface BookingRequest {
  court_id: string;
  club_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  base_amount: number;
  convenience_fee: number;
  total_amount: number;
  notes?: string;
  selected_services?: Array<{
    id: string;
    name: string;
    price_usd: number;
  }>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    // Initialize Supabase client with the service role key for auth
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse booking request
    const bookingData: BookingRequest = await req.json();
    logStep("Booking data received", { 
      courtId: bookingData.court_id, 
      totalAmount: bookingData.total_amount,
      servicesCount: bookingData.selected_services?.length || 0
    });

    // Validate required fields
    if (!bookingData.court_id || !bookingData.club_id || !bookingData.booking_date || 
        !bookingData.start_time || !bookingData.end_time || !bookingData.total_amount) {
      throw new Error("Missing required booking fields");
    }

    // Get court details for description
    const { data: court, error: courtError } = await supabaseClient
      .from('club_courts')
      .select('name, club_id')
      .eq('id', bookingData.court_id)
      .single();

    if (courtError) throw new Error(`Court not found: ${courtError.message}`);
    logStep("Court details retrieved", { courtName: court.name });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer exists or create new one
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing Stripe customer found", { customerId });
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id }
      });
      customerId = customer.id;
      logStep("New Stripe customer created", { customerId });
    }

    // Prepare line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    // Court booking line item
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: `Court Booking - ${court.name}`,
          description: `${bookingData.booking_date} from ${bookingData.start_time} to ${bookingData.end_time} (${bookingData.duration_hours}h)`,
          metadata: {
            type: "court_booking",
            court_id: bookingData.court_id,
            booking_date: bookingData.booking_date,
            start_time: bookingData.start_time,
            end_time: bookingData.end_time
          }
        },
        unit_amount: Math.round(bookingData.base_amount * 100), // Convert to cents
      },
      quantity: 1,
    });

    // RAKO convenience fee line item
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "RAKO Convenience Fee (5%)",
          description: "Platform service fee",
          metadata: { type: "convenience_fee" }
        },
        unit_amount: Math.round(bookingData.convenience_fee * 100), // Convert to cents
      },
      quantity: 1,
    });

    // Additional services line items
    if (bookingData.selected_services && bookingData.selected_services.length > 0) {
      for (const service of bookingData.selected_services) {
        if (service.price_usd > 0) {
          lineItems.push({
            price_data: {
              currency: "usd",
              product_data: {
                name: `Service - ${service.name}`,
                metadata: {
                  type: "service",
                  service_id: service.id
                }
              },
              unit_amount: Math.round(service.price_usd * 100), // Convert to cents
            },
            quantity: 1,
          });
        }
      }
    }

    logStep("Line items prepared", { itemsCount: lineItems.length });

    // Get origin for success/cancel URLs
    const origin = req.headers.get("origin") || "http://localhost:3000";

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard`,
      metadata: {
        user_id: user.id,
        court_id: bookingData.court_id,
        club_id: bookingData.club_id,
        booking_date: bookingData.booking_date,
        start_time: bookingData.start_time,
        end_time: bookingData.end_time,
        duration_hours: bookingData.duration_hours.toString(),
        notes: bookingData.notes || "",
        selected_services: JSON.stringify(bookingData.selected_services || [])
      },
      payment_intent_data: {
        metadata: {
          booking_type: "court_booking",
          user_id: user.id,
          court_id: bookingData.court_id,
          club_id: bookingData.club_id
        }
      }
    });

    logStep("Stripe checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ 
      url: session.url,
      session_id: session.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-court-booking-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});