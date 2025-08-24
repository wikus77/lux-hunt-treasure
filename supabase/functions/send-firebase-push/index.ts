/* M1SSION™ AG-X0197 */
// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// Firebase Cloud Messaging Push Notification Sender

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const FCM_URL = "https://fcm.googleapis.com/fcm/send";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// M1SSION™ AG-X0197: Generate request ID for logging
const generateRequestId = () => `req_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;

serve(async (req) => {
  const requestId = generateRequestId();
  const startTime = Date.now();
  
  console.log(`[M1SSION FCM] ${requestId} → ${req.method} request started`);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log(`[M1SSION FCM] ${requestId} → CORS preflight → OK`);
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    console.log(`[M1SSION FCM] ${requestId} → method ${req.method} not allowed`);
    return new Response("Method Not Allowed", { 
      status: 405,
      headers: corsHeaders 
    });
  }

  const SERVER_KEY = Deno.env.get("FIREBASE_SERVER_KEY");
  if (!SERVER_KEY) {
    console.error(`[M1SSION FCM] ${requestId} → FIREBASE_SERVER_KEY not configured`);
    return new Response(
      JSON.stringify({ 
        error: "Server configuration error",
        requestId,
        success: false 
      }), 
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }

  try {
    const { token, title, body, data, badge, icon } = await req.json();
    console.log(`[M1SSION FCM] ${requestId} → payload parsed`);

    if (!token) {
      console.log(`[M1SSION FCM] ${requestId} → token missing → ERROR`);
      return new Response(
        JSON.stringify({ 
          error: "Token is required",
          requestId,
          success: false 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log(`[M1SSION FCM] ${requestId} → sending to token: ${token.substring(0, 20)}...`);

    const payload = {
      to: token,
      notification: { 
        title: title || "M1SSION™", 
        body: body || "Nuova notifica dall'app",
        icon: icon || "/icon-192x192.png",
        badge: badge || "/icon-192x192.png"
      },
      data: data || {},
      priority: "high",
      webpush: {
        fcm_options: {
          link: "https://m1ssion.eu"
        }
      }
    };

    const response = await fetch(FCM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `key=${SERVER_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    const duration = Date.now() - startTime;
    
    console.log(`[M1SSION FCM] ${requestId} → FCM response (${response.status}) in ${duration}ms:`, responseText);

    if (!response.ok) {
      console.log(`[M1SSION FCM] ${requestId} → FCM send failed → STATUS ${response.status}`);
      return new Response(
        JSON.stringify({ 
          error: "FCM send failed", 
          details: responseText,
          status: response.status,
          requestId,
          duration,
          success: false
        }),
        { 
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log(`[M1SSION FCM] ${requestId} → success in ${duration}ms`);
    return new Response(
      JSON.stringify({ 
        success: true, 
        fcm_response: responseText,
        message: "Push notification sent successfully",
        requestId,
        duration
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`[M1SSION FCM] ${requestId} → error after ${duration}ms:`, error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        details: error?.message || String(error),
        requestId,
        duration,
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});