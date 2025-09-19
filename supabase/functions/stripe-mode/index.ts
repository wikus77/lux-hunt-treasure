// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Stripe Mode Introspection Function - Deno compatible
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
  if (req.method === 'OPTIONS') return handleOptions(req);

  // Accept both GET and POST for flexibility with supabase.functions.invoke
  if (req.method !== 'GET' && req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json', ...corsHeaders(req) }
    });
  }

  const sk = Deno.env.get('STRIPE_SECRET_KEY') || '';
  const mode = sk.startsWith('sk_live_') ? 'live' : sk.startsWith('sk_test_') ? 'test' : 'unknown';

  return new Response(JSON.stringify({ mode }), {
    status: 200,
    headers: { 'content-type': 'application/json', ...corsHeaders(req) }
  });
});
