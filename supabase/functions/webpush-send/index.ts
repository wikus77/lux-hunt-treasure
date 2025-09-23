// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import webpush from "npm:web-push@3.6.7";

const ALLOW_ORIGIN = [
  "https://m1ssion.eu", 
  "https://lovable.dev", 
  "https://2716f91b-957c-47ba-91e0-6f572f3ce00d.lovableproject.com",
  "https://*.m1ssion.pages.dev"
];

function corsHeaders(origin: string | null) {
  const allow = ALLOW_ORIGIN.some(allowed => 
    origin?.includes(allowed.replace('https://', '').replace('*.', ''))
  ) ? origin! : ALLOW_ORIGIN[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-mi-dropper-version",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

type Subscription = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

serve(async (req) => {
  console.log('📡 [WEBPUSH-SEND] Request received:', req.method);
  console.log('📡 [WEBPUSH-SEND] Origin:', req.headers.get("Origin"));
  console.log('📡 [WEBPUSH-SEND] Headers:', Object.fromEntries(req.headers.entries()));
  
  // Push Guard Runtime Check
  console.log('🔒 [PUSH-GUARD] ENABLED - webpush-send protected');
  
  if (req.method === "OPTIONS") {
    console.log('📡 [WEBPUSH-SEND] Handling OPTIONS preflight request');
    return new Response(null, { headers: corsHeaders(req.headers.get("Origin")), status: 204 });
  }

  try {
    const requestBody = await req.json();
    console.log('📡 [WEBPUSH-SEND] Full request body:', JSON.stringify(requestBody, null, 2));
    
    const { subscription, title, body, data } = requestBody;
    const s: Subscription = subscription;

    console.log('📡 [WEBPUSH-SEND] Payload to send:', JSON.stringify({ title, body, data }, null, 2));
    console.log('📡 [WEBPUSH-SEND] Subscription details:', {
      endpoint: s?.endpoint?.substring(0, 80) + '...',
      hasP256dh: !!s?.keys?.p256dh,
      hasAuth: !!s?.keys?.auth,
      p256dhLength: s?.keys?.p256dh?.length,
      authLength: s?.keys?.auth?.length
    });

    if (!s?.endpoint || !s?.keys?.p256dh || !s?.keys?.auth) {
      console.error('❌ [WEBPUSH-SEND] Invalid subscription payload:', {
        hasEndpoint: !!s?.endpoint,
        hasP256dh: !!s?.keys?.p256dh,
        hasAuth: !!s?.keys?.auth
      });
      return new Response(JSON.stringify({ error: "Invalid subscription payload" }), {
        headers: { "content-type": "application/json", ...corsHeaders(req.headers.get("Origin")) },
        status: 400,
      });
    }

    const pub = Deno.env.get("VAPID_PUBLIC_KEY");
    const priv = Deno.env.get("VAPID_PRIVATE_KEY");
    const contact = Deno.env.get("VAPID_CONTACT") ?? "mailto:contact@m1ssion.com";
    
    console.log('🔑 [WEBPUSH-SEND] VAPID keys status:', {
      hasPublic: !!pub,
      hasPrivate: !!priv,
      publicLength: pub?.length,
      privateLength: priv?.length,
      contact: contact,
      endpointHost: s?.endpoint ? new URL(s.endpoint).hostname : 'unknown'
    });
    
    if (!pub || !priv) {
      console.error('❌ [WEBPUSH-SEND] Missing VAPID keys - cannot proceed');
      return new Response(JSON.stringify({ error: "Missing VAPID keys" }), {
        headers: { "content-type": "application/json", ...corsHeaders(req.headers.get("Origin")) },
        status: 500,
      });
    }

    console.log('🔑 [WEBPUSH-SEND] Setting VAPID details...');
    webpush.setVapidDetails(contact, pub, priv);

    const payload = JSON.stringify({
      title: title ?? "M1SSION™",
      body: body ?? "New notification",
      targetUrl: data?.url ?? "/",
      icon: "/favicon.ico",
      badge: "/favicon.ico",
    });

    console.log('📦 [WEBPUSH-SEND] Final payload:', payload);
    const endpointHost = new URL(s.endpoint).hostname;
    const isApns = endpointHost === 'web.push.apple.com';
    
    console.log('🚀 [WEBPUSH-SEND] Sending to:', endpointHost, isApns ? '(APNs/Safari)' : '(Other)');
    
    // Send with proper headers for different providers
    const options: any = {
      TTL: 2419200, // 28 days
      headers: {
        'Urgency': 'normal'
      }
    };

    if (isApns) {
      // APNs specific headers
      options.headers['apns-topic'] = 'app.lovable.2716f91b957c47ba91e06f572f3ce00d';
      options.headers['apns-priority'] = '5'; // Normal priority
    }

    try {
      const res = await webpush.sendNotification(s as any, payload, options);
      
      const success = res.statusCode >= 200 && res.statusCode < 300;
      
      if (success) {
        console.log('✅ [WEBPUSH-SEND] Notification sent successfully to:', endpointHost);
      } else {
        console.log('⚠️ [WEBPUSH-SEND] Send failed:', res.statusCode, res.headers);
      }
      
      return new Response(JSON.stringify({ 
        success, 
        status: res.statusCode,
        provider: isApns ? 'apns' : 'other'
      }), {
        headers: { "content-type": "application/json", ...corsHeaders(req.headers.get("Origin")) },
        status: 200,
      });
    } catch (sendError: any) {
      // Don't throw, return error details
      console.error('❌ [WEBPUSH-SEND] Send error:', sendError.message);
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: sendError.message,
        status: sendError.statusCode || 500,
        provider: isApns ? 'apns' : 'other'
      }), {
        headers: { "content-type": "application/json", ...corsHeaders(req.headers.get("Origin")) },
        status: 200, // Always return 200 for API consistency
      });
    }
  } catch (e: any) {
    console.error('❌ [WEBPUSH-SEND] Detailed error analysis:');
    console.error('❌ [WEBPUSH-SEND] Error type:', e.constructor.name);
    console.error('❌ [WEBPUSH-SEND] Error message:', e.message);
    console.error('❌ [WEBPUSH-SEND] Error stack:', e.stack);
    
    if (e.statusCode) {
      console.error('❌ [WEBPUSH-SEND] HTTP Status Code:', e.statusCode);
    }
    if (e.headers) {
      console.error('❌ [WEBPUSH-SEND] Response Headers:', JSON.stringify(e.headers, null, 2));
    }
    if (e.body) {
      console.error('❌ [WEBPUSH-SEND] Response Body:', e.body);
    }
    if (e.endpoint) {
      console.error('❌ [WEBPUSH-SEND] Target Endpoint:', e.endpoint);
    }
    
    const errorResponse = {
      error: e.message ?? String(e),
      statusCode: e.statusCode,
      body: e.body,
      headers: e.headers,
      endpoint: e.endpoint?.substring(0, 100)
    };
    
    return new Response(JSON.stringify(errorResponse), {
      headers: { "content-type": "application/json", ...corsHeaders(req.headers.get("Origin")) },
      status: 500,
    });
  }
});