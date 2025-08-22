// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

serve(() => {
  const body = JSON.stringify({
    apiKey: Deno.env.get("FIREBASE_API_KEY"),
    authDomain: Deno.env.get("FIREBASE_AUTH_DOMAIN"),
    projectId: Deno.env.get("FIREBASE_PROJECT_ID"),
    storageBucket: Deno.env.get("FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: Deno.env.get("FIREBASE_MESSAGING_SENDER_ID"),
    appId: Deno.env.get("FIREBASE_APP_ID"),
    vapidPublicKey: Deno.env.get("VITE_FIREBASE_VAPID_PUBLIC_KEY"),
  });
  return new Response(body, { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
});