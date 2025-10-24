// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Edge Functions Shared Helpers - Auth, CORS, Broadcast

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

export function corsHeadersFromEnv() {
  const origins = (Deno.env.get('CORS_ORIGINS') ?? '').split(',').map(s => s.trim()).filter(Boolean);
  return (origin: string | null) => {
    let allowOrigin = '*';
    
    if (origin && origins.length > 0) {
      try {
        const originUrl = new URL(origin);
        const originHost = originUrl.host;
        
        const matched = origins.some(pattern => {
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
      'Vary': 'Origin',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Max-Age': '86400',
    };
  };
}

export function withCors(handler: (req: Request, ctx: { origin: string | null }) => Promise<Response>) {
  return async (req: Request) => {
    const origin = req.headers.get('Origin');
    const headers = corsHeadersFromEnv()(origin);
    
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }
    
    const res = await handler(req, { origin });
    Object.entries(headers).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  };
}

export async function getUserFromAuthHeader(req: Request, supabaseUrl: string, anonKey: string) {
  const auth = req.headers.get('Authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  
  if (!token) {
    return { user: null, error: 'missing_bearer' };
  }

  const supabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    return { user: null, error: error.message };
  }
  
  return { user: data.user, error: null };
}

export function ensureAdmin(userEmail: string | undefined, userId?: string) {
  const raw = Deno.env.get('ADMIN_WHITELIST') ?? '';
  
  if (!raw || raw.trim() === '') {
    console.error('[Auth] ❌ ADMIN_WHITELIST is empty or not set');
    console.error('[Auth] Format: "email1@domain.com,user-id-uuid,email2@domain.com"');
    return { ok: false as const, error: 'Admin whitelist not configured' };
  }
  
  const list = raw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  
  console.log('[Auth] 🔐 Whitelist loaded:', list.length, 'entries');
  
  if (list.length === 0) {
    console.error('[Auth] ❌ ADMIN_WHITELIST parsed to 0 entries');
    return { ok: false as const, error: 'Admin whitelist empty after parsing' };
  }
  
  // Check email
  if (userEmail && list.includes(userEmail.toLowerCase())) {
    console.log('[Auth] ✅ User authorized by email:', userEmail);
    return { ok: true as const };
  }
  
  // Check user_id (UUID format)
  if (userId && list.includes(userId.toLowerCase())) {
    console.log('[Auth] ✅ User authorized by ID:', userId);
    return { ok: true as const };
  }
  
  console.error('[Auth] ❌ User not in whitelist:', { email: userEmail, id: userId });
  return { ok: false as const, error: 'Not in admin whitelist' };
}

export function supaService() {
  const url = Deno.env.get('SUPABASE_URL')!;
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(url, key, { 
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

export async function broadcast(channelName: string, payload: unknown) {
  const supabase = supaService();
  const ch = supabase.channel(channelName);
  
  await ch.subscribe();
  await ch.send({ 
    type: 'broadcast', 
    event: 'ritual-phase', 
    payload 
  });
  
  await supabase.removeChannel(ch);
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
