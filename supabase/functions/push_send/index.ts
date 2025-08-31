// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* Supabase Edge Function - Push Send */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Web Push library for Deno
const webPushModule = await import("https://deno.land/x/webpush@v1.4.0/mod.ts");
const { sendPush } = webPushModule;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, origin',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
  'Access-Control-Allow-Credentials': 'false',
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

    // Get VAPID keys from environment
    const VAPID_PUBLIC = Deno.env.get("VAPID_PUBLIC");
    const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE");
    const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT");

    if (!VAPID_PUBLIC || !VAPID_PRIVATE || !VAPID_SUBJECT) {
      console.error("[PUSH-SEND] Missing VAPID configuration");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, "content-type": "application/json" }
        }
      );
    }

    const body = await req.json().catch(() => ({}));
    let subscription;

    // Find subscription by endpoint or user_id
    if (body.endpoint) {
      console.log("[PUSH-SEND] Looking up subscription by endpoint");
      const { data } = await supabase
        .from("push_subscriptions")
        .select("*")
        .eq("endpoint", body.endpoint)
        .maybeSingle();
      subscription = data;
    } else if (body.user_id) {
      console.log("[PUSH-SEND] Looking up subscription by user_id:", body.user_id);
      const { data } = await supabase
        .from("push_subscriptions")
        .select("*")
        .eq("user_id", body.user_id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      subscription = data;
    }

    if (!subscription) {
      console.warn("[PUSH-SEND] Subscription not found");
      return new Response(
        JSON.stringify({ error: "Subscription not found" }), 
        { 
          status: 404, 
          headers: { ...corsHeaders, "content-type": "application/json" }
        }
      );
    }

    // Prepare payload with proper structure
    const defaultPayload = { 
      title: "M1SSION™", 
      body: "Test push notification",
      data: { url: "/" }
    };
    
    const payloadData = body.payload ?? defaultPayload;
    const payload = typeof payloadData === "string" ? payloadData : JSON.stringify(payloadData);

    console.log("[PUSH-SEND] Sending push to:", subscription.endpoint.substring(0, 50) + "...");
    console.log("[PUSH-SEND] Payload:", payload);

    // Send push notification
    const response = await sendPush({
      subscription: {
        endpoint: subscription.endpoint,
        keys: { 
          p256dh: subscription.p256dh, 
          auth: subscription.auth 
        }
      },
      vapidKeys: { 
        publicKey: VAPID_PUBLIC, 
        privateKey: VAPID_PRIVATE, 
        subject: VAPID_SUBJECT 
      },
      payload
    });

    console.log("[PUSH-SEND] Push sent successfully, status:", response.status);

    // Handle expired subscriptions
    if (response.status === 410 || response.status === 404) {
      console.log("[PUSH-SEND] Subscription expired, removing from database");
      await supabase
        .from("push_subscriptions")
        .delete()
        .eq("id", subscription.id);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        status: response.status,
        subscription_id: subscription.id,
        endpoint_type: subscription.endpoint.includes('web.push.apple.com') || subscription.endpoint.includes('api.push.apple.com') ? 'APNs' : 
                      subscription.endpoint.includes('fcm.googleapis.com') ? 'FCM' : 'Other',
        endpoint_host: new URL(subscription.endpoint).hostname,
        timestamp: new Date().toISOString()
      }), 
      { 
        headers: { ...corsHeaders, "content-type": "application/json" }
      }
    );

  } catch (error) {
    console.error("[PUSH-SEND] Error sending push:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to send push notification", 
        details: error.message,
        timestamp: new Date().toISOString()
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, "content-type": "application/json" }
      }
    );
  }
});