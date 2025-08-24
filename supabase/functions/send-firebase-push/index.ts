// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// Firebase Cloud Messaging Push Notification Sender

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const FCM_URL = "https://fcm.googleapis.com/fcm/send";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { 
      status: 405,
      headers: corsHeaders 
    });
  }

  const SERVER_KEY = Deno.env.get("FIREBASE_SERVER_KEY");
  if (!SERVER_KEY) {
    console.error("❌ FIREBASE_SERVER_KEY not configured");
    return new Response(
      JSON.stringify({ error: "Server configuration error" }), 
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }

  try {
    const { token, title, body, data, badge, icon } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Token is required" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log(`📤 Sending FCM push to token: ${token.substring(0, 20)}...`);

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
    console.log(`📨 FCM Response (${response.status}):`, responseText);

    if (!response.ok) {
      return new Response(
        JSON.stringify({ 
          error: "FCM send failed", 
          details: responseText,
          status: response.status 
        }),
        { 
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        fcm_response: responseText,
        message: "Push notification sent successfully"
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error: any) {
    console.error("❌ Send push error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        details: error?.message || String(error) 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});