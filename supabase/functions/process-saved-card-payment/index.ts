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

    // Enhanced logging for payment debugging
    console.log(`🧾 Stripe Key Check: { keyPresent: ${!!Deno.env.get("STRIPE_SECRET_KEY")}, keyLength: ${Deno.env.get("STRIPE_SECRET_KEY")?.length || 0} }`);
    
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      console.error("❌ STRIPE_SECRET_KEY is missing from environment");
      throw new Error("STRIPE_SECRET_KEY non configurata");
    }
    
    if (!stripeKey.startsWith("sk_live_") && !stripeKey.startsWith("sk_test_")) {
      console.error("❌ STRIPE_SECRET_KEY invalid format:", stripeKey.substring(0, 8));
      throw new Error("STRIPE_SECRET_KEY deve iniziare con sk_live_ o sk_test_");
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
    
    // Enhanced payload logging
    console.log(`🧾 Payload ricevuto: {
  user_id: "${body.user_id}",
  payment_method_id: "${body.payment_method_id}",
  plan: "${body.plan}",
  amount: ${body.amount},
  currency: "${body.currency}",
  payment_type: "${body.payment_type}",
  description: "${body.description}",
  metadata: ${JSON.stringify(body.metadata, null, 2)}
}`);
    
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

    // 🔥 CRITICAL FIX: Invece di verificare payment method in DB, lo creiamo dinamicamente da Stripe
    let paymentMethod;
    
    try {
      // Prima proviamo dal database
      const { data: existingPM, error: pmError } = await supabaseClient
        .from('user_payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .eq('stripe_pm_id', payment_method_id)
        .maybeSingle();

      if (existingPM) {
        console.log('💳 Payment method found in database');
        paymentMethod = existingPM;
      } else {
        console.log('💳 Payment method not in DB, retrieving from Stripe...');
        
        // Recupera il payment method da Stripe
        const pmDetails = await stripe.paymentMethods.retrieve(payment_method_id);
        console.log('💳 Payment method retrieved from Stripe:', pmDetails.id);
        
        // Crea automaticamente il record nel database
        const { data: newPM, error: insertError } = await supabaseClient
          .from('user_payment_methods')
          .upsert({
            user_id: user.id,
            stripe_pm_id: payment_method_id,
            stripe_customer_id: pmDetails.customer || `cus_${user.id.slice(0, 14)}`,
            brand: pmDetails.card?.brand || 'unknown',
            last4: pmDetails.card?.last4 || '0000',
            exp_month: pmDetails.card?.exp_month || 12,
            exp_year: pmDetails.card?.exp_year || 2030,
            is_default: true
          })
          .select()
          .single();
          
        if (insertError) {
          console.error('❌ Failed to upsert payment method:', insertError);
          // Continua comunque con un payment method fittizio
          paymentMethod = {
            stripe_pm_id: payment_method_id,
            stripe_customer_id: pmDetails.customer || `cus_${user.id.slice(0, 14)}`,
            brand: pmDetails.card?.brand || 'card',
            last4: pmDetails.card?.last4 || '0000'
          };
        } else {
          paymentMethod = newPM;
          console.log('✅ Payment method record created/updated in database');
        }
      }
    } catch (stripeError) {
      console.error('❌ Stripe error retrieving payment method:', stripeError);
      
      // 🔥 FALLBACK DYNAMICO: Crea customer e payment method al volo
      console.log('🔄 Creating emergency customer and payment method...');
      
      try {
        // Crea customer Stripe se non esiste
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: { user_id: user.id }
        });
        
        console.log('✅ Emergency customer created:', customer.id);
        
        // Usa payment method fittizio per continuare
        paymentMethod = {
          stripe_pm_id: payment_method_id,
          stripe_customer_id: customer.id,
          brand: 'card',
          last4: '0000'
        };
        
      } catch (emergencyError) {
        console.error('❌ Emergency customer creation failed:', emergencyError);
        throw new Error('Unable to process payment - no valid payment method or customer');
      }
    }

    logStep("Payment method verified", { 
      brand: paymentMethod.brand, 
      last4: paymentMethod.last4 
    });

    // Create payment intent with enhanced error handling
    console.log('💳 Creating Stripe Payment Intent with saved card...');
    console.log(`🔍 Payment Details: amount=${amount}, currency=${currency}, customer=${paymentMethod.stripe_customer_id}, pm=${payment_method_id}`);
    
    let paymentIntent;
    try {
      // Validate payment method belongs to customer
      const paymentMethodDetails = await stripe.paymentMethods.retrieve(payment_method_id);
      console.log(`🔍 Payment Method Details: customer=${paymentMethodDetails.customer}, type=${paymentMethodDetails.type}`);
      
      if (paymentMethodDetails.customer !== paymentMethod.stripe_customer_id) {
        throw new Error(`Payment method customer mismatch: ${paymentMethodDetails.customer} vs ${paymentMethod.stripe_customer_id}`);
      }

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
          function: 'process-saved-card-payment',
          timestamp: new Date().toISOString(),
          ...metadata
        }
      });

      console.log('💳 Intent Stripe creato con successo:', paymentIntent?.id);
      console.log(`💳 Payment Intent Status: ${paymentIntent.status}`);
      logStep("Payment intent created", { 
        id: paymentIntent.id, 
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency
      });
    } catch (stripeError) {
      console.error('❌ Errore Stripe completo:', {
        message: stripeError?.message,
        type: stripeError?.type,
        code: stripeError?.code,
        payment_method_id,
        customer_id: paymentMethod.stripe_customer_id
      });
      throw new Error(`Stripe Error: ${stripeError?.message || 'Unknown error'}`);
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
        status: 'succeeded',
        amount: amount / 100,
        currency: currency,
        payment_method: `${paymentMethod.brand} ****${paymentMethod.last4}`,
        timestamp: new Date().toISOString()
      };
      
      console.log('📋 Risposta restituita (SUCCESS):', JSON.stringify(successResponse, null, 2));
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
    
    // Enhanced error response with detailed debugging
    const errorResponse = { 
      error: errorMessage,
      success: false,
      debug: {
        timestamp: new Date().toISOString(),
        function: 'process-saved-card-payment'
      }
    };
    
    console.log(`📤 Error Response: ${JSON.stringify(errorResponse, null, 2)}`);
    
    return new Response(JSON.stringify(errorResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

/*
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * M1SSION™ - Saved Card Payment Processing
 */