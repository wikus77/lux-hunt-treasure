// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import Stripe from 'npm:stripe@14.25.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

const allowedOrigins = [
  'https://m1ssion.eu',
  'https://www.m1ssion.eu', 
  'https://m1ssion.pages.dev',
  'http://localhost:5173'
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const headers = { ...corsHeaders };
  if (origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  return headers;
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

serve(async (req) => {
  const requestId = generateRequestId();
  const origin = req.headers.get('origin');
  const headers = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        status: 405,
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST method allowed',
        request_id: requestId
      }),
      { status: 405, headers: { ...headers, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Parse request body
    const body = await req.json();
    console.log(`[${requestId}] Request received:`, {
      hasAmountCents: 'amountCents' in body,
      hasAmount: 'amount' in body,
      currency: body.currency || 'eur'
    });

    // Extract and validate amount
    let amountCents: number;
    
    if (body.amountCents && typeof body.amountCents === 'number') {
      // Preferred: direct amountCents
      amountCents = Math.round(body.amountCents);
    } else if (body.amount && typeof body.amount === 'number') {
      // Retro-compatibility: convert amount to cents
      amountCents = Math.round(body.amount * 100);
      console.log(`[${requestId}] Converted amount ${body.amount} to ${amountCents} cents`);
    } else {
      return new Response(
        JSON.stringify({
          status: 400,
          code: 'INVALID_AMOUNT',
          message: 'amountCents (integer) or amount (decimal) is required',
          request_id: requestId
        }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    // Validate amount range
    if (amountCents < 100 || amountCents > 1_000_000) {
      return new Response(
        JSON.stringify({
          status: 400,
          code: 'AMOUNT_OUT_OF_RANGE',
          message: 'Amount must be between 100 and 1,000,000 cents (€1.00 - €10,000.00)',
          request_id: requestId
        }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    const currency = body.currency || 'eur';
    const metadata = body.metadata || {};

    // Initialize Stripe
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      console.error(`[${requestId}] Missing STRIPE_SECRET_KEY`);
      return new Response(
        JSON.stringify({
          status: 500,
          code: 'STRIPE_CONFIG_ERROR',
          message: 'Stripe configuration error',
          request_id: requestId
        }),
        { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Determine mode from key
    const mode = stripeSecretKey.startsWith('sk_live_') ? 'live' : 'test';

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        ...metadata,
        request_id: requestId,
        source: 'M1SSION_PWA',
        timestamp: new Date().toISOString()
      }
    });

    console.log(`[${requestId}] Payment Intent created:`, {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      mode: mode
    });

    // Return response
    const response = {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      mode: mode,
      request_id: requestId
    };

    console.log(`[${requestId}] Response prepared:`, {
      hasClientSecret: !!response.clientSecret,
      paymentIntentId: response.paymentIntentId,
      amount: response.amount,
      mode: response.mode
    });

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...headers, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error(`[${requestId}] Error:`, error);
    
    const isStripeError = error && typeof error === 'object' && 'type' in error;
    
    return new Response(
      JSON.stringify({
        status: isStripeError ? 402 : 500,
        code: isStripeError ? 'STRIPE_ERROR' : 'INTERNAL_ERROR',
        message: isStripeError ? error.message : 'Internal server error',
        request_id: requestId
      }),
      { 
        status: isStripeError ? 402 : 500, 
        headers: { ...headers, 'Content-Type': 'application/json' } 
      }
    );
  }
});