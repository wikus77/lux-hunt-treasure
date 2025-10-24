// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Edge Functions Shared Helpers - Auth, CORS, Broadcast

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

export function corsHeadersFromEnv() {
  const origins = (Deno.env.get('CORS_ORIGINS') ?? '').split(',').map(s => s.trim()).filter(Boolean);
  return (origin: string | null) => {
    const allow = origin && origins.some(o =>
      o === origin || (o.includes('*') && origin.endsWith(o.replace('*.', '')))
    );
    return {
      'Access-Control-Allow-Origin': allow ? origin! : (origins[0] ?? '*'),
      'Vary': 'Origin',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };
  };
}

export function withCors(handler: (req: Request, ctx: { origin: string | null }) => Promise<Response>) {
  return async (req: Request) => {
    const origin = req.headers.get('Origin');
    const headers = corsHeadersFromEnv()(origin);
    
    if (req.method === 'OPTIONS') {
      return new Response('ok', { status: 200, headers });
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

export function ensureAdmin(userEmail: string | undefined) {
  const raw = Deno.env.get('ADMIN_WHITELIST') ?? '';
  const list = raw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  
  if (!userEmail || !list.includes(userEmail.toLowerCase())) {
    return { ok: false as const, error: 'Admin whitelist required' };
  }
  
  return { ok: true as const };
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
