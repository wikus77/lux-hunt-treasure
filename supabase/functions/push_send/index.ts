// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* Supabase Edge Function - Push Send */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Import WebPush library from esm.sh
import * as webpush from "https://esm.sh/web-push@3.6.7";

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

    // Find subscription by endpoint or user_id
    let subscriptions = [];
    
    if (body.endpoint) {
      console.log("[PUSH-SEND] Looking up subscription by endpoint");
      const { data } = await supabase
        .from("push_subscriptions")
        .select("*")
        .eq("endpoint", body.endpoint);
      subscriptions = data || [];
    } else if (body.user_id) {
      console.log("[PUSH-SEND] Looking up subscription by user_id:", body.user_id);
      const { data } = await supabase
        .from("push_subscriptions")
        .select("*")
        .eq("user_id", body.user_id)
        .order("updated_at", { ascending: false });
      subscriptions = data || [];
    } else {
      // Fallback: get all subscriptions for testing
      console.log("[PUSH-SEND] No endpoint or user_id provided, getting all subscriptions");
      const { data } = await supabase
        .from("push_subscriptions")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(10);
      subscriptions = data || [];
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.warn("[PUSH-SEND] No subscriptions found");
      return new Response(
        JSON.stringify({ 
          sent: 0,
          failed: 0,
          removed: 0,
          note: "no subscriptions"
        }), 
        { 
          status: 202, 
          headers: { ...corsHeaders, "content-type": "application/json" }
        }
      );
    }

    // Configure WebPush library
    webpush.setVapidDetails(
      VAPID_SUBJECT,
      VAPID_PUBLIC,
      VAPID_PRIVATE
    );

    // Prepare payload with proper structure
    const defaultPayload = { 
      title: body.title || "M1SSION™", 
      body: body.body || "Test push notification",
      data: { url: body.url || "/" }
    };
    
    const payloadData = body.payload ?? defaultPayload;
    const payload = typeof payloadData === "string" ? payloadData : JSON.stringify(payloadData);

    console.log("[PUSH-SEND] Sending push to", subscriptions.length, "subscriptions");
    console.log("[PUSH-SEND] Payload:", payload);

    let sent = 0, failed = 0, removed = 0;
    const results = [];

    // Send to all matching subscriptions
    for (const subscription of subscriptions) {
      try {
        console.log("[PUSH-SEND] Sending to endpoint:", subscription.endpoint.substring(0, 50) + "...");
        
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: { 
            p256dh: subscription.p256dh, 
            auth: subscription.auth 
          }
        };

        const response = await webpush.sendNotification(pushSubscription, payload, {
          TTL: 86400, // 24 hours
          urgency: 'normal'
        });

        console.log("[PUSH-SEND] Push sent successfully to:", subscription.endpoint.substring(0, 30));
        sent++;
        
        results.push({
          endpoint_host: new URL(subscription.endpoint).hostname,
          status: 'success'
        });
        
      } catch (error) {
        console.error("[PUSH-SEND] Error sending to subscription:", subscription.endpoint.substring(0, 30), error.message);
        
        // Handle expired subscriptions (410, 404) or invalid subscriptions (400)
        if (error.statusCode === 410 || error.statusCode === 404 || error.statusCode === 400) {
          console.log("[PUSH-SEND] Subscription expired/invalid, removing from database");
          await supabase
            .from("push_subscriptions")
            .delete()
            .eq("endpoint", subscription.endpoint);
          removed++;
        } else {
          failed++;
        }
        
        results.push({
          endpoint_host: new URL(subscription.endpoint).hostname,
          error: error.message,
          status_code: error.statusCode
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        sent,
        failed,
        removed,
        total_processed: subscriptions.length,
        results,
        timestamp: new Date().toISOString()
      }), 
      { 
        status: 202,
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