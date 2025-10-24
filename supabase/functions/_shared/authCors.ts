/**
 * Shared Auth & CORS Middleware for Edge Functions
 * Handles JWT validation, admin whitelist, and CORS preflight
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

interface CorsOptions {
  origin: string | null;
}

/**
 * Get CORS headers from CORS_ORIGINS environment variable
 */
function getCorsHeaders(origin: string | null): Record<string, string> {
  const originsStr = Deno.env.get('CORS_ORIGINS') ?? '*';
  const origins = originsStr.split(',').map(o => o.trim()).filter(Boolean);
  
  let allowOrigin = '*';
  
  if (origin && origins.length > 0) {
    // Check if origin matches any allowed origin (supports wildcards)
    const matched = origins.some(o => {
      if (o === '*') return true;
      if (o.includes('*')) {
        const pattern = o.replace('*.', '');
        return origin.endsWith(pattern);
      }
      return o === origin;
    });
    
    if (matched) {
      allowOrigin = origin;
    } else {
      allowOrigin = origins[0] || '*';
    }
  }
  
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
    'Content-Type': 'application/json'
  };
}

/**
 * Handle OPTIONS preflight request
 */
export function handleOptions(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    const origin = req.headers.get('Origin');
    return new Response(null, { 
      status: 204,
      headers: getCorsHeaders(origin)
    });
  }
  return null;
}

/**
 * Response builder with CORS headers
 */
export function respondJson(
  status: number, 
  body: unknown, 
  origin: string | null = null
): Response {
  const headers = getCorsHeaders(origin);
  return new Response(JSON.stringify(body), { status, headers });
}

/**
 * Extract and validate JWT from Authorization header
 */
export async function validateAuth(req: Request): Promise<{
  user: any | null;
  error: string | null;
}> {
  const authHeader = req.headers.get('Authorization') ?? '';
  
  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    return { user: null, error: 'Missing Bearer token' };
  }
  
  const token = authHeader.slice(7).trim();
  
  if (!token) {
    return { user: null, error: 'Empty token' };
  }
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  
  const supabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { 
      persistSession: false, 
      autoRefreshToken: false, 
      detectSessionInUrl: false 
    }
  });
  
  const { data, error } = await supabase.auth.getUser();
  
  if (error || !data?.user) {
    return { user: null, error: error?.message || 'Invalid token' };
  }
  
  return { user: data.user, error: null };
}

/**
 * Check if user email is in admin whitelist
 */
export function checkAdminWhitelist(userEmail: string | undefined): {
  ok: boolean;
  error?: string;
} {
  if (!userEmail) {
    return { ok: false, error: 'No email provided' };
  }
  
  const whitelistStr = Deno.env.get('ADMIN_WHITELIST') ?? '';
  const whitelist = whitelistStr
    .toLowerCase()
    .split(',')
    .map(e => e.trim())
    .filter(Boolean);
  
  if (whitelist.length === 0) {
    console.warn('[Auth] ADMIN_WHITELIST is empty or not set');
    return { ok: false, error: 'Admin whitelist not configured' };
  }
  
  const normalizedEmail = userEmail.toLowerCase().trim();
  
  if (!whitelist.includes(normalizedEmail)) {
    console.log('[Auth] User not in whitelist:', userEmail);
    return { ok: false, error: 'Not in admin whitelist' };
  }
  
  return { ok: true };
}

/**
 * Middleware wrapper for auth + CORS
 */
export function withAuthCors(
  handler: (req: Request, user: any, opts: CorsOptions) => Promise<Response>
) {
  return async (req: Request): Promise<Response> => {
    const origin = req.headers.get('Origin');
    
    // Handle OPTIONS
    const optionsRes = handleOptions(req);
    if (optionsRes) return optionsRes;
    
    // Validate auth
    const { user, error: authError } = await validateAuth(req);
    if (authError || !user) {
      return respondJson(401, {
        ok: false,
        code: 'AUTH_MISSING',
        hint: authError || 'Authentication required'
      }, origin);
    }
    
    // Check whitelist
    const { ok: isAdmin, error: whitelistError } = checkAdminWhitelist(user.email);
    if (!isAdmin) {
      return respondJson(403, {
        ok: false,
        code: 'ADMIN_REQUIRED',
        hint: whitelistError || 'Not in admin whitelist'
      }, origin);
    }
    
    // Call handler
    return handler(req, user, { origin });
  };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
