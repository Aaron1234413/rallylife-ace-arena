import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-MERCHANDISE-ORDER] ${step}${detailsStr}`);
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
      item_id,
      item_name,
      item_price_usd,
      tokens_used,
      cash_amount,
      shipping_cost,
      total_amount,
      shipping_address,
      item_metadata
    } = await req.json();

    logStep("Processing merchandise order", { 
      item_name, 
      item_price_usd, 
      tokens_used, 
      cash_amount,
      shipping_cost,
      total_amount
    });

    // Validate payment amounts
    if (Math.abs((cash_amount + shipping_cost) - (item_price_usd - tokens_used * 0.01 + shipping_cost)) > 0.01) {
      throw new Error("Payment amounts don't match item price");
    }

    // Create the merchandise order record
    const { data: orderData, error: orderError } = await supabaseClient
      .from('merchandise_orders')
      .insert({
        user_id: user.id,
        item_id,
        item_name,
        item_price_usd,
        tokens_used,
        cash_amount,
        shipping_cost,
        total_amount,
        shipping_name: shipping_address.name,
        shipping_address_line1: shipping_address.addressLine1,
        shipping_address_line2: shipping_address.addressLine2,
        shipping_city: shipping_address.city,
        shipping_state: shipping_address.state,
        shipping_postal_code: shipping_address.postalCode,
        shipping_country: shipping_address.country,
        order_metadata: item_metadata,
        status: cash_amount > 0 ? 'pending_payment' : 'paid',
        payment_status: cash_amount > 0 ? 'pending' : 'completed'
      })
      .select()
      .single();

    if (orderError) {
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    logStep("Order record created", { orderId: orderData.id });

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
                name: item_name,
                description: `Tennis merchandise from Diadem Sports. ${tokens_used > 0 ? `Tokens used: ${tokens_used}` : ''}`,
                images: [], // Would add product images here
              },
              unit_amount: Math.round((cash_amount + shipping_cost) * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.headers.get("origin")}/store?order=success&order_id=${orderData.id}`,
        cancel_url: `${req.headers.get("origin")}/store?order=cancelled&order_id=${orderData.id}`,
        metadata: {
          order_id: orderData.id,
          user_id: user.id,
          item_id,
          tokens_used: tokens_used.toString(),
          merchandise_order: 'true'
        },
        shipping_address_collection: {
          allowed_countries: ['US', 'CA']
        }
      });

      // Update order with Stripe session ID
      await supabaseClient
        .from('merchandise_orders')
        .update({ 
          stripe_session_id: session.id,
          status: 'pending_payment'
        })
        .eq('id', orderData.id);

      paymentResult = { url: session.url, session_id: session.id };
      logStep("Stripe session created", { sessionId: session.id });
    } else {
      // No cash payment needed - order is complete
      await supabaseClient
        .from('merchandise_orders')
        .update({ 
          status: 'paid',
          payment_status: 'completed'
        })
        .eq('id', orderData.id);
      
      logStep("Order completed with tokens only");
    }

    // TODO: In a real implementation, you would:
    // 1. Send order details to Diadem Sports API or fulfillment service
    // 2. Set up webhook to track order status
    // 3. Send confirmation email to customer
    // 4. Update inventory if tracking stock levels

    logStep("Merchandise order processed successfully");

    return new Response(JSON.stringify({
      success: true,
      order_id: orderData.id,
      tokens_used,
      cash_amount: cash_amount + shipping_cost,
      payment_url: paymentResult?.url,
      session_id: paymentResult?.session_id,
      message: cash_amount > 0 ? 'Order created. Complete payment to finalize.' : 'Order completed successfully!'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in process-merchandise-order", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});