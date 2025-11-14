// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Universal CORS middleware — Deno-safe, NO null body on 204

export function corsHeaders(origin: string | null) {
  const o = origin ?? '*';
  return new Headers({
    'Access-Control-Allow-Origin': o,
    'Vary': 'Origin',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'POST,GET,OPTIONS',
    'Access-Control-Allow-Headers': 'authorization,apikey,content-type,x-client-info',
    'Access-Control-Max-Age': '86400'
  });
}

export function handleOptions(req: Request): Response {
  // 204 NO CONTENT - MUST have null body
  return new Response(null, { 
    status: 204, 
    headers: corsHeaders(req.headers.get('origin')) 
  });
}

export async function withCors(req: Request, run: () => Promise<Response>): Promise<Response> {
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return handleOptions(req);
  }
  
  // Execute handler and merge CORS headers
  const res = await run();
  const h = corsHeaders(req.headers.get('origin'));
  h.forEach((v, k) => res.headers.set(k, v));
  return res;
}

// Helper response builders with CORS
export function ok(origin: string | null, body: unknown): Response {
  const headers = corsHeaders(origin);
  headers.set('Content-Type', 'application/json');
  return new Response(JSON.stringify(body), { status: 200, headers });
}

export function err(origin: string | null, status: number, code: string, hint?: string): Response {
  const headers = corsHeaders(origin);
  headers.set('Content-Type', 'application/json');
  return new Response(JSON.stringify({ ok: false, code, hint }), { status, headers });
}

// Legacy helpers for backward compatibility
export const preflight = handleOptions;

export function json(origin: string | null, body: unknown, status = 200): Response {
  const headers = corsHeaders(origin);
  headers.set('Content-Type', 'application/json');
  return new Response(JSON.stringify(body), { status, headers });
}

export function error(origin: string | null, message: string, status = 400): Response {
  const headers = corsHeaders(origin);
  headers.set('Content-Type', 'application/json');
  return new Response(JSON.stringify({ ok: false, error: message }), { status, headers });
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
