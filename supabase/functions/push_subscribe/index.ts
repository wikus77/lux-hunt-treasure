// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* Supabase Edge Function - Push Subscribe */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://m1ssion.eu',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { 
      status: 405, 
      headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let body;
    try {
      body = await req.json();
    } catch (error) {
      console.error("[PUSH-SUBSCRIBE] JSON parsing error:", error);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, "content-type": "application/json" }
        }
      );
    }
    
    // Handle both flat structure and nested subscription structure
    let endpoint, keys, ua, platform, user_id;
    
    if (body.subscription) {
      // Nested structure from push-diag.html
      const subscription = body.subscription;
      endpoint = subscription.endpoint;
      keys = subscription.keys;
      ua = body.ua;
      platform = body.platform;
      user_id = body.user_id;
    } else {
      // Flat structure
      endpoint = body.endpoint;
      keys = body.keys;
      ua = body.ua;
      platform = body.platform;
      user_id = body.user_id;
    }

    // Validate required fields
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: endpoint, keys.p256dh, keys.auth" }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, "content-type": "application/json" }
        }
      );
    }

    // Validate endpoint format for supported platforms
    const isApnsEndpoint = endpoint.includes('web.push.apple.com') || endpoint.includes('api.push.apple.com');
    const isFcmEndpoint = endpoint.includes('fcm.googleapis.com');
    const isWnsEndpoint = endpoint.includes('wns.notify.windows.com');
    
    if (!isApnsEndpoint && !isFcmEndpoint && !isWnsEndpoint) {
      console.warn("[PUSH-SUBSCRIBE] Unsupported endpoint format:", endpoint.substring(0, 50) + "...");
      return new Response(
        JSON.stringify({ 
          error: "Unsupported endpoint format. Only APNs, FCM, and WNS endpoints are supported.",
          endpoint_type: 'unknown',
          supported_types: ['APNs (web.push.apple.com)', 'FCM (fcm.googleapis.com)', 'WNS (wns.notify.windows.com)']
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, "content-type": "application/json" }
        }
      );
    }

    console.log("[PUSH-SUBSCRIBE] Registering subscription for endpoint:", endpoint.substring(0, 60) + "...");
    console.log("[PUSH-SUBSCRIBE] Keys received - p256dh length:", keys.p256dh?.length, "auth length:", keys.auth?.length);
    console.log("[PUSH-SUBSCRIBE] Platform:", platform, "UA:", ua?.substring(0, 50));

    // user_id can be NULL for anonymous subscriptions
    const finalUserId = user_id || null;
    
    console.log("[PUSH-SUBSCRIBE] Using user_id:", finalUserId);

    // Upsert subscription by endpoint using REST API with SERVICE_ROLE_KEY
    const upsertUrl = `${Deno.env.get("SUPABASE_URL")}/rest/v1/push_subscriptions`;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    const upsertResponse = await fetch(upsertUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey!,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        ua: ua ?? null,
        platform: platform ?? null,
        user_id: finalUserId,
        updated_at: new Date().toISOString()
      })
    });

    if (!upsertResponse.ok) {
      const errorText = await upsertResponse.text();
      console.error("[PUSH-SUBSCRIBE] Upsert error:", upsertResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: `Database error: ${errorText}` }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, "content-type": "application/json" }
        }
      );
    }

    const data = await upsertResponse.json();

    console.log("[PUSH-SUBSCRIBE] Subscription registered successfully:", data);

    const endpointType = isApnsEndpoint ? 'APNs' : isFcmEndpoint ? 'FCM' : 'WNS';
    
    return new Response(
      JSON.stringify({ 
        ok: true, 
        saved: { endpoint: endpoint.substring(0, 60) + "..." },
        endpoint_type: endpointType,
        stored_at: new Date().toISOString()
      }), 
      { 
        headers: { ...corsHeaders, "content-type": "application/json" }
      }
    );

  } catch (error) {
    console.error("[PUSH-SUBSCRIBE] Unexpected error:", error);
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: "Internal server error",
        details: error.message 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, "content-type": "application/json" }
      }
    );
  }
});