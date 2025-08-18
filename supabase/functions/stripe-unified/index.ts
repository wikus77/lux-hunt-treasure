// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
// Unified Stripe Payment Handler

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error('Authentication failed');
    }

    const { type, amount, plan, currency = 'eur', description } = await req.json();

    let paymentIntent;

    if (type === 'subscription') {
      // Handle subscription creation
      const customers = await stripe.customers.list({ 
        email: userData.user.email,
        limit: 1 
      });

      let customerId;
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email: userData.user.email,
          metadata: {
            user_id: userData.user.id
          }
        });
        customerId = customer.id;
      }

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: getPriceIdForPlan(plan) }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      paymentIntent = subscription.latest_invoice?.payment_intent;

    } else if (type === 'buzz') {
      // Handle one-time payment for buzz credits
      paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency,
        description,
        metadata: {
          user_id: userData.user.id,
          type: 'buzz_credits'
        }
      });
    }

    if (!paymentIntent) {
      throw new Error('Failed to create payment intent');
    }

    return new Response(JSON.stringify({
      success: true,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Stripe payment error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

function getPriceIdForPlan(plan: string): string {
  const prices = {
    silver: 'price_silver_monthly',
    gold: 'price_gold_monthly', 
    black: 'price_black_monthly',
    titanium: 'price_titanium_monthly'
  };
  
  return prices[plan as keyof typeof prices] || prices.silver;
}