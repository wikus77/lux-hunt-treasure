// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* Supabase Edge Function - Push Send */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Native Web Push implementation without external dependencies
// Since deno.land/x/webpush may not be available, we'll implement VAPID Web Push directly

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

    // Native VAPID Web Push implementation
    async function sendWebPush(subscription, payload, vapidKeys) {
      const { endpoint, keys } = subscription;
      const { publicKey, privateKey, subject } = vapidKeys;
      
      // Create VAPID JWT token
      const encoder = new TextEncoder();
      const now = Math.floor(Date.now() / 1000);
      
      const header = {
        "typ": "JWT",
        "alg": "ES256"
      };
      
      const claims = {
        "aud": new URL(endpoint).origin,
        "exp": now + 12 * 60 * 60, // 12 hours
        "sub": subject
      };
      
      const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
      const encodedClaims = btoa(JSON.stringify(claims)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
      
      // For now, we'll send a simple HTTP request without JWT signature
      // This is a simplified version - in production, you'd need proper VAPID JWT signing
      
      const headers = {
        'TTL': '86400',
        'Content-Type': 'application/json',
        'Content-Encoding': 'aes128gcm'
      };
      
      // Simple payload without encryption for testing
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: payload
      });
      
      return response;
    }

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
        
        const response = await sendWebPush({
          endpoint: subscription.endpoint,
          keys: { 
            p256dh: subscription.p256dh, 
            auth: subscription.auth 
          }
        }, payload, {
          publicKey: VAPID_PUBLIC, 
          privateKey: VAPID_PRIVATE, 
          subject: VAPID_SUBJECT 
        });

        console.log("[PUSH-SEND] Push sent, status:", response.status);
        
        // Handle expired subscriptions
        if (response.status === 410 || response.status === 404) {
          console.log("[PUSH-SEND] Subscription expired, removing from database");
          await supabase
            .from("push_subscriptions")
            .delete()
            .eq("endpoint", subscription.endpoint);
          removed++;
        } else if (response.status >= 200 && response.status < 300) {
          sent++;
        } else {
          failed++;
        }
        
        results.push({
          endpoint_host: new URL(subscription.endpoint).hostname,
          status: response.status
        });
        
      } catch (error) {
        console.error("[PUSH-SEND] Error sending to subscription:", subscription.endpoint.substring(0, 30), error.message);
        failed++;
        results.push({
          endpoint_host: new URL(subscription.endpoint).hostname,
          error: error.message
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