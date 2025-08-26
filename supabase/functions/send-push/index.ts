/* M1SSION™ AG-X0197 */
// Supabase Edge Function: send-push
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const FCM_KEY = Deno.env.get("FCM_SERVER_KEY");
const FCM_URL = "https://fcm.googleapis.com/fcm/send";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Generate request ID for logging
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
    return new Response(
      JSON.stringify({ success: false, error: "Method Not Allowed", requestId }), 
      { 
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }

  if (!FCM_KEY) {
    console.error(`[M1SSION FCM] ${requestId} → FCM_SERVER_KEY not configured`);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Server configuration error",
        requestId 
      }), 
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }

  try {
    const { token, title, body, data } = await req.json();
    console.log(`[M1SSION FCM] ${requestId} → payload parsed`);

    if (!token) {
      console.log(`[M1SSION FCM] ${requestId} → token missing → ERROR`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Token is required",
          requestId 
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
        title: title ?? "M1SSION", 
        body: body ?? "Nuova notifica dall'app",
        icon: "/icons/icon-m1-192x192.png",
        badge: "/icons/icon-m1-192x192.png"
      },
      data: data ?? {},
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
        "Authorization": `key=${FCM_KEY}`,
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
          success: false,
          error: "FCM send failed", 
          details: responseText,
          status: response.status,
          requestId,
          duration
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
        success: false,
        error: "Internal server error", 
        details: error?.message || String(error),
        requestId,
        duration
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});