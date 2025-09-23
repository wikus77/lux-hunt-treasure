// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

serve(async (req) => {
  const origin = req.headers.get('origin');
  const headers = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({
        error: 'Method not allowed'
      }),
      { status: 405, headers: { ...headers, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Get Stripe mode from secret key
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    
    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({
          error: 'Stripe configuration error'
        }),
        { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    const mode = stripeSecretKey.startsWith('sk_live_') ? 'live' : 'test';

    return new Response(
      JSON.stringify({ mode }),
      { 
        status: 200, 
        headers: { ...headers, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error getting Stripe mode:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Internal server error'
      }),
      { 
        status: 500, 
        headers: { ...headers, 'Content-Type': 'application/json' } 
      }
    );
  }
});