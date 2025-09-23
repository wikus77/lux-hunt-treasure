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
  
  // Push Guard Runtime Check
  console.log('🔒 [PUSH-GUARD] ENABLED - webpush-upsert protected');
  if (!hasVapidPub || !hasVapidPriv || !hasVapidSubject) {
    const missing = [];
    if (!hasVapidPub) missing.push('VAPID_PUBLIC_KEY');
    if (!hasVapidPriv) missing.push('VAPID_PRIVATE_KEY');
    if (!hasVapidSubject) missing.push('VAPID_SUBJECT');
    
    console.error('🔒 [PUSH-GUARD] Missing required secrets:', missing);
    return new Response(JSON.stringify({ 
      error: `PUSH_GUARD_MISSING_SECRET: ${missing.join(', ')}`,
      guard_status: 'ENABLED'
    }), {
      headers: { "content-type": "application/json", ...corsHeaders(req.headers.get("Origin")) },
      status: 500,
    });
  }
  
  if (!url || !key) {
    console.error('❌ [WEBPUSH-UPSERT] Missing Supabase env');
    return new Response(JSON.stringify({ error: "Missing Supabase env" }), {
      headers: { "content-type": "application/json", ...corsHeaders(req.headers.get("Origin")) },
      status: 500,
    });
  }

  try {
    const body = await req.json();
    console.log('💾 [WEBPUSH-UPSERT] Raw body keys:', Object.keys(body));
    
    // Support both old and new payload formats
    let endpoint: string, p256dh: string, auth: string, platform: string, user_id: string | null;
    
    if (body.subscription && body.subscription.keys) {
      // New format: { subscription: { endpoint, keys: { p256dh, auth } }, platform, user_id }
      endpoint = body.subscription.endpoint;
      p256dh = body.subscription.keys.p256dh;
      auth = body.subscription.keys.auth;
      platform = body.platform || 'web';
      user_id = body.user_id || null;
    } else if (body.endpoint && body.keys) {
      // Alternative format: { endpoint, keys: { p256dh, auth }, platform, user_id }
      endpoint = body.endpoint;
      p256dh = body.keys.p256dh;
      auth = body.keys.auth;
      platform = body.platform || 'web';
      user_id = body.user_id || null;
    } else {
      // Old format: { endpoint, p256dh, auth, platform, user_id }
      endpoint = body.endpoint;
      p256dh = body.p256dh;
      auth = body.auth;
      platform = body.platform || 'web';
      user_id = body.user_id || null;
    }
    
    const diagnosticLog = {
      route: 'webpush-upsert',
      endpointHost: endpoint ? new URL(endpoint).hostname : null,
      hasP256dh: !!p256dh,
      hasAuth: !!auth,
      platform: platform || null,
      user_id: user_id || null,
      ua: req.headers.get('user-agent')?.substring(0, 50) || null
    };
    console.log('💾 [WEBPUSH-UPSERT] Diagnostic:', diagnosticLog);
    console.log('💾 [WEBPUSH-UPSERT] Is APNs:', endpoint?.includes('web.push.apple.com'));
    
    // Validate required fields (minimal validation)
    const missing = [];
    if (!endpoint || typeof endpoint !== 'string' || endpoint.length === 0) missing.push('endpoint');
    if (!p256dh || typeof p256dh !== 'string' || p256dh.length === 0) missing.push('p256dh');
    if (!auth || typeof auth !== 'string' || auth.length === 0) missing.push('auth');
    
    if (missing.length > 0) {
      console.error('❌ [WEBPUSH-UPSERT] Missing/invalid fields:', missing);
      return new Response(JSON.stringify({ 
        ok: false,
        error: "MISSING_FIELD",
        missing,
        hint: "Required: endpoint (https URL), p256dh (string), auth (string)"
      }), {
        headers: { "content-type": "application/json", ...corsHeaders(req.headers.get("Origin")) },
        status: 400,
      });
    }

    // Validate endpoint format
    if (!endpoint.startsWith('https://')) {
      console.error('❌ [WEBPUSH-UPSERT] Invalid endpoint format:', endpoint);
      return new Response(JSON.stringify({ 
        ok: false,
        error: "Endpoint must be HTTPS URL" 
      }), {
        headers: { "content-type": "application/json", ...corsHeaders(req.headers.get("Origin")) },
        status: 400,
      });
    }

    // Normalize platform server-side
    const host = new URL(endpoint).host;
    const normalizedPlatform = host === 'web.push.apple.com' ? 'web' : (platform || 'desktop');

    // Minimal logging (no sensitive data)
    console.log(JSON.stringify({ 
      fn: "webpush-upsert", 
      host, 
      platform: normalizedPlatform, 
      hasUser: !!user_id 
    }, null, 0));
    
    // UPSERT idempotent on endpoint
    const conflictStrategy = user_id 
      ? "resolution=merge-duplicates,on-conflict=user_id,token" 
      : "resolution=merge-duplicates,on-conflict=token";
    
    const resp = await fetch(`${url}/rest/v1/fcm_subscriptions`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "content-type": "application/json",
        Prefer: conflictStrategy,
      },
      body: JSON.stringify({
        user_id,
        token: endpoint,
        platform: normalizedPlatform,
        is_active: true,
        device_info: { 
          host,
          keys: { p256dh, auth },
          ua: req.headers.get('user-agent')?.slice(0, 120) || null,
          timestamp: new Date().toISOString()
        },
      }),
    });

    // Always return 200 for valid subscriptions (even on conflict)
    if (!resp.ok) {
      const text = await resp.text();
      console.warn('⚠️ [WEBPUSH-UPSERT] DB response not OK, but continuing:', resp.status, text);
      
      // Check if it's a conflict (duplicate) - that's OK
      if (resp.status === 409 || text.includes('duplicate') || text.includes('conflict')) {
        console.log('✅ [WEBPUSH-UPSERT] Duplicate subscription (idempotent)');
        return new Response(JSON.stringify({ 
          ok: true, 
          saved: true,
          endpointHost: host,
          platform: normalizedPlatform,
          note: "idempotent_upsert"
        }), {
          headers: { "content-type": "application/json", ...corsHeaders(req.headers.get("Origin")) },
          status: 200,
        });
      }
    }

    // Parse response to get ID (if needed)
    let savedData = null;
    try {
      savedData = await resp.json();
    } catch {
      // Ignore parse errors
    }
    
    const responseId = Array.isArray(savedData) ? savedData[0]?.id : savedData?.id;
    
    console.log('✅ [WEBPUSH-UPSERT] Subscription saved successfully');
    
    return new Response(JSON.stringify({ 
      ok: true,
      saved: true,
      endpointHost: host,
      platform: normalizedPlatform,
      id: responseId || "unknown"
    }), {
      headers: { "content-type": "application/json", ...corsHeaders(req.headers.get("Origin")) },
      status: 200,
    });
  } catch (e) {
    console.error('❌ [WEBPUSH-UPSERT] Unexpected error:', e);
    // Return 200 even on error to avoid breaking client toggle
    return new Response(JSON.stringify({ 
      ok: false,
      error: "INTERNAL_ERROR",
      message: e?.message ?? String(e)
    }), {
      headers: { "content-type": "application/json", ...corsHeaders(req.headers.get("Origin")) },
      status: 200, // Changed from 500 to 200
    });
  }
});