import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) throw new Error("No stripe signature found");

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      logStep("Webhook signature verification failed", { error: err.message });
      return new Response("Webhook signature verification failed", { status: 400 });
    }

    logStep("Event type", { type: event.type });

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, supabaseClient);
        break;
        
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription, supabaseClient);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(event.data.object as Stripe.Subscription, supabaseClient);
        break;
        
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent, supabaseClient);
        break;
        
      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in stripe-webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
});

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, supabase: any) {
  logStep("Processing checkout completion", { sessionId: session.id });
  
  const metadata = session.metadata;
  if (!metadata) return;

  // Handle token pack purchases
  if (metadata.pack_id && metadata.total_tokens) {
    const { target_type, user_id, club_id, base_tokens, bonus_tokens, total_tokens } = metadata;
    
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 90); // 90 days from now

    if (target_type === 'player') {
      await supabase.rpc('add_tokens', {
        user_id: user_id,
        token_amount: parseInt(total_tokens),
        token_type: 'regular',
        transaction_type: 'token_pack_purchase',
        description: `Token pack purchase: ${base_tokens} base + ${bonus_tokens} bonus tokens`
      });
      
    } else if (target_type === 'coach') {
      await supabase.rpc('add_coach_tokens', {
        coach_id: user_id,
        token_amount: parseInt(total_tokens),
        token_type: 'coaching',
        transaction_type: 'token_pack_purchase',
        description: `Coach token pack: ${base_tokens} base + ${bonus_tokens} bonus tokens`
      });
      
    } else if (target_type === 'club' && club_id) {
      // Add to club's monthly pool
      const currentMonth = new Date().toISOString().slice(0, 7);
      
      const { data: pool } = await supabase
        .from('club_token_pools')
        .select('*')
        .eq('club_id', club_id)
        .eq('month_year', currentMonth)
        .single();

      if (pool) {
        await supabase
          .from('club_token_pools')
          .update({ 
            purchased_tokens: pool.purchased_tokens + parseInt(total_tokens),
            updated_at: new Date().toISOString()
          })
          .eq('club_id', club_id)
          .eq('month_year', currentMonth);
      } else {
        // Initialize pool if it doesn't exist
        await supabase.rpc('initialize_monthly_token_pool', {
          club_id_param: club_id,
          month_year_param: currentMonth
        });
        
        await supabase
          .from('club_token_pools')
          .update({ 
            purchased_tokens: parseInt(total_tokens),
            updated_at: new Date().toISOString()
          })
          .eq('club_id', club_id)
          .eq('month_year', currentMonth);
      }
    }
    
    logStep("Token pack purchase processed", { 
      target_type, 
      user_id, 
      club_id, 
      total_tokens 
    });
  }

  // Handle hybrid payments
  if (metadata.service_type && metadata.tokens_used) {
    logStep("Hybrid payment cash portion completed", { 
      sessionId: session.id,
      serviceType: metadata.service_type,
      tokensUsed: metadata.tokens_used
    });
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription, supabase: any) {
  logStep("Processing subscription change", { subscriptionId: subscription.id });
  
  const customer = await stripe.customers.retrieve(subscription.customer as string);
  if (!customer || customer.deleted) return;
  
  const email = customer.email;
  if (!email) return;

  // Update subscription status in database
  const subscriptionData = {
    stripe_subscription_id: subscription.id,
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    updated_at: new Date().toISOString()
  };

  // Determine subscription type based on price ID or metadata
  const priceId = subscription.items.data[0]?.price.id;
  
  // Update appropriate subscription table based on price ID patterns
  if (priceId?.includes('player')) {
    await supabase
      .from('player_subscriptions')
      .upsert({
        ...subscriptionData,
        player_id: customer.metadata?.user_id
      })
      .eq('stripe_subscription_id', subscription.id);
      
  } else if (priceId?.includes('coach')) {
    await supabase
      .from('coach_subscriptions')
      .upsert({
        ...subscriptionData,
        coach_id: customer.metadata?.user_id
      })
      .eq('stripe_subscription_id', subscription.id);
      
  } else if (priceId?.includes('club')) {
    await supabase
      .from('club_subscriptions')
      .upsert({
        ...subscriptionData,
        club_id: customer.metadata?.club_id
      })
      .eq('stripe_subscription_id', subscription.id);
  }

  logStep("Subscription updated", { subscriptionId: subscription.id, status: subscription.status });
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription, supabase: any) {
  logStep("Processing subscription cancellation", { subscriptionId: subscription.id });
  
  // Mark subscription as cancelled in all relevant tables
  const updates = { status: 'cancelled', updated_at: new Date().toISOString() };
  
  await supabase
    .from('player_subscriptions')
    .update(updates)
    .eq('stripe_subscription_id', subscription.id);
    
  await supabase
    .from('coach_subscriptions')
    .update(updates)
    .eq('stripe_subscription_id', subscription.id);
    
  await supabase
    .from('club_subscriptions')
    .update(updates)
    .eq('stripe_subscription_id', subscription.id);

  logStep("Subscription cancellation processed", { subscriptionId: subscription.id });
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  logStep("Processing payment success", { paymentIntentId: paymentIntent.id });
  
  // Handle any additional payment success logic here
  // This could include updating order status, sending confirmation emails, etc.
}