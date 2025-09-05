import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import webpush from "npm:web-push@3.6.7";

const ALLOW_ORIGIN = ["https://m1ssion.eu", "https://lovable.dev", "https://2716f91b-957c-47ba-91e0-6f572f3ce00d.lovableproject.com"];

function corsHeaders(origin: string | null) {
  const allow = ALLOW_ORIGIN.some(allowed => origin?.includes(allowed.replace('https://', ''))) ? origin! : ALLOW_ORIGIN[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

type Subscription = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

serve(async (req) => {
  console.log('📡 [WEBPUSH-SEND] Request received:', req.method);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders(req.headers.get("Origin")), status: 204 });
  }

  try {
    const { subscription, title, body, data } = await req.json();
    const s: Subscription = subscription;

    console.log('📡 [WEBPUSH-SEND] Payload:', JSON.stringify({ title, body, data }));
    console.log('📡 [WEBPUSH-SEND] Sending to endpoint:', s?.endpoint?.substring(0, 50) + '...');

    if (!s?.endpoint || !s?.keys?.p256dh || !s?.keys?.auth) {
      console.error('❌ [WEBPUSH-SEND] Invalid subscription payload');
      return new Response(JSON.stringify({ error: "Invalid subscription payload" }), {
        headers: { "content-type": "application/json", ...corsHeaders(req.headers.get("Origin")) },
        status: 400,
      });
    }

    const pub = Deno.env.get("VAPID_PUBLIC_KEY");
    const priv = Deno.env.get("VAPID_PRIVATE_KEY");
    const contact = Deno.env.get("VAPID_CONTACT") ?? "mailto:contact@m1ssion.com";
    
    if (!pub || !priv) {
      console.error('❌ [WEBPUSH-SEND] Missing VAPID keys');
      return new Response(JSON.stringify({ error: "Missing VAPID keys" }), {
        headers: { "content-type": "application/json", ...corsHeaders(req.headers.get("Origin")) },
        status: 500,
      });
    }

    console.log('🔑 [WEBPUSH-SEND] VAPID keys configured, setting details...');
    webpush.setVapidDetails(contact, pub, priv);

    const payload = JSON.stringify({
      title: title ?? "M1SSION™",
      body: body ?? "New notification",
      data: data ?? { url: "/" },
      icon: "/favicon.ico",
      badge: "/favicon.ico",
    });

    console.log('🚀 [WEBPUSH-SEND] Sending notification...');
    const res = await webpush.sendNotification(s as any, payload);
    
    console.log('✅ [WEBPUSH-SEND] Notification sent successfully:', res.statusCode);
    return new Response(JSON.stringify({ success: true, status: res.statusCode }), {
      headers: { "content-type": "application/json", ...corsHeaders(req.headers.get("Origin")) },
      status: 200,
    });
  } catch (e) {
    console.error('❌ [WEBPUSH-SEND] Error:', e);
    return new Response(JSON.stringify({ error: e?.message ?? String(e) }), {
      headers: { "content-type": "application/json", ...corsHeaders(req.headers.get("Origin")) },
      status: 500,
    });
  }
});