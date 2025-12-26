// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
// Edge Function: track_event - Enterprise Landing Telemetry

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Allowlist of valid event names
const ALLOWED_EVENTS = new Set([
  "landing_cta_primary_click",
  "landing_minitest_choice",
  "landing_premium_toggle_open",
  "landing_plan_select",
  "landing_spectator_click",
  "landing_install_click",
  "spectator_page_view",
  "spectator_locked_click",
  "spectator_join_click",
]);

// Rate limit config
const RATE_LIMIT_MAX = 30; // max events
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

// Simple in-memory rate limiter (resets on function cold start)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  entry.count++;
  return true;
}

// Hash IP for privacy (no raw IP stored)
async function hashIP(ip: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + salt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("").substring(0, 16);
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only POST allowed
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    const { event_name, event_data, session_id, path, referrer, user_id } = body;

    // Validate required fields
    if (!event_name || !session_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: event_name, session_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate event name against allowlist
    if (!ALLOWED_EVENTS.has(event_name)) {
      return new Response(
        JSON.stringify({ error: "Invalid event_name" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate event_data size (max 10 keys, no nested objects deeper than 2 levels)
    if (event_data && typeof event_data === "object") {
      if (Object.keys(event_data).length > 10) {
        return new Response(
          JSON.stringify({ error: "event_data too large (max 10 keys)" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Get client IP
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("cf-connecting-ip") || 
                     "unknown";
    
    // Hash IP for privacy
    const ipSalt = Deno.env.get("IP_HASH_SALT") || "m1ssion_default_salt_2025";
    const ipHash = await hashIP(clientIP, ipSalt);

    // Rate limit check (by session_id + ip_hash)
    const rateLimitKey = `${session_id}_${ipHash}`;
    if (!checkRateLimit(rateLimitKey)) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded" }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get User-Agent
    const ua = req.headers.get("user-agent") || "";

    // Get country from Cloudflare header if available
    const country = req.headers.get("cf-ipcountry") || null;

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert event
    const { error } = await supabase.from("landing_events").insert({
      event_name,
      event_data: event_data || {},
      session_id,
      path: path || null,
      referrer: referrer || null,
      ua: ua.substring(0, 500), // Limit UA length
      country,
      user_id: user_id || null,
      ip_hash: ipHash,
    });

    if (error) {
      console.error("Insert error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to track event" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Track event error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

