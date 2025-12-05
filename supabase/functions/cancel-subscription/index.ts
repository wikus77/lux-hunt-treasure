// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Cancel Subscription Edge Function - Sistema Abbonamenti M1SSION™

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "npm:stripe@14.25.0";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import { withCors } from "../_shared/cors.ts";
import { maskValue } from "../_shared/secureLog.ts";

const logStep = (step: string, details?: any) => {
  // Mask sensitive fields before logging
  if (details) {
    const masked = { ...details };
    if (masked.email) masked.email = maskValue(masked.email, 'email');
    if (masked.userId) masked.userId = maskValue(masked.userId, 'uuid');
    console.log(`[M1SSION-CANCEL] ${step} - ${JSON.stringify(masked)}`);
  } else {
    console.log(`[M1SSION-CANCEL] ${step}`);
  }
};

serve(withCors(async (req) => {
  try {
    logStep("🚀 M1SSION™ Cancel Subscription Started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY non configurato");
    logStep("✅ Stripe key verificata");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Header Authorization mancante");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Errore autenticazione: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("Utente non autenticato o email mancante");
    logStep("✅ Utente autenticato", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // 🚨 CRITICAL FIX: Find ALL subscriptions for user (active, trialing, past_due)
    const { data: allSubscriptions } = await supabaseClient
      .from('subscriptions')
      .select('stripe_subscription_id, stripe_customer_id')
      .eq('user_id', user.id)
      .not('stripe_subscription_id', 'is', null);

    logStep("📊 Found user subscriptions", { count: allSubscriptions?.length || 0 });

    // Cancel ALL Stripe subscriptions found
    if (allSubscriptions && allSubscriptions.length > 0) {
      for (const sub of allSubscriptions) {
        if (sub.stripe_subscription_id) {
          try {
            logStep("🚫 Canceling Stripe subscription", { subscriptionId: sub.stripe_subscription_id });
            await stripe.subscriptions.cancel(sub.stripe_subscription_id);
            logStep("✅ Stripe subscription canceled", { subscriptionId: sub.stripe_subscription_id });
          } catch (stripeError) {
            logStep("⚠️ Failed to cancel Stripe subscription", { 
              subscriptionId: sub.stripe_subscription_id, 
              error: (stripeError as Error).message 
            });
            // Continue with other subscriptions even if one fails
          }
        }
      }
    }

    // Also try to find and cancel by customer email
    try {
      const customers = await stripe.customers.list({ email: user.email, limit: 10 });
      if (customers.data.length > 0) {
        for (const customer of customers.data) {
          const subscriptions = await stripe.subscriptions.list({ 
            customer: customer.id,
            status: 'all'
          });
          
          for (const subscription of subscriptions.data) {
            if (['active', 'trialing', 'past_due'].includes(subscription.status)) {
              try {
                await stripe.subscriptions.cancel(subscription.id);
                logStep("✅ Additional Stripe subscription canceled", { subscriptionId: subscription.id });
              } catch (error) {
                logStep("⚠️ Error canceling additional subscription", { error: (error as Error).message });
              }
            }
          }
        }
      }
    } catch (error) {
      logStep("⚠️ Error searching customer subscriptions", { error: (error as Error).message });
    }

    // 🚨 CRITICAL FIX: Force update ALL subscriptions to canceled
    const { error: updateAllError } = await supabaseClient
      .from('subscriptions')
      .update({ 
        status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .neq('status', 'canceled');

    if (updateAllError) {
      logStep("⚠️ Error updating all subscriptions", { error: updateAllError });
    } else {
      logStep("✅ All subscriptions marked as canceled");
    }

    // 🚨 CRITICAL FIX: FORCE profile update - ALWAYS to Base
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .update({ 
        subscription_tier: 'Base',
        tier: 'Base',
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (profileError) {
      logStep("❌ CRITICAL ERROR updating profile", { error: profileError });
      throw new Error(`Profile update failed: ${profileError.message}`);
    } else {
      logStep("✅ Profile FORCED to Base tier");
    }

    // 🚨 CRITICAL FIX: Cleanup duplicate/orphaned subscriptions
    const { error: cleanupError } = await supabaseClient.rpc('cleanup_duplicate_subscriptions');
    if (cleanupError) {
      logStep("⚠️ Cleanup function error", { error: cleanupError });
    } else {
      logStep("✅ Database cleanup completed");
    }

    logStep("✅ COMPLETE DOWNGRADE SUCCESSFUL", { userId: user.id });

    return new Response(JSON.stringify({ 
      success: true,
      message: "Subscription canceled successfully"
    }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("❌ ERRORE CANCEL", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      timestamp: new Date().toISOString()
    }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}));

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
