// © 2025 M1SSION™ – NIYVORA KFT™

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "GET" && req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), { 
      status: 405, 
      headers: { "content-type":"application/json", ...cors }
    });
  }
  
  const sk = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
  const mode = sk.startsWith("sk_live_") ? "live" : sk.startsWith("sk_test_") ? "test" : "unknown";
  
  return new Response(JSON.stringify({ mode }), { 
    status: 200, 
    headers: { "content-type":"application/json", ...cors }
  });
});