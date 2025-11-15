// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Universal CORS middleware — Deno-safe, 204 preflight + full headers

const BASE_ALLOWED_HEADERS = [
  'authorization',
  'apikey',
  'content-type',
  'x-client-info',
  'x-m1-debug',
  'x-debug'
];

const ALLOWED_ORIGINS = [
  // Preview/Prod Lovable
  /\.lovableproject\.com$/i,
  /\.lovable\.app$/i,
  /\.lovable\.dev$/i,
  // Local/dev
  /^localhost$/i,
  /^127\.0\.0\.1$/i
];

function isAllowedOrigin(origin: string): boolean {
  if (!origin) return false;
  try {
    const url = new URL(origin);
    const hostname = url.hostname.toLowerCase();
    
    // Check against allowed patterns
    const allowed = ALLOWED_ORIGINS.some((pattern) => pattern.test(hostname));
    
    // Validate protocol (must be https or http for localhost)
    const validProtocol = url.protocol === 'https:' || 
                         (url.protocol === 'http:' && (hostname === 'localhost' || hostname === '127.0.0.1'));
    
    return allowed && validProtocol;
  } catch {
    return false;
  }
}

function mergeAllowHeaders(req: Request): string {
  const requestHeaders = req.headers.get('Access-Control-Request-Headers') ?? '';
  const incoming = requestHeaders
    .split(',')
    .map(h => h.trim().toLowerCase())
    .filter(Boolean);
  
  const allHeaders = new Set([...BASE_ALLOWED_HEADERS, ...incoming]);
  return Array.from(allHeaders).join(', ');
}

function buildCorsHeaders(req: Request): Headers {
  const origin = req.headers.get('Origin') ?? '';
  const headers = new Headers();
  
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', mergeAllowHeaders(req));
  headers.set('Access-Control-Allow-Credentials', 'true');
  headers.set('Access-Control-Max-Age', '600');
  headers.set('Vary', 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers');
  
  if (isAllowedOrigin(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
  }
  
  return headers;
}


export function withCors(
  handler: (req: Request) => Promise<Response> | Response
) {
  return async (req: Request): Promise<Response> => {
    const origin = req.headers.get('Origin') ?? '';
    const method = req.method;
    
    // PREFLIGHT
    if (method === 'OPTIONS') {
      const headers = buildCorsHeaders(req);
      
      // Trace minimo per debug
      console.log('[CORS] preflight ok • origin=%s • allowHeaders=%s',
        origin, headers.get('Access-Control-Allow-Headers'));
      
      return new Response(null, { status: 204, headers });
    }
    
    // HANDLER NORMALE
    try {
      const res = await handler(req);
      
      // Inietta CORS anche sulle risposte applicative
      const corsHeaders = buildCorsHeaders(req);
      const responseHeaders = new Headers(res.headers);
      
      corsHeaders.forEach((value, key) => {
        responseHeaders.set(key, value);
      });
      
      return new Response(res.body, {
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders
      });
    } catch (err: any) {
      // Error handling with CORS
      const corsHeaders = buildCorsHeaders(req);
      const errorBody = JSON.stringify({
        success: false,
        error: true,
        message: err?.message ?? 'Internal error'
      });
      
      corsHeaders.set('Content-Type', 'application/json');
      
      console.error('[CORS] Handler error:', err);
      
      return new Response(errorBody, {
        status: 500,
        headers: corsHeaders
      });
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
