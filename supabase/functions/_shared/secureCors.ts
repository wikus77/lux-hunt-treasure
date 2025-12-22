// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Secure CORS Headers - Restricted to M1SSION domains only

/**
 * Allowed origins for M1SSION™
 * No wildcards for production security
 */
const ALLOWED_ORIGINS = [
  // Production
  'https://m1ssion.eu',
  'https://www.m1ssion.eu',
  'https://m1ssion.app',
  'https://www.m1ssion.app',
  // Cloudflare Pages previews
  /^https:\/\/[a-z0-9-]+\.m1ssion-launch\.pages\.dev$/,
  // Development
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:8788',
  'http://127.0.0.1:5173',
  // Capacitor apps (no origin for native)
  null,
];

/**
 * Check if origin is allowed
 */
function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true; // Allow Capacitor/native apps
  
  for (const allowed of ALLOWED_ORIGINS) {
    if (allowed === null) continue;
    if (typeof allowed === 'string' && allowed === origin) return true;
    if (allowed instanceof RegExp && allowed.test(origin)) return true;
  }
  
  return false;
}

/**
 * Get secure CORS headers
 * Never uses '*' with credentials
 */
export function getSecureCorsHeaders(origin: string | null): Record<string, string> {
  // Default headers (restricted)
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token, x-internal-secret, x-cron-secret',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
  
  if (isOriginAllowed(origin)) {
    // Set specific origin (never '*' when we need credentials)
    headers['Access-Control-Allow-Origin'] = origin || 'https://m1ssion.eu';
    headers['Access-Control-Allow-Credentials'] = 'true';
  } else {
    // For unknown origins, don't allow access
    // This will cause browser to block the request
    console.warn(`[CORS] Blocked request from unknown origin: ${origin}`);
    headers['Access-Control-Allow-Origin'] = 'https://m1ssion.eu';
  }
  
  return headers;
}

/**
 * Quick CORS headers object for simple use
 */
export const SECURE_CORS = {
  'Access-Control-Allow-Origin': 'https://m1ssion.eu',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token, x-internal-secret',
  'Access-Control-Allow-Credentials': 'true',
};

/**
 * Handle preflight OPTIONS request
 */
export function handlePreflight(req: Request): Response {
  const origin = req.headers.get('Origin');
  return new Response(null, {
    status: 204,
    headers: getSecureCorsHeaders(origin),
  });
}

/**
 * Wrapper to add secure CORS to any response
 */
export function withSecureCors(res: Response, origin: string | null): Response {
  const corsHeaders = getSecureCorsHeaders(origin);
  const newHeaders = new Headers(res.headers);
  
  Object.entries(corsHeaders).forEach(([key, value]) => {
    newHeaders.set(key, value);
  });
  
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: newHeaders,
  });
}

/**
 * 🔧 FIX: secureCors helper function for backwards compatibility
 * Takes a Request and returns CORS headers object
 */
export function secureCors(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin');
  return getSecureCorsHeaders(origin);
}


