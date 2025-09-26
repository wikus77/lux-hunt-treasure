// © 2025 M1SSION™ – Stripe Mode Detection Edge Function

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { getStripeModeFromKey } from "../_shared/stripeConfig.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method Not Allowed" }), 
      { 
        status: 405, 
        headers: { "content-type": "application/json", ...corsHeaders }
      }
    );
  }
  
  try {
    const sk = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
    const mode = getStripeModeFromKey(sk);
    const keyPrefix = sk ? sk.substring(0, 8) + "..." : "none";
    const hasKey = sk.length > 0;
    
    console.info(`🔧 [STRIPE-MODE] Detected mode: ${mode}, keyPrefix: ${keyPrefix}, hasKey: ${hasKey}`);
    
    const response = {
      mode,
      keyPrefix,
      hasKey,
      timestamp: new Date().toISOString()
    };
    
    return new Response(
      JSON.stringify(response), 
      { 
        status: 200, 
        headers: { "content-type": "application/json", ...corsHeaders }
      }
    );
  } catch (error) {
    console.error(`❌ [STRIPE-MODE] Error:`, error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        mode: "unknown",
        hasKey: false
      }), 
      { 
        status: 500, 
        headers: { "content-type": "application/json", ...corsHeaders }
      }
    );
  }
});