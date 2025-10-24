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
 * Supports wildcard patterns like *.lovable.app
 */
function getCorsHeaders(origin: string | null): Record<string, string> {
  const originsStr = Deno.env.get('CORS_ORIGINS') ?? '*';
  const origins = originsStr.split(',').map(o => o.trim()).filter(Boolean);
  
  let allowOrigin = '*';
  let matched = false;
  
  if (origin && origins.length > 0) {
    try {
      const originUrl = new URL(origin);
      const originHost = originUrl.host;
      
      matched = origins.some(pattern => {
        if (pattern === '*') return true;
        
        try {
          const patternUrl = new URL(pattern);
          const patternHost = patternUrl.host;
          
          // Wildcard matching: *.lovable.app
          if (patternHost.startsWith('*.')) {
            const rootDomain = patternHost.slice(2);
            return originHost === rootDomain || originHost.endsWith('.' + rootDomain);
          }
          
          // Exact match
          return originHost === patternHost;
        } catch {
          return false;
        }
      });
      
      allowOrigin = matched ? origin : '*';
    } catch {
      allowOrigin = '*';
    }
  }
  
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey, x-requested-with',
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
 * Check if user is in admin whitelist (by email or user_id)
 * Supports both email and UUID formats
 */
export function checkAdminWhitelist(userEmail: string | undefined, userId?: string): {
  ok: boolean;
  error?: string;
} {
  const whitelistStr = Deno.env.get('ADMIN_WHITELIST') ?? '';
  
  if (!whitelistStr || whitelistStr.trim() === '') {
    console.error('[Auth] ❌ ADMIN_WHITELIST is empty or not set');
    console.error('[Auth] Please configure ADMIN_WHITELIST secret in Supabase Edge Functions');
    console.error('[Auth] Format: "email1@domain.com,user-id-uuid,email2@domain.com"');
    return { ok: false, error: 'Admin whitelist not configured' };
  }
  
  const whitelist = whitelistStr
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
  
  console.log('[Auth] 🔐 Whitelist loaded:', whitelist.length, 'entries');
  
  if (whitelist.length === 0) {
    console.error('[Auth] ❌ ADMIN_WHITELIST parsed to 0 entries');
    return { ok: false, error: 'Admin whitelist empty after parsing' };
  }
  
  // Check email
  if (userEmail) {
    const normalizedEmail = userEmail.toLowerCase().trim();
    if (whitelist.includes(normalizedEmail)) {
      console.log('[Auth] ✅ User authorized by email:', normalizedEmail);
      return { ok: true };
    }
  }
  
  // Check user_id (UUID format)
  if (userId) {
    const normalizedId = userId.toLowerCase().trim();
    if (whitelist.includes(normalizedId)) {
      console.log('[Auth] ✅ User authorized by ID:', normalizedId);
      return { ok: true };
    }
  }
  
  console.error('[Auth] ❌ User not in whitelist:', { email: userEmail, id: userId });
  return { ok: false, error: 'Not in admin whitelist' };
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
    
    // Check whitelist (email or user_id)
    const { ok: isAdmin, error: whitelistError } = checkAdminWhitelist(user.email, user.id);
    if (!isAdmin) {
      return respondJson(403, {
        ok: false,
        code: 'ADMIN_REQUIRED',
        hint: whitelistError || 'Not in admin whitelist',
        debug: {
          user_email: user.email,
          user_id: user.id,
          whitelist_env_set: !!Deno.env.get('ADMIN_WHITELIST')
        }
      }, origin);
    }
    
    // Call handler
    return handler(req, user, { origin });
  };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
