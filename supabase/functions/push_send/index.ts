// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* Supabase Edge Function - Push Send NATIVE IMPLEMENTATION */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, origin',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
  'Access-Control-Allow-Credentials': 'false',
};

// Native Web Push implementation for Deno
async function generateVAPIDAuthenticationHeader(vapidPrivateKey: string, audience: string, subject: string): Promise<string> {
  // Import the private key
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    base64UrlDecode(vapidPrivateKey),
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  // Create JWT header and payload
  const header = { typ: 'JWT', alg: 'ES256' };
  const payload = {
    aud: audience,
    sub: subject,
    exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  // Sign the token
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    keyMaterial,
    new TextEncoder().encode(unsignedToken)
  );

  const encodedSignature = base64UrlEncode(signature);
  return `${unsignedToken}.${encodedSignature}`;
}

function base64UrlEncode(data: string | ArrayBuffer): string {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : new Uint8Array(data);
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64UrlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  const binary = atob(str);
  return new Uint8Array([...binary].map(char => char.charCodeAt(0)));
}

async function sendWebPushNotification(
  endpoint: string,
  p256dh: string,
  auth: string,
  payload: string,
  vapidPrivateKey: string,
  vapidPublicKey: string,
  vapidSubject: string
): Promise<Response> {
  try {
    const audience = new URL(endpoint).origin;
    
    // Generate VAPID auth header
    const vapidToken = await generateVAPIDAuthenticationHeader(vapidPrivateKey, audience, vapidSubject);
    
    // Encrypt payload (simplified version - for full encryption we'd need more complex implementation)
    const headers: Record<string, string> = {
      'Content-Type': 'application/octet-stream',
      'Authorization': `vapid t=${vapidToken}, k=${vapidPublicKey}`,
      'TTL': '86400'
    };

    console.log(`[PUSH-SEND] Sending to endpoint: ${endpoint.substring(0, 50)}...`);
    console.log(`[PUSH-SEND] Headers:`, headers);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: payload
    });

    console.log(`[PUSH-SEND] Response status: ${response.status}`);
    return response;

  } catch (error) {
    console.error(`[PUSH-SEND] Error sending notification:`, error);
    throw error;
  }
}

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

    // Get VAPID keys from environment
    const VAPID_PUBLIC = Deno.env.get("VAPID_PUBLIC");
    const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE");
    const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || 'mailto:push@m1ssion.eu';

    if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
      console.error("[PUSH-SEND] Missing VAPID configuration");
      return new Response(
        JSON.stringify({ error: "Server configuration error - missing VAPID keys" }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, "content-type": "application/json" }
        }
      );
    }

    const body = await req.json().catch(() => ({}));
    console.log("[PUSH-SEND] Request body:", JSON.stringify(body, null, 2));

    // Find subscription by endpoint
    let subscriptions = [];
    
    if (body.endpoint) {
      console.log("[PUSH-SEND] Looking up subscription by endpoint");
      const { data, error } = await supabase
        .from("push_subscriptions")
        .select("*")
        .eq("endpoint", body.endpoint);
      
      if (error) {
        console.error("[PUSH-SEND] Database error:", error);
        return new Response(
          JSON.stringify({ error: "Database query failed", details: error.message }), 
          { status: 500, headers: { ...corsHeaders, "content-type": "application/json" } }
        );
      }
      
      subscriptions = data || [];
    } else {
      // Fallback: get recent subscriptions for testing
      console.log("[PUSH-SEND] No endpoint provided, getting recent subscriptions");
      const { data, error } = await supabase
        .from("push_subscriptions")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(5);
      
      if (error) {
        console.error("[PUSH-SEND] Database error:", error);
        return new Response(
          JSON.stringify({ error: "Database query failed", details: error.message }), 
          { status: 500, headers: { ...corsHeaders, "content-type": "application/json" } }
        );
      }
      
      subscriptions = data || [];
    }

    console.log(`[PUSH-SEND] Found ${subscriptions.length} subscriptions`);

    if (!subscriptions || subscriptions.length === 0) {
      console.warn("[PUSH-SEND] No subscriptions found");
      return new Response(
        JSON.stringify({ 
          sent: 0,
          failed: 0,
          removed: 0,
          note: "no subscriptions found",
          searched_endpoint: body.endpoint || "none"
        }), 
        { 
          status: 200, 
          headers: { ...corsHeaders, "content-type": "application/json" }
        }
      );
    }

    // Prepare payload
    const payload = JSON.stringify({
      title: body.title || "M1SSION™", 
      body: body.body || "Test push notification",
      data: { url: body.url || "/", ...body.data }
    });

    console.log("[PUSH-SEND] Payload:", payload);

    let sent = 0, failed = 0, removed = 0;
    const results = [];

    // Send to all matching subscriptions
    for (const subscription of subscriptions) {
      try {
        console.log(`[PUSH-SEND] Processing subscription: ${subscription.endpoint.substring(0, 50)}...`);
        console.log(`[PUSH-SEND] Subscription data:`, {
          endpoint: subscription.endpoint ? "present" : "missing",
          p256dh: subscription.p256dh ? "present" : "missing", 
          auth: subscription.auth ? "present" : "missing"
        });

        if (!subscription.endpoint || !subscription.p256dh || !subscription.auth) {
          console.error("[PUSH-SEND] Invalid subscription data");
          failed++;
          results.push({
            endpoint_host: "invalid",
            error: "Missing required subscription fields",
            status_code: 400
          });
          continue;
        }

        const response = await sendWebPushNotification(
          subscription.endpoint,
          subscription.p256dh,
          subscription.auth,
          payload,
          VAPID_PRIVATE,
          VAPID_PUBLIC,
          VAPID_SUBJECT
        );

        if (response.ok || response.status === 201) {
          console.log(`[PUSH-SEND] Push sent successfully to: ${subscription.endpoint.substring(0, 30)}`);
          sent++;
          results.push({
            endpoint_host: new URL(subscription.endpoint).hostname,
            status: 'success',
            status_code: response.status
          });
        } else {
          console.warn(`[PUSH-SEND] Push failed with status ${response.status}`);
          
          // Handle expired subscriptions (410, 404) or invalid subscriptions (400)
          if (response.status === 410 || response.status === 404 || response.status === 400) {
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
            error: `HTTP ${response.status}`,
            status_code: response.status
          });
        }
        
      } catch (error) {
        console.error(`[PUSH-SEND] Error sending to subscription:`, error);
        failed++;
        
        results.push({
          endpoint_host: subscription.endpoint ? new URL(subscription.endpoint).hostname : "unknown",
          error: error.message,
          status_code: 0
        });
      }
    }

    const result = {
      sent,
      failed,
      removed,
      total_processed: subscriptions.length,
      results,
      timestamp: new Date().toISOString()
    };

    console.log("[PUSH-SEND] Final result:", result);

    return new Response(
      JSON.stringify(result), 
      { 
        status: 200,
        headers: { ...corsHeaders, "content-type": "application/json" }
      }
    );

  } catch (error) {
    console.error("[PUSH-SEND] Unexpected error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
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