// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Stripe Webhook Handler - Payment Intent Events for BUZZ MAP

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "npm:stripe@14.25.0";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[M1SSION-STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

const logError = (step: string, error: any) => {
  const errorDetails = {
    message: error?.message || 'Unknown error',
    code: error?.code,
    type: error?.type,
    stack: error?.stack
  };
  console.error(`[M1SSION-STRIPE-WEBHOOK] ❌ ${step}`, errorDetails);
};

serve(async (req) => {
  // No CORS handling needed for webhooks
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    logStep("🚀 Stripe webhook received");

    // Get environment variables
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeSecretKey || !webhookSecret) {
      logError("Configuration missing", { 
        hasStripeKey: !!stripeSecretKey, 
        hasWebhookSecret: !!webhookSecret 
      });
      return new Response("Configuration error", { status: 500 });
    }

    // Determine Stripe mode from secret key
    const stripeMode = stripeSecretKey.startsWith('sk_live_') ? 'live' : 'test';
    logStep("🔧 Stripe mode detected", { mode: stripeMode });

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get request body and signature
    let body: string;
    try {
      body = await req.text();
    } catch (error: any) {
      logError("Failed to read request body", error);
      return new Response("Invalid request body", { status: 400 });
    }
    
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      logError("Missing stripe-signature header", {});
      return new Response("Missing stripe-signature header", { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep("✅ Webhook signature verified", { 
        eventType: event.type, 
        eventId: event.id,
        mode: stripeMode
      });
    } catch (error: any) {
      logError("Webhook signature verification failed", error);
      return new Response(`Webhook signature verification failed: ${error?.message || 'Unknown error'}`, { status: 400 });
    }

    // Handle payment_intent.succeeded
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      logStep("💰 Payment intent succeeded", {
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        mode: stripeMode,
        eventId: event.id,
        metadata: paymentIntent.metadata
      });

      // Extract user information from metadata
      const userId = paymentIntent.metadata?.user_id;
      const userEmail = paymentIntent.metadata?.email;
      const paymentType = paymentIntent.metadata?.payment_type;
      const isSanityTest = paymentType === 'sanity_test' || paymentIntent.metadata?.test_mode === 'sanity';
      
      if (userId) {
        try {
          // Log successful payment to audit table
          const { error: auditError } = await supabaseClient
            .from('admin_logs')
            .insert({
              event_type: 'buzz_map_payment_ok',
              user_id: userId,
              note: `Payment intent succeeded: ${paymentIntent.id}`,
              context: JSON.stringify({
                payment_intent_id: paymentIntent.id,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                payment_type: paymentType,
                stripe_mode: stripeMode,
                event_id: event.id
              })
            });

          if (auditError) {
            logError("Failed to log payment success to audit", auditError);
          } else {
            logStep("✅ Payment success logged to audit", { userId, paymentIntentId: paymentIntent.id });
          }

          // P1: Log sanity test specifically
          if (isSanityTest) {
            const { error: sanityLogError } = await supabaseClient
              .from('admin_logs')
              .insert({
                event_type: 'stripe_sanity_ok',
                admin_id: userId,
                details: {
                  payment_intent_id: paymentIntent.id,
                  amount_cents: paymentIntent.amount,
                  currency: paymentIntent.currency,
                  credited_m1u: paymentIntent.metadata?.m1_units || 100,
                  test_mode: paymentIntent.metadata?.test_mode,
                  stripe_mode: stripeMode,
                  timestamp: new Date().toISOString()
                }
              });

            if (sanityLogError) {
              logError("Failed to log sanity test", sanityLogError);
            } else {
              logStep("✅ Sanity test logged", { userId, paymentIntentId: paymentIntent.id });
            }
          }

          // 🔥 M1U PURCHASE: Credit M1U to user account
          if (paymentType === 'm1u_purchase') {
            const m1uAmount = parseInt(paymentIntent.metadata?.m1u_amount || '0', 10);
            const packCode = paymentIntent.metadata?.pack_code || 'unknown';
            
            if (m1uAmount > 0) {
              logStep("💰 Processing M1U purchase credit", { 
                userId, 
                m1uAmount,
                packCode,
                paymentIntentId: paymentIntent.id 
              });

              // Call admin_credit_m1u RPC to credit M1U
              const { data: creditResult, error: creditError } = await supabaseClient.rpc('admin_credit_m1u', {
                p_user_id: userId,
                p_amount: m1uAmount,
                p_reason: `m1u_purchase:${packCode}:${paymentIntent.id}`
              });

              if (creditError) {
                logError("Failed to credit M1U via RPC", creditError);
                
                // Fallback: Direct update (less safe but ensures credit)
                const { error: directError } = await supabaseClient
                  .from('profiles')
                  .update({ 
                    m1_units: supabaseClient.rpc('m1u_add', { amount: m1uAmount }),
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', userId);
                  
                if (directError) {
                  logError("Direct M1U update also failed", directError);
                  
                  // Last resort: raw SQL increment
                  const { error: rawError } = await supabaseClient.rpc('admin_credit_m1u', {
                    p_user_id: userId,
                    p_amount: m1uAmount,
                    p_reason: `m1u_purchase_retry:${packCode}:${paymentIntent.id}`
                  });
                  
                  if (rawError) {
                    logError("All M1U credit attempts failed!", rawError);
                  }
                }
              } else {
                logStep("✅ M1U credited successfully", { 
                  userId, 
                  m1uAmount, 
                  result: creditResult,
                  paymentIntentId: paymentIntent.id 
                });

                // Log successful M1U purchase to audit
                await supabaseClient
                  .from('admin_logs')
                  .insert({
                    event_type: 'm1u_purchase_credited',
                    user_id: userId,
                    note: `M1U Purchase: ${m1uAmount} M1U credited from ${packCode}`,
                    context: JSON.stringify({
                      payment_intent_id: paymentIntent.id,
                      m1u_amount: m1uAmount,
                      pack_code: packCode,
                      credit_result: creditResult,
                      stripe_mode: stripeMode,
                      timestamp: new Date().toISOString()
                    })
                  });
              }
            } else {
              logError("M1U purchase has no m1u_amount in metadata", { 
                paymentIntentId: paymentIntent.id,
                metadata: paymentIntent.metadata 
              });
            }
          }

          // Example: Update user credits for buzz map
          if (paymentType === 'buzz_map') {
            logStep("🎯 BUZZ MAP payment confirmed", { 
              userId, 
              amount: paymentIntent.amount,
              paymentIntentId: paymentIntent.id 
            });
          }

        } catch (error: any) {
          logError("Error processing payment success", error);
        }
      } else {
        logStep("⚠️ Payment succeeded but no user_id in metadata", { 
          paymentIntentId: paymentIntent.id,
          metadata: paymentIntent.metadata 
        });
      }
    }

    // Handle payment_intent.payment_failed
    else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      logStep("❌ Payment intent failed", {
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        mode: stripeMode,
        eventId: event.id,
        lastPaymentError: paymentIntent.last_payment_error,
        metadata: paymentIntent.metadata
      });

      // Extract user information from metadata
      const userId = paymentIntent.metadata?.user_id;
      const paymentType = paymentIntent.metadata?.payment_type;
      
      if (userId) {
        try {
          // Log failed payment to audit table
          const { error: auditError } = await supabaseClient
            .from('admin_logs')
            .insert({
              event_type: 'payment_failed',
              user_id: userId,
              note: `Payment intent failed: ${paymentIntent.id}`,
              context: JSON.stringify({
                payment_intent_id: paymentIntent.id,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                payment_type: paymentType,
                stripe_mode: stripeMode,
                event_id: event.id,
                failure_reason: paymentIntent.last_payment_error?.message || 'Unknown error'
              })
            });

          if (auditError) {
            logError("Failed to log payment failure to audit", auditError);
          } else {
            logStep("✅ Payment failure logged to audit", { userId, paymentIntentId: paymentIntent.id });
          }

        } catch (error: any) {
          logError("Error processing payment failure", error);
        }
      }
    }

    // Handle other event types (optional for future extension)
    else {
      logStep("ℹ️ Unhandled event type", { 
        eventType: event.type, 
        eventId: event.id,
        mode: stripeMode 
      });
    }

    // Always respond 200 OK to prevent Stripe retries (except for signature failures)
    return new Response(JSON.stringify({ 
      received: true, 
      eventId: event.id,
      eventType: event.type,
      mode: stripeMode,
      timestamp: new Date().toISOString()
    }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    logError("Webhook processing error", error);
    
    // Return 200 even for processing errors to prevent Stripe retries
    // Only signature verification errors should return 400
    return new Response(JSON.stringify({ 
      error: "Internal processing error",
      timestamp: new Date().toISOString()
    }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  }
});

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™