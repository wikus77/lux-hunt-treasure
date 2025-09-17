// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Stripe Mode Introspection Function - Deno compatible
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const ALLOW = new Set([
  'https://m1ssion.eu',
  'https://www.m1ssion.eu',
  'https://production.m1ssion-pwa.pages.dev',
  'http://localhost:5173',
  'http://localhost:3000'
]);

function isValidOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (ALLOW.has(origin)) return true;
  // Allow any *.pages.dev domain containing m1ssion-pwa
  return origin.endsWith('.pages.dev') && origin.includes('m1ssion-pwa');
}

function cors(origin: string | null) {
  const validOrigin = isValidOrigin(origin) ? origin : '*';
  return {
    'Access-Control-Allow-Origin': validOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors(req.headers.get('origin')) });
  }

  // Accept both GET and POST for flexibility with supabase.functions.invoke
  if (req.method !== 'GET' && req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json', ...cors(req.headers.get('origin')) }
    });
  }

  const sk = Deno.env.get('STRIPE_SECRET_KEY') || '';
  const mode = sk.startsWith('sk_live_') ? 'live' : sk.startsWith('sk_test_') ? 'test' : 'unknown';

  return new Response(JSON.stringify({ mode }), {
    status: 200,
    headers: { 'content-type': 'application/json', ...cors(req.headers.get('origin')) }
  });
});
