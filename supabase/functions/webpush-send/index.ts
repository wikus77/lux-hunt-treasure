// supabase/functions/webpush-send/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
    }

    const { subscription, title, body, data } = await req.json();

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return new Response(JSON.stringify({ success: false, error: "Invalid subscription payload" }), {
        status: 400, 
        headers: { "content-type": "application/json", ...corsHeaders }
      });
    }

    // Web Push protocol implementation
    const VAPID_PUBLIC = Deno.env.get("VAPID_PUBLIC_KEY")!;
    const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE_KEY")!;
    const CONTACT = Deno.env.get("VAPID_CONTACT") ?? "mailto:contact@m1ssion.com";

    const payload = JSON.stringify({
      title: title ?? "M1SSION™",
      body: body ?? "New message",
      data: data ?? { screen: "/" },
      icon: "/favicon.ico",
      badge: "/favicon.ico",
    });

    console.log(`📡 [WEBPUSH-SEND] Sending to endpoint: ${subscription.endpoint.slice(0, 50)}...`);
    console.log(`📡 [WEBPUSH-SEND] Payload: ${payload}`);

    // For now, we'll use dynamic import for web-push
    const webpush = await import("npm:web-push@3.6.7");
    
    webpush.setVapidDetails(CONTACT, VAPID_PUBLIC, VAPID_PRIVATE);
    
    await webpush.sendNotification(subscription, payload);

    console.log(`✅ [WEBPUSH-SEND] Successfully sent notification`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { "content-type": "application/json", ...corsHeaders }
    });
  } catch (e) {
    console.error(`❌ [WEBPUSH-SEND] Error:`, e);
    return new Response(JSON.stringify({ success: false, error: String(e) }), {
      status: 400, 
      headers: { "content-type": "application/json", ...corsHeaders }
    });
  }
});