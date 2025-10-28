/*
 * M1SSION™ Web Push Subscription Upsert - Hardened Version
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    'https://m1ssion.eu',
    /^https:\/\/.*\.m1ssion\.pages\.dev$/,
    /^https:\/\/.*\.lovable\.dev$/,
    /^https:\/\/.*\.lovableproject\.com$/,
    /^http:\/\/localhost(:\d+)?$/
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
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
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
    // Parse body with error handling
    let body: any;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('[WEBPUSH-UPSERT] Body parse error:', parseError);
      return new Response(JSON.stringify({ 
        error: 'Invalid JSON body',
        reason: 'body_parse_error'
      }), {
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Extract fields tolerantly (support both flat and nested formats)
    const { provider, endpoint } = body;
    const ua = body.ua ?? body.device_info?.ua ?? body.user_agent ?? null;
    const platform = body.platform ?? body.device_info?.platform ?? null;
    const p256dh = body?.p256dh ?? body?.keys?.p256dh;
    const auth   = body?.auth   ?? body?.keys?.auth;

    // Validation: user_id (from body or will be extracted from JWT)
    // provider, endpoint, p256dh, auth are required
    const validProvider = provider || 'webpush';
    if (validProvider !== 'webpush') {
      return new Response(JSON.stringify({ 
        error: 'Invalid provider. Must be "webpush"',
        reason: 'invalid_provider'
      }), {
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!endpoint || typeof endpoint !== 'string') {
      return new Response(JSON.stringify({ 
        error: 'Missing or invalid endpoint',
        reason: 'missing_endpoint'
      }), {
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!p256dh || !auth) {
      return new Response(JSON.stringify({ 
        error: 'Missing required keys fields',
        missing_fields: [!p256dh && 'p256dh', !auth && 'auth'].filter(Boolean),
        reason: 'missing_fields'
      }), {
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Auth: JWT required
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ 
        error: 'Unauthorized',
        reason: 'missing_or_invalid_jwt'
      }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const token = authHeader.substring(7);

    // Create Supabase client with service role to bypass RLS for getUser
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SERVICE_ROLE_KEY')!
    );

    // Validate user token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('[WEBPUSH-UPSERT] Auth error:', userError);
      return new Response(JSON.stringify({ 
        error: 'Unauthorized',
        reason: 'invalid_jwt',
        details: userError?.message
      }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const userId = user.id;
    const endpointTail = endpoint.substring(endpoint.length - 12);

    console.log('[WEBPUSH-UPSERT]', {
      hasAuth: true,
      userId,
      endpointTail,
      provider: validProvider,
      platform: platform || 'web'
    });

    // Prepare keys JSONB
    const keysJsonb = { p256dh, auth };
    
    // Prepare device_info JSONB
    const deviceInfoJsonb = {
      provider: validProvider,
      platform: platform || 'web',
      ua: ua || req.headers.get('user-agent') || 'unknown'
    };

    // Upsert subscription using JSONB for keys
    const { data, error } = await supabase
      .from('webpush_subscriptions')
      .upsert({
        user_id: userId,
        endpoint: endpoint,
        keys: keysJsonb,
        device_info: deviceInfoJsonb,
        is_active: true,
        last_used_at: new Date().toISOString()
      }, { 
        onConflict: 'endpoint' 
      })
      .select()
      .single();

    if (error) {
      console.error('[WEBPUSH-UPSERT] Database error:', error);
      return new Response(JSON.stringify({ 
        error: 'Database error',
        reason: 'database_error',
        details: error.message 
      }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // M1SSION™ Soft-cleanup: deactivate other endpoints for same user+platform
    try {
      const { error: cleanupError } = await supabase
        .from('webpush_subscriptions')
        .update({ 
          is_active: false, 
          updated_at: new Date().toISOString() 
        })
        .eq('user_id', userId)
        .eq('is_active', true)
        .neq('endpoint', endpoint)
        .ilike('device_info->>platform', platform || 'web');

      if (cleanupError) {
        console.warn('[WEBPUSH-UPSERT] Soft-cleanup warning (non-critical):', cleanupError.message);
      } else {
        console.log('[WEBPUSH-UPSERT] ✅ Soft-cleanup completed for user+platform');
      }
    } catch (cleanupErr) {
      // Non-critical: log and continue
      console.warn('[WEBPUSH-UPSERT] Soft-cleanup exception (non-critical):', cleanupErr);
    }

    return new Response(JSON.stringify({
      ok: true,
      upserted: {
        endpoint_tail: endpointTail,
        user_id: userId,
        provider: validProvider
      },
      mode: 'jsonb_keys',
      id: data?.id
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[WEBPUSH-UPSERT] Unexpected error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      reason: 'internal_error'
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
