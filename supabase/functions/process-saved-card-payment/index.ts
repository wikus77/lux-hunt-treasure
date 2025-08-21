// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ Process Payment with Saved Card Edge Function

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SAVED-CARD-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🟡 Stripe saved card payment handler avviato");
    logStep("Processing saved card payment");

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    console.log('🧾 Stripe Key Check:', { keyPresent: !!stripeKey, keyLength: stripeKey?.length });
    
    if (!stripeKey) {
      console.error("❌ STRIPE_SECRET_KEY not configured");
      throw new Error("STRIPE_SECRET_KEY not configured");
    }
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Initialize Supabase
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) {
      throw new Error("Authentication failed");
    }

    const user = userData.user;
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse request body
    const body = await req.json();
    console.log('🧾 Payload ricevuto:', body);
    
    const { 
      payment_method_id, 
      amount, 
      currency = 'eur', 
      payment_type,
      plan,
      description,
      metadata = {}
    } = body;

    logStep("Payment details", { 
      payment_method_id, 
      amount, 
      currency, 
      payment_type,
      plan 
    });

    // Verify payment method belongs to user
    const { data: paymentMethod, error: pmError } = await supabaseClient
      .from('user_payment_methods')
      .select('*')
      .eq('user_id', user.id)
      .eq('stripe_pm_id', payment_method_id)
      .maybeSingle();

    if (pmError || !paymentMethod) {
      throw new Error("Payment method not found or unauthorized");
    }

    logStep("Payment method verified", { 
      brand: paymentMethod.brand, 
      last4: paymentMethod.last4 
    });

    // Create payment intent
    console.log('💳 Creating Stripe Payment Intent with saved card...');
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: currency,
        payment_method: payment_method_id,
        customer: paymentMethod.stripe_customer_id,
        confirmation_method: 'manual',
        confirm: true,
        return_url: `${req.headers.get("origin")}/payment-success`,
        description: description,
        metadata: {
          user_id: user.id,
          payment_type: payment_type,
          plan: plan || '',
          ...metadata
        }
      });

      console.log('💳 Intent Stripe:', paymentIntent?.id);
      logStep("Payment intent created", { 
        id: paymentIntent.id, 
        status: paymentIntent.status 
      });
    } catch (stripeError) {
      console.error('❌ Errore Stripe:', stripeError?.message);
      throw stripeError;
    }

    // Record payment in database
    await supabaseClient.from('payment_intents').insert({
      user_id: user.id,
      payment_intent_id: paymentIntent.id,
      plan: plan || payment_type,
      amount: amount,
      currency: currency,
      status: paymentIntent.status
    });

    // Handle different payment outcomes
    if (paymentIntent.status === 'succeeded') {
      logStep("Payment succeeded immediately");
      
      // Create transaction record
      await supabaseClient.from('payment_transactions').insert({
        user_id: user.id,
        amount: amount / 100, // Convert back to euros
        currency: currency,
        description: description,
        status: 'completed',
        payment_method: `${paymentMethod.brand} ****${paymentMethod.last4}`,
        stripe_payment_intent_id: paymentIntent.id
      });

      const successResponse = {
        success: true,
        payment_intent_id: paymentIntent.id,
        status: 'succeeded'
      };
      
      console.log('📋 Risposta restituita (SUCCESS):', successResponse);
      return new Response(JSON.stringify(successResponse), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else if (paymentIntent.status === 'requires_action' && paymentIntent.next_action?.type === 'use_stripe_sdk') {
      logStep("Payment requires additional authentication");
      
      return new Response(JSON.stringify({
        requires_action: true,
        payment_intent: {
          id: paymentIntent.id,
          client_secret: paymentIntent.client_secret
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      throw new Error(`Payment failed with status: ${paymentIntent.status}`);
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

/*
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * M1SSION™ - Saved Card Payment Processing
 */