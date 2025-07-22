// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Stripe Webhook Handler - Sistema Abbonamenti M1SSION™

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[M1SSION-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("🚀 M1SSION™ Webhook Started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey || !webhookSecret) {
      throw new Error("STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET non configurati");
    }
    logStep("✅ Stripe keys verificate");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      throw new Error("Missing stripe-signature header");
    }

    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep("✅ Webhook signature verified", { type: event.type });
    } catch (err) {
      logStep("❌ Webhook signature verification failed", { error: err.message });
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      logStep("💳 Checkout session completed", {
        sessionId: session.id,
        customerId: session.customer,
        paymentStatus: session.payment_status,
        amountTotal: session.amount_total
      });

      // Process webhook completion
      const success = await supabaseClient.rpc('process_stripe_webhook_completed', {
        p_session_id: session.id,
        p_stripe_customer_id: session.customer as string,
        p_payment_status: session.payment_status,
        p_amount_total: session.amount_total
      });

      if (success.error) {
        logStep("❌ Error processing webhook", { error: success.error });
        return new Response("Error processing webhook", { status: 500 });
      }

      logStep("✅ Webhook processed successfully", { sessionId: session.id });
    }

    // Handle payment_intent.succeeded (CRITICAL FOR DB SYNC)
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      logStep("💰 Payment intent succeeded", {
        paymentIntentId: paymentIntent.id,
        customerId: paymentIntent.customer,
        amount: paymentIntent.amount
      });

      // Find session by payment intent and update profile directly
      if (paymentIntent.metadata?.session_id) {
        const sessionId = paymentIntent.metadata.session_id;
        
        // Get session from database
        const { data: sessionData } = await supabaseClient
          .from('checkout_sessions')
          .select('*')
          .eq('session_id', sessionId)
          .single();
        
        if (sessionData) {
          // Force profile update
          const { error: profileError } = await supabaseClient
            .from('profiles')
            .update({
              subscription_tier: sessionData.tier,
              tier: sessionData.tier,
              updated_at: new Date().toISOString()
            })
            .eq('id', sessionData.user_id);
          
          logStep("✅ Profile force updated after payment", { 
            userId: sessionData.user_id, 
            tier: sessionData.tier,
            error: profileError 
          });
        }
      }
    }

    // Handle subscription updates
    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.created') {
      const subscription = event.data.object as Stripe.Subscription;
      
      logStep("🔄 Subscription updated", {
        subscriptionId: subscription.id,
        customerId: subscription.customer,
        status: subscription.status
      });

      // Update subscription status in database
      const { error } = await supabaseClient
        .from('subscriptions')
        .update({
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscription.id);

      if (error) {
        logStep("❌ Error updating subscription", { error });
      } else {
        logStep("✅ Subscription updated successfully");

        // Force immediate sync to profile
        await supabaseClient
          .from('profiles')
          .update({ 
            subscription_tier: subscription.metadata?.tier || 'Base',
            tier: subscription.metadata?.tier || 'Base',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', subscription.customer as string);

        logStep("✅ Profile tier synced from subscription update");
      }
    }

    // Handle subscription cancellation
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      
      logStep("🗑️ Subscription canceled", {
        subscriptionId: subscription.id,
        customerId: subscription.customer
      });

      // Find user by customer ID and reset to Base
      const { data: subscriptions } = await supabaseClient
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_subscription_id', subscription.id)
        .limit(1);

      if (subscriptions && subscriptions.length > 0) {
        const userId = subscriptions[0].user_id;
        
        // Update subscription to canceled
        await supabaseClient
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', subscription.id);

        // Reset user to Base plan
        await supabaseClient
          .from('profiles')
          .update({ 
            subscription_tier: 'Base',
            tier: 'Base'
          })
          .eq('id', userId);

        logStep("✅ User reset to Base plan", { userId });
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("❌ ERRORE WEBHOOK", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™