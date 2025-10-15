// © 2025 Joseph MULÉ – M1SSION™
// Function: fcm-config
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (_req) => {
  const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
  const fcmServerKey = Deno.env.get("FCM_SERVER_KEY") ?? "";
  return new Response(
    JSON.stringify({ vapidPublicKey, fcmServerKey }),
    { headers: { "Content-Type": "application/json" } },
  );
});
