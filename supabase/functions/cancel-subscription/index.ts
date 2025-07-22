// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Cancel Subscription Edge Function - Sistema Abbonamenti M1SSION™

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[M1SSION-CANCEL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

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

    // Find active subscriptions for user
    const { data: activeSubscriptions } = await supabaseClient
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (activeSubscriptions && activeSubscriptions.length > 0) {
      // Cancel each active Stripe subscription
      for (const sub of activeSubscriptions) {
        if (sub.stripe_subscription_id) {
          try {
            await stripe.subscriptions.cancel(sub.stripe_subscription_id);
            logStep("✅ Stripe subscription canceled", { subscriptionId: sub.stripe_subscription_id });
          } catch (error) {
            logStep("⚠️ Failed to cancel Stripe subscription", { subscriptionId: sub.stripe_subscription_id, error });
          }
        }
      }
    }

    // Update database - Force cleanup
    const { error: updateError } = await supabaseClient
      .from('subscriptions')
      .update({ 
        status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (updateError) {
      logStep("⚠️ Error updating subscriptions table", { error: updateError });
    } else {
      logStep("✅ Subscriptions table updated");
    }

    // Force profile update
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .update({ 
        subscription_tier: 'Base',
        tier: 'Base',
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (profileError) {
      logStep("⚠️ Error updating profile", { error: profileError });
    } else {
      logStep("✅ Profile updated to Base");
    }

    logStep("✅ User downgraded to Base plan", { userId: user.id });

    return new Response(JSON.stringify({ 
      success: true,
      message: "Subscription canceled successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("❌ ERRORE CANCEL", { message: errorMessage });
    
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