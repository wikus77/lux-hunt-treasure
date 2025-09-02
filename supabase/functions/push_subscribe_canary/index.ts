// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* Supabase Edge Function - Push Subscribe Canary */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://m1ssion.eu',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), { 
      status: 405, 
      headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    console.log("[PUSH-SUBSCRIBE-CANARY] Input received:", {
      hasSubscription: !!body.subscription,
      client: body.client,
      platform: body.platform
    });
    
    // Extract subscription data - unified payload format
    const { subscription, user_id, client = "app", ua, platform } = body;
    
    if (!subscription || !subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing required subscription fields: endpoint, keys.p256dh, keys.auth" }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, "content-type": "application/json" }
        }
      );
    }

    // Validate endpoint format for supported platforms
    const endpoint = subscription.endpoint;
    const isApnsEndpoint = endpoint.includes('web.push.apple.com') || endpoint.includes('api.push.apple.com');
    const isFcmEndpoint = endpoint.includes('fcm.googleapis.com');
    const isWnsEndpoint = endpoint.includes('wns.notify.windows.com');
    
    let endpoint_type = 'unknown';
    if (isApnsEndpoint) endpoint_type = 'apns';
    else if (isFcmEndpoint) endpoint_type = 'fcm';
    else if (isWnsEndpoint) endpoint_type = 'wns';
    
    if (endpoint_type === 'unknown') {
      return new Response(
        JSON.stringify({ 
          ok: false,
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

    console.log("[PUSH-SUBSCRIBE-CANARY] Processing subscription:", {
      endpoint: endpoint.substring(0, 50) + "...",
      endpoint_type,
      hasUserId: !!user_id,
      client,
      platform
    });

    // UPSERT subscription by endpoint (unique constraint)
    const { data, error } = await supabase
      .from("push_subscriptions")
      .upsert({
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        endpoint_type,
        ua: ua ?? null,
        platform: platform ?? null,
        user_id: user_id ?? null,
        updated_at: new Date().toISOString()
      }, { 
        onConflict: "endpoint" 
      })
      .select()
      .single();

    if (error) {
      console.error("[PUSH-SUBSCRIBE-CANARY] Database error:", error);
      return new Response(
        JSON.stringify({ ok: false, error: error.message }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, "content-type": "application/json" }
        }
      );
    }

    console.log("[PUSH-SUBSCRIBE-CANARY] Subscription saved successfully:", data.id);
    
    return new Response(
      JSON.stringify({ 
        ok: true, 
        subscription: data,
        endpoint_type,
        stored_at: new Date().toISOString()
      }), 
      { 
        headers: { ...corsHeaders, "content-type": "application/json" }
      }
    );

  } catch (error) {
    console.error("[PUSH-SUBSCRIBE-CANARY] Unexpected error:", error);
    return new Response(
      JSON.stringify({ ok: false, error: "Internal server error" }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, "content-type": "application/json" }
      }
    );
  }
});