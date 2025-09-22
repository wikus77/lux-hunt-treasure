// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { generateVapidJWT } from "../_shared/vapid.ts";
import { buildPushHeaders } from "../_shared/pushHeaders.ts";

const ALLOW_ORIGIN = ["https://m1ssion.eu", "https://lovable.dev", "https://2716f91b-957c-47ba-91e0-6f572f3ce00d.lovableproject.com"];

function corsHeaders(origin: string | null) {
  // Allow localhost in dev and production origins
  const isDev = origin?.includes('localhost') || origin?.includes('127.0.0.1');
  const isAllowed = ALLOW_ORIGIN.some(allowed => origin?.includes(allowed.replace('https://', '')));
  
  const allow = (isDev || isAllowed) ? origin! : ALLOW_ORIGIN[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "authorization, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };
}

type NormalizedSubscription = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  provider: string;
  vendorHost: string;
};

type InputSubscription = {
  endpoint: string;
  keys?: { p256dh: string; auth: string };
  p256dh?: string;
  auth?: string;
  provider?: string;
};

type RequestBody = {
  user_ids?: string[];
  subscriptions?: InputSubscription[];
  payload: {
    title?: string;
    body?: string;
    url?: string;
  };
};

function detectProvider(endpoint: string): string {
  const host = new URL(endpoint).hostname;
  if (host.includes('fcm.googleapis.com')) return 'fcm';
  if (host.includes('updates.push.services.mozilla.com')) return 'mozilla';
  if (host.includes('web.push.apple.com')) return 'apns';
  return 'unknown';
}

function normalizeSubscription(sub: InputSubscription): NormalizedSubscription | null {
  if (!sub?.endpoint) return null;
  
  try {
    const endpoint = sub.endpoint;
    const vendorHost = new URL(endpoint).hostname;
    
    // Handle both formats: {keys:{p256dh,auth}} and {p256dh,auth}
    let p256dh: string | undefined;
    let auth: string | undefined;
    
    // If sub.keys exists but fields are at top level, copy them
    if (sub.keys) {
      p256dh = sub.keys.p256dh;
      auth = sub.keys.auth;
    } else if (sub.p256dh && sub.auth) {
      // If top-level, construct keys object
      p256dh = sub.p256dh;
      auth = sub.auth;
    }
    
    if (!p256dh || !auth) {
      console.warn(`❌ [WEBPUSH-SEND] Invalid subscription - missing keys: p256dh=${!!p256dh}, auth=${!!auth}`);
      return null;
    }
    
    const detectedProvider = detectProvider(endpoint);
    const provider = sub.provider || detectedProvider;
    
    return {
      endpoint,
      keys: { p256dh, auth },
      provider,
      vendorHost
    };
  } catch (e) {
    console.warn(`❌ [WEBPUSH-SEND] Failed to normalize subscription:`, e.message);
    return null;
  }
}

// Web Crypto Web Push implementation with VAPID JWT for APNs
async function sendWebPushNotification(
  subscription: NormalizedSubscription,
  payload: string
) {
  try {
    const endpointURL = new URL(subscription.endpoint);
    const audience = `${endpointURL.protocol}//${endpointURL.hostname}`;
    
    // Get VAPID keys from environment
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
    
    if (!vapidPublicKey || !vapidPrivateKey) {
      throw new Error('VAPID keys not configured');
    }

    // Generate VAPID JWT for authentication
    const vapidJWT = await generateVapidJWT(
      audience,
      'mailto:support@m1ssion.eu',
      vapidPublicKey,
      vapidPrivateKey
    );

    // Build appropriate headers for each provider
    const headers = buildPushHeaders(endpointURL, vapidJWT, vapidPublicKey);
    
    console.log(`🔐 [WEBPUSH-SEND] Sending with VAPID to ${subscription.provider}:`, {
      audience,
      hasVapidJWT: !!vapidJWT,
      headers: Object.keys(headers)
    });

    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers,
      body: payload
    });
    
    return response;
  } catch (error) {
    console.error(`❌ [WEBPUSH-SEND] VAPID error for ${subscription.provider}:`, error);
    throw error;
  }
}

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const origin = req.headers.get("Origin");
    
    console.log('📡 [WEBPUSH-SEND] Request:', req.method, url.pathname);
    console.log('📡 [WEBPUSH-SEND] Origin:', origin);
    
    // Handle health check BEFORE any json parsing
    if (url.pathname.endsWith('/health') && req.method === 'GET') {
      const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
      const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
      return new Response(JSON.stringify({
        ok: true,
        vapidPublicKeySet: !!vapidPublicKey,
        vapidPrivateKeySet: !!vapidPrivateKey
      }), {
        headers: { "content-type": "application/json", ...corsHeaders(origin) },
        status: 200,
      });
    }

    // Handle debug endpoint BEFORE any json parsing
    if (url.pathname.endsWith('/debug') && req.method === 'GET') {
      const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
      const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
      const corsAllowedOrigin = ALLOW_ORIGIN.some(allowed => origin?.includes(allowed.replace('https://', ''))) ? origin! : ALLOW_ORIGIN[0];
      
      return new Response(JSON.stringify({
        now: new Date().toISOString(),
        env: {
          vapidPublicKeySet: !!vapidPublicKey,
          vapidPrivateKeySet: !!vapidPrivateKey
        },
        requestHeaders: Object.fromEntries(req.headers.entries()),
        corsAllowedOrigin
      }), {
        headers: { "content-type": "application/json", ...corsHeaders(origin) },
        status: 200,
      });
    }
    
    // Handle CORS preflight BEFORE any json parsing
    if (req.method === 'OPTIONS') {
      console.log('📡 [WEBPUSH-SEND] Handling OPTIONS preflight request');
      return new Response(null, { headers: corsHeaders(origin), status: 204 });
    }

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        headers: { "content-type": "application/json", ...corsHeaders(origin) },
        status: 405,
      });
    }

    // Safe JSON parsing for POST requests - ONLY ONCE
    let body: any;
    try {
      body = await req.json();
    } catch (e) {
      body = {};
      console.warn('📡 [WEBPUSH-SEND] Failed to parse JSON body:', e.message);
    }

    const requestBody: RequestBody = body;
    // Log raw first subscription for debugging
    const sample = Array.isArray(requestBody.subscriptions) ? requestBody.subscriptions[0] : null;
    console.log('[WEBPUSH-SEND] Raw first subscription:', sample);
    
    console.log('📡 [WEBPUSH-SEND] Full request body (trimmed):', JSON.stringify({
      ...requestBody,
      subscriptions: requestBody.subscriptions?.map(s => ({
        endpoint: s.endpoint?.substring(0, 50) + '...',
        hasKeys: !!s.keys,
        hasP256dh: !!(s.keys?.p256dh || s.p256dh),
        hasAuth: !!(s.keys?.auth || s.auth)
      }))
    }, null, 2));
    
    const { user_ids, subscriptions, payload } = requestBody;

    // Validate payload
    if (!payload || (!payload.title && !payload.body)) {
      return new Response(JSON.stringify({ error: "Missing or empty payload (title or body required)" }), {
        headers: { "content-type": "application/json", ...corsHeaders(req.headers.get("Origin")) },
        status: 400,
      });
    }

    let normalizedSubs: NormalizedSubscription[] = [];

    // Handle user_ids format - fetch from database
    if (user_ids && user_ids.length > 0) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      console.log('🔍 [WEBPUSH-SEND] Fetching subscriptions for user_ids:', user_ids);
      
      // Query new webpush_subscriptions table using the view for latest per user with APNs preference
      const { data: dbSubs, error: dbError } = await supabase
        .from('webpush_latest_per_user')
        .select('endpoint, keys, provider, platform, ua')
        .in('user_id', user_ids);

      if (dbError) {
        console.error('❌ [WEBPUSH-SEND] Database error:', dbError);
        return new Response(JSON.stringify({ error: "Database error fetching subscriptions" }), {
          headers: { "content-type": "application/json", ...corsHeaders(req.headers.get("Origin")) },
          status: 500,
        });
      }

      console.log(`🔍 [WEBPUSH-SEND] Found ${dbSubs?.length || 0} active subscriptions in database`);

      if (dbSubs && dbSubs.length > 0) {
        for (const dbSub of dbSubs) {
          const normalized = normalizeSubscription({
            endpoint: dbSub.endpoint,
            keys: dbSub.keys, // keys is now a jsonb object with {p256dh, auth}
            provider: dbSub.provider
          });
          if (normalized) {
            console.log('📡 [WEBPUSH-SEND] DB Subscription normalized:', {
              endpointHost: normalized.vendorHost,
              p256dhLen: normalized.keys.p256dh?.length || 0,
              authLen: normalized.keys.auth?.length || 0,
              provider: normalized.provider
            });
            normalizedSubs.push(normalized);
          }
        }
      }
    }

    // Handle subscriptions format - direct input
    if (subscriptions && subscriptions.length > 0) {
      console.log(`🔍 [WEBPUSH-SEND] Processing ${subscriptions.length} direct subscriptions`);
      
      for (const sub of subscriptions) {
        const normalized = normalizeSubscription(sub);
        if (normalized) {
          console.log('📡 [WEBPUSH-SEND] Subscription normalized:', {
            endpointHost: normalized.vendorHost,
            p256dhLen: normalized.keys.p256dh?.length || 0,
            authLen: normalized.keys.auth?.length || 0,
            provider: normalized.provider
          });
          normalizedSubs.push(normalized);
        }
      }
    }

    // Simple validation without complex schema
    if (!normalizedSubs.length) {
      return new Response(JSON.stringify({ error: 'No subscriptions' }), {
        headers: { "content-type": "application/json", ...corsHeaders(origin) },
        status: 400,
      });
    }
    
    const bad = normalizedSubs.filter(x => !x.endpoint || !(x.keys?.p256dh) || !(x.keys?.auth));
    if (bad.length) {
      return new Response(JSON.stringify({ 
        error: 'INVALID_SUBSCRIPTIONS', 
        message: 'Invalid subscription payload',
        details: bad.slice(0,1)[0],
        expectedFormat: {
          subscriptions: [
            { endpoint: "https://...", keys: { p256dh: "...", auth: "..." } },
            { endpoint: "https://...", p256dh: "...", auth: "..." }
          ]
        }
      }), {
        headers: { "content-type": "application/json", ...corsHeaders(origin) },
        status: 400,
      });
    }

    // Build notification payload with default URL if missing
    const notificationPayload = JSON.stringify({
      title: payload.title || "M1SSION™",
      body: payload.body || "New notification",
      data: { url: payload.url || "/" }, // Default to '/' if URL missing
      icon: "/favicon.ico",
      badge: "/favicon.ico",
    });

    console.log('📦 [WEBPUSH-SEND] Final payload:', notificationPayload);

    // Send notifications using Web Crypto
    const results = [];
    for (const sub of normalizedSubs) {
      try {
        const endpointHost = sub.vendorHost;
        const hasP256dh = !!sub.keys.p256dh;
        const hasAuth = !!sub.keys.auth;
        const keysAt = sub.keys ? 'object' : 'missing';
        const providerDetected = sub.provider;
        
        console.log(`🚀 [WEBPUSH-SEND] Sending to:`, {
          endpointHost,
          hasP256dh,
          hasAuth,
          keysAt,
          providerDetected
        });
        
        const res = await sendWebPushNotification(sub, notificationPayload);
        
        console.log(`✅ [WEBPUSH-SEND] Success:`, endpointHost, 'Status:', res.status);
        results.push({
          endpoint: sub.endpoint.substring(0, 50) + '...',
          success: true,
          status: res.status,
          provider: sub.provider
        });
      } catch (e: any) {
        console.error(`❌ [WEBPUSH-SEND] Failed for ${sub.vendorHost}:`, e.message);
        results.push({
          endpoint: sub.endpoint.substring(0, 50) + '...',
          success: false,
          error: e.message,
          status: e.status || 500,
          provider: sub.provider
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`📊 [WEBPUSH-SEND] Summary: ${successCount}/${results.length} notifications sent successfully`);
    
    return new Response(JSON.stringify({ 
      success: true, 
      sent: successCount,
      total: results.length,
      results 
    }), {
      headers: { "content-type": "application/json", ...corsHeaders(req.headers.get("Origin")) },
      status: 200,
    });

  } catch (e: any) {
    console.error('[WEBPUSH-SEND] FATAL', e, e?.stack);
    
    return new Response(JSON.stringify({
      error: "internal",
      message: String(e)
    }), {
      headers: { "content-type": "application/json" },
      status: 500,
    });
  }
});