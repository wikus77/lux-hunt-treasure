// © 2025 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
// Push Health Check - READ-ONLY diagnostic endpoint
// deno-lint-ignore-file no-explicit-any

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const ALLOWED_ORIGINS = [
  "https://m1ssion.eu",
  /^https:\/\/.*\.pages\.dev$/,
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const isAllowed = origin && ALLOWED_ORIGINS.some(pattern => 
    typeof pattern === 'string' ? pattern === origin : pattern.test(origin)
  );

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin! : "https://m1ssion.eu",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, apikey, authorization, x-client-info",
    "Vary": "Origin",
  };
}

interface HealthResponse {
  ok: boolean;
  subs_count: number;
  vapid_public_prefix: string;
  last_sent: string | null;
  error?: string;
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get("origin"));

  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  // Only GET allowed
  if (req.method !== "GET") {
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: "method_not_allowed",
        subs_count: 0,
        vapid_public_prefix: "",
        last_sent: null
      } as HealthResponse), 
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Get VAPID public prefix (SAFE - only first 7 chars)
    const vapidPublic = (Deno.env.get("VAPID_PUBLIC_KEY") || "").trim();
    const vapidPrefix = vapidPublic ? `${vapidPublic.slice(0, 7)}…` : "";

    // Initialize Supabase with service role (server-side only)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    });

    // Count active subscriptions
    const { count: subsCount, error: subsError } = await supabase
      .from("webpush_subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    if (subsError) {
      console.error("Error counting subscriptions:", subsError);
      throw new Error("Failed to count subscriptions");
    }

    // Get last sent timestamp (optional - table may not exist)
    let lastSent: string | null = null;
    try {
      const { data: lastData, error: lastError } = await supabase
        .from("auto_push_log")
        .select("sent_at")
        .order("sent_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!lastError && lastData?.sent_at) {
        lastSent = new Date(lastData.sent_at).toISOString();
      }
    } catch (logErr) {
      // Table doesn't exist - ok for health check
      console.warn("auto_push_log table not found (expected in some environments)");
    }

    const response: HealthResponse = {
      ok: true,
      subs_count: subsCount ?? 0,
      vapid_public_prefix: vapidPrefix,
      last_sent: lastSent,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("Push health check error:", err.message);
    
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: "internal_error",
        subs_count: 0,
        vapid_public_prefix: "",
        last_sent: null
      } as HealthResponse), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
