// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import webpush from "npm:web-push@3.6.7";

const ALLOW_ORIGIN = ["https://m1ssion.eu", "https://lovable.dev", "https://2716f91b-957c-47ba-91e0-6f572f3ce00d.lovableproject.com"];

function corsHeaders(origin: string | null) {
  const allow = ALLOW_ORIGIN.some(allowed => origin?.includes(allowed.replace('https://', ''))) ? origin! : ALLOW_ORIGIN[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

function normalizeSubscription(sub: InputSubscription): NormalizedSubscription {
  const endpoint = sub.endpoint;
  const vendorHost = new URL(endpoint).hostname;
  
  // Handle both formats: {keys:{p256dh,auth}} and {p256dh,auth}
  const p256dh = sub.keys?.p256dh || sub.p256dh;
  const auth = sub.keys?.auth || sub.auth;
  
  if (!p256dh || !auth) {
    throw new Error(`Missing keys: p256dh=${!!p256dh}, auth=${!!auth}`);
  }
  
  const detectedProvider = detectProvider(endpoint);
  const provider = sub.provider || detectedProvider;
  
  return {
    endpoint,
    keys: { p256dh, auth },
    provider,
    vendorHost
  };
}

serve(async (req) => {
  console.log('📡 [WEBPUSH-SEND] Request received:', req.method, req.url);
  console.log('📡 [WEBPUSH-SEND] Origin:', req.headers.get("Origin"));
  
  // Handle healthcheck endpoint
  if (req.method === "GET" && new URL(req.url).pathname.endsWith('/health')) {
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    return new Response(JSON.stringify({
      ok: true,
      vapidPublicKeyPresent: !!vapidPublicKey
    }), {
      headers: { "content-type": "application/json", ...corsHeaders(req.headers.get("Origin")) },
      status: 200,
    });
  }
  
  if (req.method === "OPTIONS") {
    console.log('📡 [WEBPUSH-SEND] Handling OPTIONS preflight request');
    return new Response(null, { headers: corsHeaders(req.headers.get("Origin")), status: 204 });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      headers: { "content-type": "application/json", ...corsHeaders(req.headers.get("Origin")) },
      status: 405,
    });
  }

  try {
    const requestBody: RequestBody = await req.json();
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

    // Check VAPID keys
    const vapidPublic = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivate = Deno.env.get("VAPID_PRIVATE_KEY");
    const vapidContact = Deno.env.get("WEBPUSH_CONTACT_EMAIL") || "mailto:contact@m1ssion.eu";
    
    console.log('🔑 [WEBPUSH-SEND] VAPID keys status:', {
      hasPublic: !!vapidPublic,
      hasPrivate: !!vapidPrivate,
      contact: vapidContact
    });
    
    if (!vapidPublic || !vapidPrivate) {
      console.error('❌ [WEBPUSH-SEND] Missing VAPID keys - cannot proceed');
      return new Response(JSON.stringify({ error: "Missing VAPID keys" }), {
        headers: { "content-type": "application/json", ...corsHeaders(req.headers.get("Origin")) },
        status: 500,
      });
    }

    // Set VAPID details
    webpush.setVapidDetails(vapidContact, vapidPublic, vapidPrivate);

    let normalizedSubs: NormalizedSubscription[] = [];

    // Handle user_ids format - fetch from database
    if (user_ids && user_ids.length > 0) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      console.log('🔍 [WEBPUSH-SEND] Fetching subscriptions for user_ids:', user_ids);
      
      const { data: dbSubs, error: dbError } = await supabase
        .from('push_subscriptions')
        .select('endpoint, p256dh, auth, platform')
        .in('user_id', user_ids)
        .eq('is_active', true);

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
          try {
            const normalized = normalizeSubscription({
              endpoint: dbSub.endpoint,
              p256dh: dbSub.p256dh,
              auth: dbSub.auth,
              provider: dbSub.platform
            });
            normalizedSubs.push(normalized);
          } catch (e) {
            console.error(`❌ [WEBPUSH-SEND] Failed to normalize DB subscription: ${e.message}`);
          }
        }
      }
    }

    // Handle subscriptions format - direct input
    if (subscriptions && subscriptions.length > 0) {
      console.log(`🔍 [WEBPUSH-SEND] Processing ${subscriptions.length} direct subscriptions`);
      
      for (const sub of subscriptions) {
        try {
          const normalized = normalizeSubscription(sub);
          console.log('📡 [WEBPUSH-SEND] Subscription details:', {
            endpointHost: normalized.vendorHost,
            hasP256dh: !!normalized.keys.p256dh,
            hasAuth: !!normalized.keys.auth,
            p256dhLength: normalized.keys.p256dh?.length,
            authLength: normalized.keys.auth?.length,
            resolvedProvider: normalized.provider
          });
          normalizedSubs.push(normalized);
        } catch (e) {
          console.error(`❌ [WEBPUSH-SEND] Failed to normalize subscription: ${e.message}`);
          return new Response(JSON.stringify({ 
            error: `Invalid subscription payload: ${e.message}` 
          }), {
            headers: { "content-type": "application/json", ...corsHeaders(req.headers.get("Origin")) },
            status: 400,
          });
        }
      }
    }

    if (normalizedSubs.length === 0) {
      return new Response(JSON.stringify({ error: "No valid subscriptions found" }), {
        headers: { "content-type": "application/json", ...corsHeaders(req.headers.get("Origin")) },
        status: 400,
      });
    }

    // Build notification payload
    const notificationPayload = JSON.stringify({
      title: payload.title || "M1SSION™",
      body: payload.body || "New notification",
      data: { url: payload.url || "/" },
      icon: "/favicon.ico",
      badge: "/favicon.ico",
    });

    console.log('📦 [WEBPUSH-SEND] Final payload:', notificationPayload);

    // Send notifications
    const results = [];
    for (const sub of normalizedSubs) {
      try {
        console.log(`🚀 [WEBPUSH-SEND] Sending to:`, sub.vendorHost, `(${sub.provider})`);
        
        const res = await webpush.sendNotification(sub as any, notificationPayload);
        
        console.log(`✅ [WEBPUSH-SEND] Success:`, sub.vendorHost, 'Status:', res.statusCode);
        results.push({
          endpoint: sub.endpoint.substring(0, 50) + '...',
          success: true,
          status: res.statusCode,
          provider: sub.provider
        });
      } catch (e: any) {
        console.error(`❌ [WEBPUSH-SEND] Failed for ${sub.vendorHost}:`, e.message);
        results.push({
          endpoint: sub.endpoint.substring(0, 50) + '...',
          success: false,
          error: e.message,
          status: e.statusCode || 500,
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
    console.error('❌ [WEBPUSH-SEND] Detailed error analysis:');
    console.error('❌ [WEBPUSH-SEND] Error type:', e.constructor.name);
    console.error('❌ [WEBPUSH-SEND] Error message:', e.message);
    console.error('❌ [WEBPUSH-SEND] Error stack:', e.stack);
    
    const errorResponse = {
      error: e.message ?? String(e),
      statusCode: e.statusCode,
      body: e.body,
      headers: e.headers,
    };
    
    return new Response(JSON.stringify(errorResponse), {
      headers: { "content-type": "application/json", ...corsHeaders(req.headers.get("Origin")) },
      status: 500,
    });
  }
});