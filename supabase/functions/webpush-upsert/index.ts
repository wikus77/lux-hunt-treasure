// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const ALLOW_ORIGIN = ["https://m1ssion.eu", "https://lovable.dev", "https://2716f91b-957c-47ba-91e0-6f572f3ce00d.lovableproject.com"];

function corsHeaders(origin: string | null) {
  const allow = ALLOW_ORIGIN.some(allowed => origin?.includes(allowed.replace('https://', ''))) ? origin! : ALLOW_ORIGIN[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };
}

function detectProvider(endpoint: string): string {
  try {
    const host = new URL(endpoint).hostname;
    if (host.includes('web.push.apple.com')) return 'apns';
    if (host.includes('fcm.googleapis.com')) return 'fcm';
    if (host.includes('updates.push.services.mozilla.com')) return 'mozilla';
    return 'unknown';
  } catch {
    return 'unknown';
  }
}

type UpsertRequest = {
  user_id: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  platform?: string;
  provider?: string;
};

serve(async (req) => {
  console.log('📡 [WEBPUSH-UPSERT] Request:', req.method, req.url);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders(req.headers.get("Origin")), status: 204 });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      headers: { "content-type": "application/json", ...corsHeaders(req.headers.get("Origin")) },
      status: 405,
    });
  }

  try {
    const body: UpsertRequest = await req.json();
    const { user_id, endpoint, keys, platform, provider } = body;

    // Validation
    if (!user_id || !endpoint || !keys?.p256dh || !keys?.auth) {
      return new Response(JSON.stringify({ 
        error: "Missing required fields",
        required: ["user_id", "endpoint", "keys.p256dh", "keys.auth"]
      }), {
        headers: { "content-type": "application/json", ...corsHeaders(req.headers.get("Origin")) },
        status: 400,
      });
    }

    // Detect provider from endpoint if not provided
    const detectedProvider = provider || detectProvider(endpoint);
    const endpointHost = new URL(endpoint).hostname;

    console.log('📡 [WEBPUSH-UPSERT] Processing subscription:', {
      user_id,
      endpointHost,
      platform: platform || 'unknown',
      provider: detectedProvider,
      p256dhLen: keys.p256dh?.length || 0,
      authLen: keys.auth?.length || 0
    });

    // Initialize Supabase with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Upsert subscription to webpush_subscriptions table
    const { data, error } = await supabase
      .from('webpush_subscriptions')
      .upsert({
        user_id,
        endpoint,
        keys: {
          p256dh: keys.p256dh,
          auth: keys.auth
        },
        p256dh: keys.p256dh,
        auth: keys.auth,
        platform: platform || 'unknown',
        provider: detectedProvider,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('❌ [WEBPUSH-UPSERT] Database error:', error);
      return new Response(JSON.stringify({ 
        error: "Database error",
        details: error.message 
      }), {
        headers: { "content-type": "application/json", ...corsHeaders(req.headers.get("Origin")) },
        status: 500,
      });
    }

    console.log('✅ [WEBPUSH-UPSERT] Subscription upserted successfully');

    return new Response(JSON.stringify({ 
      success: true,
      subscription: data
    }), {
      headers: { "content-type": "application/json", ...corsHeaders(req.headers.get("Origin")) },
      status: 200,
    });

  } catch (e: any) {
    console.error('❌ [WEBPUSH-UPSERT] Error:', e.message);
    
    return new Response(JSON.stringify({
      error: e.message ?? String(e),
    }), {
      headers: { "content-type": "application/json", ...corsHeaders(req.headers.get("Origin")) },
      status: 500,
    });
  }
});