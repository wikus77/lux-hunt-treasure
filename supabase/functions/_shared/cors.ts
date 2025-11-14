// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Universal CORS middleware — Deno-safe, NO null body on 204

function isAllowedOrigin(origin: string): boolean {
  try {
    const u = new URL(origin);
    const https = u.protocol === 'https:';
  const host = u.hostname.toLowerCase();
  const allowed =
    /\.lovableproject\.com$/i.test(host) ||
    /\.lovable\.app$/i.test(host) ||
    /\.lovable\.dev$/i.test(host);
  return https && allowed;
  } catch {
    return false;
  }
}

export function buildCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') ?? '';
  const acrh = req.headers.get('access-control-request-headers') ?? '';
  const allowed = isAllowedOrigin(origin);

  const h: Record<string, string> = {};
  if (allowed) {
    h['Access-Control-Allow-Origin'] = origin;      // echo, no wildcard
    h['Access-Control-Allow-Credentials'] = 'true';
    h['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    h['Access-Control-Allow-Headers'] =
      acrh || 'authorization, x-client-info, apikey, content-type, accept, origin, referer';
    h['Vary'] = 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers';
  }
  return h;
}

// Applica CORS a qualsiasi Response (successo/errore)
export function corsify(res: Response, req: Request): Response {
  const cors = buildCorsHeaders(req);
  const headers = new Headers(res.headers);
  for (const [k, v] of Object.entries(cors)) headers.set(k, v);
  return new Response(res.body, { status: res.status, headers });
}

// Wrapper universale per gestire CORS su tutte le risposte
export function withCors(
  handler: (req: Request) => Promise<Response> | Response
) {
  return async (req: Request): Promise<Response> => {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: buildCorsHeaders(req) });
    }
    try {
      const res = await handler(req);
      return corsify(res, req);
    } catch (err: any) {
      const body = JSON.stringify({ 
        success: false, 
        error: true, 
        message: err?.message ?? 'Internal error' 
      });
      return corsify(
        new Response(body, { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        }), 
        req
      );
    }
  };
}

// ============================================================================
// Legacy CORS functions (kept for backward compatibility with other edge functions)
// ============================================================================

export function corsHeaders(origin: string | null) {
  // CRITICAL FIX: Cannot use credentials with wildcard origin
  // Always use specific origin (Lovable preview/prod or custom domains)
  const allowedOrigins = [
    /^https:\/\/.*\.lovable\.app$/,
    /^https:\/\/.*\.lovableproject\.com$/,
    /^https:\/\/m1ssion\.app$/,
    /^https:\/\/.*\.vercel\.app$/,
    /^http:\/\/localhost:\d+$/
  ];
  
  let finalOrigin = '*';
  let useCredentials = false;
  
  if (origin) {
    // Check if origin matches allowed patterns
    const isAllowed = allowedOrigins.some(pattern => pattern.test(origin));
    if (isAllowed) {
      finalOrigin = origin;
      useCredentials = true;
    }
  }
  
  const headers = new Headers({
    'Access-Control-Allow-Origin': finalOrigin,
    'Access-Control-Allow-Methods': 'POST,GET,OPTIONS',
    'Access-Control-Allow-Headers': 'authorization,apikey,content-type,x-client-info',
    'Access-Control-Max-Age': '86400'
  });
  
  if (useCredentials) {
    headers.set('Access-Control-Allow-Credentials', 'true');
    headers.set('Vary', 'Origin');
  }
  
  return headers;
}

export function handleOptions(req: Request): Response {
  // 204 NO CONTENT - MUST have null body
  return new Response(null, { 
    status: 204, 
    headers: corsHeaders(req.headers.get('origin')) 
  });
}

export async function withCorsLegacy(req: Request, run: () => Promise<Response>): Promise<Response> {
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
