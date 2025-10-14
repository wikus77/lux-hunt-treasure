// Function: fcm-config  (no secrets here, env only)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ALLOWED_ORIGIN = Deno.env.get("CORS_ALLOWED_ORIGIN") ?? "https://m1ssion.eu";

function corsHeaders(origin: string) {
  const allowOrigin = origin && origin.startsWith("https://") ? origin : ALLOWED_ORIGIN;
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Vary": "Origin",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Content-Type": "application/json",
  };
}

serve(async (req) => {
  const origin = req.headers.get("origin") ?? "";
  const headers = corsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers });
  }

  const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
  const fcmServerKey = Deno.env.get("FCM_SERVER_KEY") ?? "";

  return new Response(
    JSON.stringify({ vapidPublicKey, fcmServerKey }),
    { status: 200, headers },
  );
});
