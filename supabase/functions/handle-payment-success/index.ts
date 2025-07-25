// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
// M1SSION™ Handle Payment Success - RESET COMPLETO 22/07/2025

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[HANDLE-PAYMENT-SUCCESS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('🚀 M1SSION™ Payment Success Handler Started', {
      method: req.method,
      timestamp: new Date().toISOString()
    });

    // Verify environment variables
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY not found');
    }

    // Initialize Supabase client with service role
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Parse request body
    const body = await req.json();
    const { payment_intent_id, user_id, plan } = body;
    
    logStep('📋 Payment success data', { payment_intent_id, user_id, plan });

    if (!payment_intent_id || !user_id || !plan) {
      throw new Error('Missing required fields');
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    // Verify payment intent status
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
    
    if (paymentIntent.status !== 'succeeded') {
      throw new Error(`Payment not succeeded. Status: ${paymentIntent.status}`);
    }

    logStep('✅ Payment verified successfully', {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      status: paymentIntent.status
    });

    // Update payment intent in database
    const { error: updateError } = await supabaseClient
      .from('payment_intents')
      .update({
        status: 'succeeded',
        updated_at: new Date().toISOString()
      })
      .eq('payment_intent_id', payment_intent_id);

    if (updateError) {
      logStep('⚠️ Payment intent update warning', updateError);
    }

    // Create or update subscription
    const { error: subscriptionError } = await supabaseClient
      .from('subscriptions')
      .upsert({
        user_id: user_id,
        tier: plan,
        status: 'active',
        stripe_payment_intent_id: payment_intent_id,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'user_id' 
      });

    if (subscriptionError) {
      logStep('❌ Subscription upsert error', subscriptionError);
      throw new Error('Failed to update subscription');
    }

    logStep('✅ Subscription updated successfully');

    // Calculate access_start_date based on plan
    const calculateAccessStartDate = (planName: string) => {
      const hours = planName === 'SILVER' ? 2 : planName === 'GOLD' ? 24 : planName === 'BLACK' ? 48 : planName === 'TITANIUM' ? 72 : 0;
      return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    };

    // Update user profile with subscription_plan and access_start_date
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .update({
        subscription_plan: plan,
        subscription_tier: plan,
        tier: plan,
        access_start_date: calculateAccessStartDate(plan),
        access_enabled: false, // Must be manually enabled
        updated_at: new Date().toISOString()
      })
      .eq('id', user_id);

    if (profileError) {
      logStep('❌ Profile update error', profileError);
      throw new Error('Failed to update profile');
    }

    logStep('✅ Profile updated successfully');

    // Log the successful upgrade
    const { error: logError } = await supabaseClient
      .from('panel_logs')
      .insert({
        event_type: 'subscription_upgraded_in_app',
        details: {
          user_id: user_id,
          new_tier: plan,
          payment_intent_id: payment_intent_id,
          amount: paymentIntent.amount,
          timestamp: new Date().toISOString(),
          source: 'in_app_checkout'
        }
      });

    if (logError) {
      logStep('⚠️ Panel log warning', logError);
    }

    logStep('🎉 Payment success processing completed');

    return new Response(JSON.stringify({
      success: true,
      tier: plan,
      message: 'Subscription activated successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep('❌ ERROR in handle-payment-success', { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: 'Payment success handling failed'
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