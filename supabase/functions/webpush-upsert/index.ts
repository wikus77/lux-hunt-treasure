/*
 * M1SSION™ Web Push Subscription Upsert
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    'https://m1ssion.eu',
    /^https:\/\/.*\.m1ssion\.pages\.dev$/,
    /^https:\/\/.*\.lovable\.dev$/
  ];
  
  let allowOrigin = 'https://m1ssion.eu';
  if (origin) {
    const isAllowed = allowedOrigins.some(allowed => 
      typeof allowed === 'string' ? allowed === origin : allowed.test(origin)
    );
    if (isAllowed) allowOrigin = origin;
  }
  
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info, x-mi-dropper-version',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin'
  };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }

  try {
    const body = await req.json();
    const { user_id, endpoint, provider, p256dh, auth, keys, platform, is_active } = body;

    // Validazione: 400 se mancano i 5 campi top-level richiesti
    if (!user_id || !endpoint || !provider || !p256dh || !auth) {
      const missing = [];
      if (!user_id) missing.push('user_id');
      if (!endpoint) missing.push('endpoint');
      if (!provider) missing.push('provider');
      if (!p256dh) missing.push('p256dh');
      if (!auth) missing.push('auth');
      
      return new Response(JSON.stringify({ 
        error: 'Missing required fields', 
        missing_fields: missing 
      }), {
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Auth: JWT utente (Bearer token)
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      {
        global: { headers: { Authorization: authHeader } }
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user || user.id !== user_id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Upsert subscription
    const { data, error } = await supabase
      .from('webpush_subscriptions')
      .upsert({
        user_id,
        endpoint,
        provider,
        p256dh,
        auth,
        keys: keys || { p256dh, auth },
        platform: platform || 'desktop',
        is_active: is_active !== undefined ? is_active : true,
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'user_id,endpoint' 
      })
      .select()
      .single();

    if (error) {
      console.error('[WEBPUSH-UPSERT] Database error:', error);
      return new Response(JSON.stringify({ 
        error: 'Database error: ' + error.message 
      }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    return new Response(JSON.stringify({
      ok: true,
      id: data.id,
      endpoint: data.endpoint,
      provider: data.provider
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[WEBPUSH-UPSERT] Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});