// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Shared CORS utilities for Norah edge functions

export const ALLOW_HEADERS =
  'authorization,apikey,x-client-info,content-type,x-norah-cid';

function corsHeaders(req: Request) {
  // Prendi l'origin del client (preview/prod) e varia la cache per origin
  const origin = req.headers.get('origin') ?? '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': ALLOW_HEADERS,
    // Non usiamo cookie/credentials: NON settare Allow-Credentials
  };
}

export function preflight(req: Request): Response | null {
  if (req.method !== 'OPTIONS') return null;
  return new Response(null, { status: 204, headers: corsHeaders(req) });
}

export function json(req: Request, body: unknown, status = 200): Response {
  const headers = { 'Content-Type': 'application/json', ...corsHeaders(req) };
  return new Response(JSON.stringify(body), { status, headers });
}

export function error(req: Request, message: string, status = 400): Response {
  const headers = { 'Content-Type': 'application/json', ...corsHeaders(req) };
  return new Response(JSON.stringify({ ok: false, error: message }), {
    status,
    headers,
  });
}
