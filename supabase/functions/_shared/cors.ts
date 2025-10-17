// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Universal CORS middleware — safe for Deno Edge

export function corsHeaders(req?: Request) {
  const origin = req?.headers?.get('origin') ?? '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-norah-cid',
    'Vary': 'Origin',
  };
}

export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: { ...corsHeaders(req) },
    });
  }
  return null;
}

// Alias for backward compatibility
export const preflight = handleCors;

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
