// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// SMOKE TEST EDGE FUNCTION - Can be removed at any time
import Stripe from 'https://esm.sh/stripe@13.6.0?target=deno&dts';
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const ALLOW = new Set([
  'https://m1ssion.eu',
  'https://www.m1ssion.eu', 
  'http://localhost:5173',
  'http://localhost:3000'
]);

function cors(origin: string | null) {
  const o = origin && ALLOW.has(origin) ? origin : '*';
  return {
    'Access-Control-Allow-Origin': o,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: cors(req.headers.get('origin')) });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json', ...cors(req.headers.get('origin')) }
    });
  }

  try {
    const secret = Deno.env.get('STRIPE_SECRET_KEY');
    if (!secret) {
      console.error('Missing STRIPE_SECRET_KEY environment variable');
      return new Response(JSON.stringify({ error: 'Missing STRIPE_SECRET_KEY' }), {
        status: 500,
        headers: { 'content-type': 'application/json', ...cors(req.headers.get('origin')) }
      });
    }

    const stripe = new Stripe(secret, { apiVersion: '2024-06-20' });

    const body = await req.json();
    const { amountCents, currency } = body;

    // Validate input
    if (!Number.isFinite(amountCents) || amountCents < 1) {
      return new Response(JSON.stringify({ error: 'Invalid amountCents' }), {
        status: 400,
        headers: { 'content-type': 'application/json', ...cors(req.headers.get('origin')) }
      });
    }

    console.log(`Creating Payment Intent: ${amountCents} ${currency || 'eur'}`);

    // Create Payment Intent
    const intent = await stripe.paymentIntents.create({
      amount: Math.floor(amountCents),
      currency: String(currency || 'eur'),
      automatic_payment_methods: { enabled: true },
      metadata: {
        source: 'M1SSION_SMOKE_TEST',
        timestamp: new Date().toISOString()
      }
    });

    console.log(`Payment Intent created: ${intent.id}`);

    return new Response(JSON.stringify({ 
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
      amount: intent.amount,
      currency: intent.currency
    }), {
      status: 200,
      headers: { 'content-type': 'application/json', ...cors(req.headers.get('origin')) }
    });

  } catch (err) {
    console.error('Stripe Payment Intent Error:', err);
    return new Response(JSON.stringify({ 
      error: (err as Error).message,
      type: 'stripe_error'
    }), {
      status: 500,
      headers: { 'content-type': 'application/json', ...cors(req.headers.get('origin')) }
    });
  }
});