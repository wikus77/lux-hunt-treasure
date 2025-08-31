// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* Supabase Edge Function - Push Subscribe */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, origin',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    const body = await req.json();
    const { endpoint, keys, ua, platform, user_id } = body;

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
    const isApnsEndpoint = endpoint.includes('web.push.apple.com');
    const isFcmEndpoint = endpoint.includes('fcm.googleapis.com');
    const isWnsEndpoint = endpoint.includes('wns.notify.windows.com');
    
    if (!isApnsEndpoint && !isFcmEndpoint && !isWnsEndpoint) {
      console.warn("[PUSH-SUBSCRIBE] Unsupported endpoint format:", endpoint.substring(0, 50) + "...");
      return new Response(
        JSON.stringify({ error: "Unsupported endpoint format. Only APNs, FCM, and WNS endpoints are supported." }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, "content-type": "application/json" }
        }
      );
    }

    console.log("[PUSH-SUBSCRIBE] Registering subscription for endpoint:", endpoint.substring(0, 50) + "...");

    // Upsert subscription by endpoint
    const { data, error } = await supabase
      .from("push_subscriptions")
      .upsert({
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        user_agent: ua ?? null,
        platform: platform ?? null,
        user_id: user_id ?? null,
        updated_at: new Date().toISOString()
      }, { 
        onConflict: "endpoint" 
      })
      .select()
      .single();

    if (error) {
      console.error("[PUSH-SUBSCRIBE] Database error:", error);
      return new Response(
        JSON.stringify({ error: error.message }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, "content-type": "application/json" }
        }
      );
    }

    console.log("[PUSH-SUBSCRIBE] Subscription registered successfully:", data.id);

    return new Response(
      JSON.stringify({ success: true, subscription: data }), 
      { 
        headers: { ...corsHeaders, "content-type": "application/json" }
      }
    );

  } catch (error) {
    console.error("[PUSH-SUBSCRIBE] Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, "content-type": "application/json" }
      }
    );
  }
});