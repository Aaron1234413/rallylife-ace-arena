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
  console.log(`[VERIFY-BOOKING-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    // Initialize Supabase client with service role key for database writes
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { session_id } = await req.json();
    if (!session_id) throw new Error("Missing session_id");

    logStep("Verifying session", { sessionId: session_id });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id);
    logStep("Session retrieved", { 
      status: session.payment_status,
      amount: session.amount_total
    });

    if (session.payment_status !== 'paid') {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Payment not completed',
        status: session.payment_status 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Extract booking data from session metadata
    const metadata = session.metadata;
    if (!metadata) {
      throw new Error("No metadata found in session");
    }

    logStep("Creating booking from metadata", metadata);

    // Convert time strings to proper format for database
    const bookingData = {
      user_id: metadata.user_id,
      club_id: metadata.club_id,
      court_id: metadata.court_id,
      booking_date: metadata.booking_date,
      start_time: metadata.start_time,
      end_time: metadata.end_time,
      status: 'confirmed',
      payment_status: 'paid',
      payment_method: 'stripe',
      stripe_session_id: session_id,
      base_amount: (session.amount_total! - Math.round(session.amount_total! * 0.05)) / 100, // Remove convenience fee
      convenience_fee: Math.round(session.amount_total! * 0.05) / 100, // 5% fee
      total_amount: session.amount_total! / 100, // Convert from cents
      tokens_used: 0, // This was a monetary payment
      notes: metadata.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Create the booking record
    const { data: booking, error: bookingError } = await supabaseClient
      .from('club_court_bookings')
      .insert(bookingData)
      .select()
      .single();

    if (bookingError) {
      logStep("Error creating booking", bookingError);
      throw new Error(`Failed to create booking: ${bookingError.message}`);
    }

    logStep("Booking created successfully", { bookingId: booking.id });

    // Get court details for response
    const { data: court, error: courtError } = await supabaseClient
      .from('club_courts')
      .select('name, surface_type')
      .eq('id', metadata.court_id)
      .single();

    if (courtError) {
      logStep("Warning: Could not fetch court details", courtError);
    }

    // Handle additional services if any
    const selectedServices = metadata.selected_services ? 
      JSON.parse(metadata.selected_services) : [];

    if (selectedServices.length > 0) {
      logStep("Processing additional services", { count: selectedServices.length });
      // You could create service booking records here if needed
    }

    const response = {
      success: true,
      booking: {
        id: booking.id,
        court_name: court?.name || 'Court',
        surface_type: court?.surface_type || 'hard',
        booking_date: bookingData.booking_date,
        start_time: bookingData.start_time,
        end_time: bookingData.end_time,
        total_amount: bookingData.total_amount,
        status: bookingData.status
      },
      payment: {
        session_id: session_id,
        amount_paid: session.amount_total! / 100,
        payment_status: session.payment_status
      }
    };

    logStep("Verification completed successfully", response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in verify-booking-payment", { message: errorMessage });
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});