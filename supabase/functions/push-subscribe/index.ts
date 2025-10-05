/*
 * M1SSION™ Push Subscribe
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    'https://m1ssion.eu',
    /^https:\/\/.*\.m1ssion\.pages\.dev$/,
    /^https:\/\/.*\.lovable\.dev$/,
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
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin'
  };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json();
    const { endpoint, p256dh, auth, ua } = body;

    if (!endpoint || !p256dh || !auth) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: endpoint, p256dh, auth' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create authenticated client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      {
        global: {
          headers: { Authorization: authHeader }
        }
      }
    );

    // Get user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('[PUSH-SUBSCRIBE] Auth error:', authError);
      return new Response(JSON.stringify({ 
        error: 'Unauthorized',
        details: authError?.message 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Detect platform from user agent
    let platform = 'web';
    if (ua) {
      if (/iphone|ipod|ipad/i.test(ua)) platform = 'ios';
      else if (/android/i.test(ua)) platform = 'android';
    }

    // Save to webpush_subscriptions
    const { data, error } = await supabase
      .from('webpush_subscriptions')
      .upsert({
        user_id: user.id,
        endpoint,
        keys: { p256dh, auth },
        device_info: { ua, platform },
        is_active: true,
        last_used_at: new Date().toISOString()
      }, {
        onConflict: 'endpoint'
      })
      .select()
      .single();

    if (error) {
      console.error('[PUSH-SUBSCRIBE] Database error:', error);
      return new Response(JSON.stringify({ 
        error: 'Database save failed',
        details: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`[PUSH-SUBSCRIBE] ✅ Saved subscription for user ${user.id} (${platform})`);

    return new Response(JSON.stringify({
      success: true,
      subscription: {
        id: data.id,
        endpoint: endpoint.substring(0, 50) + '...',
        platform
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[PUSH-SUBSCRIBE] Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
