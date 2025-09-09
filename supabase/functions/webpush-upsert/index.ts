// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const ALLOW_ORIGIN = ["https://m1ssion.eu", "https://lovable.dev", "https://2716f91b-957c-47ba-91e0-6f572f3ce00d.lovableproject.com"];

function corsHeaders(origin: string | null) {
  const allow = ALLOW_ORIGIN.some(allowed => origin?.includes(allowed.replace('https://', ''))) ? origin! : ALLOW_ORIGIN[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

serve(async (req) => {
  const origin = req.headers.get("Origin");
  console.log('💾 [WEBPUSH-UPSERT] Request received:', req.method);
  console.log('💾 [WEBPUSH-UPSERT] Origin:', origin);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders(req.headers.get("Origin")), status: 204 });
  }

  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  // Check VAPID secrets availability
  const hasVapidPub = !!Deno.env.get("VAPID_PUBLIC_KEY");
  const hasVapidPriv = !!Deno.env.get("VAPID_PRIVATE_KEY");
  const hasVapidSubject = !!Deno.env.get("VAPID_SUBJECT");
  
  console.log('🔑 [WEBPUSH-UPSERT] Environment check:', {
    hasSupabaseUrl: !!url,
    hasServiceKey: !!key,
    hasVapidPub,
    hasVapidPriv, 
    hasVapidSubject
  });
  
  if (!url || !key) {
    console.error('❌ [WEBPUSH-UPSERT] Missing Supabase env');
    return new Response(JSON.stringify({ error: "Missing Supabase env" }), {
      headers: { "content-type": "application/json", ...corsHeaders(req.headers.get("Origin")) },
      status: 500,
    });
  }

  try {
    const { user_id, endpoint, p256dh, auth, platform, userAgent, vapidKey } = await req.json();
    
    console.log('💾 [WEBPUSH-UPSERT] Saving Web Push subscription for user:', user_id);
    console.log('💾 [WEBPUSH-UPSERT] Endpoint host:', endpoint ? new URL(endpoint).hostname : 'undefined');
    console.log('💾 [WEBPUSH-UPSERT] Platform:', platform);
    console.log('💾 [WEBPUSH-UPSERT] Is APNs:', endpoint?.includes('web.push.apple.com'));
    console.log('💾 [WEBPUSH-UPSERT] VAPID Key length:', vapidKey?.length || 0);
    
    // Validate required fields
    if (!user_id || !endpoint || !p256dh || !auth) {
      const missing = [];
      if (!user_id) missing.push('user_id');
      if (!endpoint) missing.push('endpoint');
      if (!p256dh) missing.push('p256dh');
      if (!auth) missing.push('auth');
      
      console.error('❌ [WEBPUSH-UPSERT] Missing required fields:', missing);
      return new Response(JSON.stringify({ 
        error: "Missing required fields", 
        missing_fields: missing,
        received: { user_id: !!user_id, endpoint: !!endpoint, p256dh: !!p256dh, auth: !!auth }
      }), {
        headers: { "content-type": "application/json", ...corsHeaders(req.headers.get("Origin")) },
        status: 400,
      });
    }

    // Validate endpoint format
    if (!endpoint.startsWith('https://')) {
      console.error('❌ [WEBPUSH-UPSERT] Invalid endpoint format:', endpoint);
      return new Response(JSON.stringify({ error: "Endpoint must be HTTPS URL" }), {
        headers: { "content-type": "application/json", ...corsHeaders(req.headers.get("Origin")) },
        status: 400,
      });
    }

    // Normalize platform
    const normalizedPlatform = (() => {
      const p = (platform || 'web').toLowerCase();
      if (['ios', 'android', 'desktop', 'web'].includes(p)) return p;
      if (p.includes('iphone') || p.includes('ipad')) return 'ios';
      if (p.includes('android')) return 'android';
      if (p.includes('mac') || p.includes('windows') || p.includes('linux')) return 'desktop';
      return 'web';
    })();

    // Save in fcm_subscriptions table: token = endpoint, device_info contains keys
    console.log('💾 [WEBPUSH-UPSERT] Saving to database with normalized platform:', normalizedPlatform);
    
    const resp = await fetch(`${url}/rest/v1/fcm_subscriptions`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "content-type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({
        user_id,
        token: endpoint,
        platform: normalizedPlatform,
        is_active: true,
        device_info: { 
          kind: "WEBPUSH", 
          keys: { p256dh, auth },
          userAgent: userAgent || null,
          vapidKey: vapidKey || null,
          created_at: new Date().toISOString()
        },
      }),
    });

    const text = await resp.text();
    if (!resp.ok) {
      console.error('❌ [WEBPUSH-UPSERT] DB upsert failed:', resp.status, text);
      return new Response(JSON.stringify({ error: "DB upsert failed", status: resp.status, body: text }), {
        headers: { "content-type": "application/json", ...corsHeaders(req.headers.get("Origin")) },
        status: 500,
      });
    }

    console.log('✅ [WEBPUSH-UPSERT] Web Push subscription saved successfully');
    console.log('✅ [WEBPUSH-UPSERT] Saved to DB - user:', user_id, 'platform:', normalizedPlatform, 'is_active: true');
    
    return new Response(JSON.stringify({ 
      success: true,
      platform: normalizedPlatform,
      endpoint_host: endpoint ? new URL(endpoint).hostname : null
    }), {
      headers: { "content-type": "application/json", ...corsHeaders(req.headers.get("Origin")) },
      status: 200,
    });
  } catch (e) {
    console.error('❌ [WEBPUSH-UPSERT] Error:', e);
    return new Response(JSON.stringify({ error: e?.message ?? String(e) }), {
      headers: { "content-type": "application/json", ...corsHeaders(req.headers.get("Origin")) },
      status: 500,
    });
  }
});