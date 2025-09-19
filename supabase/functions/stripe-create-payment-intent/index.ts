// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Fixed Stripe Payment Intent Function - Deno compatible
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const ALLOWED_ORIGINS = [
  "https://m1ssion.eu",
  "https://www.m1ssion.eu",
  "https://m1ssion.pages.dev",
  "http://localhost:8788", // dev
  "http://localhost:5173", // vite dev
  "http://localhost:3000"  // legacy dev
];

function corsHeaders(req: Request) {
  const origin = req.headers.get("Origin") ?? "";
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin",
  };
}

function handleOptions(req: Request) {
  return new Response("ok", { status: 200, headers: corsHeaders(req) });
}


serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') return handleOptions(req);

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json', ...corsHeaders(req) }
    });
  }

  try {
    const secret = Deno.env.get('STRIPE_SECRET_KEY');
    if (!secret) {
      console.error('Missing STRIPE_SECRET_KEY environment variable');
      return new Response(JSON.stringify({ error: 'Missing STRIPE_SECRET_KEY' }), {
        status: 500,
        headers: { 'content-type': 'application/json', ...corsHeaders(req) }
      });
    }

    const mode = secret.startsWith('sk_live_') ? 'live' : secret.startsWith('sk_test_') ? 'test' : 'unknown';

    const body = await req.json();
    const { amountCents, currency } = body;

    // Validate input
    if (!Number.isFinite(amountCents) || amountCents < 1) {
      return new Response(JSON.stringify({ error: 'Invalid amountCents' }), {
        status: 400,
        headers: { 'content-type': 'application/json', ...corsHeaders(req) }
      });
    }

    console.log(`[M1SSION] Creating Payment Intent in ${mode} mode: ${amountCents} ${currency || 'eur'}`);

    // Create Payment Intent using fetch API instead of Stripe SDK
    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secret}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: Math.floor(amountCents).toString(),
        currency: String(currency || 'eur'),
        'automatic_payment_methods[enabled]': 'true',
        'metadata[source]': 'M1SSION_SMOKE_TEST',
        'metadata[timestamp]': new Date().toISOString()
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Stripe API Error:', error);
      return new Response(JSON.stringify({ error: 'Stripe API error' }), {
        status: response.status,
        headers: { 'content-type': 'application/json', ...corsHeaders(req) }
      });
    }

    const intent = await response.json();
    console.log(`[M1SSION] Payment Intent created: ${intent.id} (mode=${mode})`);

    return new Response(JSON.stringify({ 
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
      amount: intent.amount,
      currency: intent.currency,
      mode
    }), {
      status: 200,
      headers: { 'content-type': 'application/json', ...corsHeaders(req) }
    });

  } catch (err) {
    console.error('Payment Intent Error:', err);
    return new Response(JSON.stringify({ 
      error: (err as Error).message,
      type: 'stripe_error'
    }), {
      status: 500,
      headers: { 'content-type': 'application/json', ...corsHeaders(req) }
    });
  }
});