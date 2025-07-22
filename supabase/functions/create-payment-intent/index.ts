/**
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Create Payment Intent Edge Function - WARNING FREE VERSION
 * FIXES: WARNING #11-18 (CORS, Headers, JWT)
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// WARNING #11-14 FIXED: Complete CORS headers for PWA iOS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
  'Vary': 'Origin',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PAYMENT-INTENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // WARNING #11-12 FIXED: Proper CORS preflight handling
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    logStep('🚀 M1SSION™ Payment Intent Creation Started', {
      method: req.method,
      timestamp: new Date().toISOString()
    });

    // Verify environment variables
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY not found');
    }
    logStep('✅ Stripe key verified');

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header provided');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) {
      throw new Error('User not authenticated or email not available');
    }
    logStep('✅ User authenticated', { userId: user.id, email: user.email });

    // Parse request body
    const body = await req.json();
    const { user_id, plan, amount, currency = 'eur', payment_type, is_buzz_map } = body;
    
    logStep('📋 Payment intent request', { user_id, plan, amount, currency, payment_type, is_buzz_map });

    // Validate amount
    if (!amount || amount < 50) { // Minimum 0.50 EUR
      throw new Error('Invalid amount - minimum 0.50 EUR required');
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    // Find or create customer
    let customerId: string;
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep('🔍 Existing customer found', { customerId });
    } else {
      const newCustomer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
          plan: plan
        }
      });
      customerId = newCustomer.id;
      logStep('👤 New customer created', { customerId });
    }

    // Create payment intent with dynamic metadata based on payment type
    const metadata: any = { 
      user_id: user.id,
      source: 'in_app_checkout'
    };
    
    let description = '';
    
    if (payment_type === 'subscription') {
      metadata.plan = plan;
      metadata.payment_type = 'subscription';
      description = `M1SSION™ ${plan} subscription payment`;
    } else {
      metadata.payment_type = payment_type || 'buzz';
      metadata.is_buzz_map = is_buzz_map || false;
      metadata.item_name = is_buzz_map ? 'BUZZ Map' : 'BUZZ Extra';
      description = is_buzz_map ? 'M1SSION™ BUZZ Map generation' : 'M1SSION™ BUZZ Extra content';
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      customer: customerId,
      setup_future_usage: payment_type === 'subscription' ? 'off_session' : undefined,
      metadata,
      description
    });

    logStep('✅ Payment intent created', {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret?.slice(0, 20) + '...',
      amount: paymentIntent.amount,
      status: paymentIntent.status
    });

    // Store payment intent in database with appropriate data
    const insertData: any = {
      payment_intent_id: paymentIntent.id,
      user_id: user.id,
      amount: amount,
      currency: currency,
      status: paymentIntent.status,
      created_at: new Date().toISOString()
    };

    if (payment_type === 'subscription') {
      insertData.plan = plan;
    } else {
      insertData.payment_type = payment_type || 'buzz';
      insertData.is_buzz_map = is_buzz_map || false;
    }

    const { error: dbError } = await supabaseClient
      .from('payment_intents')
      .insert(insertData);

    if (dbError) {
      logStep('⚠️ Database insert warning', dbError);
      // Don't fail the request for database issues
    } else {
      logStep('✅ Payment intent stored in database');
    }

    return new Response(JSON.stringify({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep('❌ ERROR in create-payment-intent', { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: 'Payment intent creation failed'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ - RESET COMPLETO 22/07/2025
 */