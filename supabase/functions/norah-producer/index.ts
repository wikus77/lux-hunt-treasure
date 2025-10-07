// © 2025 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
// Norah AI → Push Templates Producer (NO DIRECT SENDING)
// SAFE MODE: This function only creates push templates from Norah AI content
// Actual push delivery is handled by auto-push-cron

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

// CORS Helper - aligned with push-health
const ALLOW = (o: string | null): boolean =>
  !!o && (o === "https://m1ssion.eu" || /^https:\/\/.*\.pages\.dev$/.test(o));

function getCorsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": ALLOW(origin) ? origin! : "https://m1ssion.eu",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, apikey, authorization, x-cron-secret",
    "Vary": "Origin",
    "Content-Type": "application/json",
  };
}

interface NorahContent {
  id: string;
  title: string;
  content: string;
  created_at: string;
  content_type: string;
}

interface PushTemplate {
  kind: string;
  title: string;
  body: string;
  url: string;
  image_url: string | null;
  weight: number;
  active: boolean;
}

Deno.serve(async (req) => {
  const headers = getCorsHeaders(req.headers.get("origin"));

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  // Only POST allowed
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ ok: false, error: "method_not_allowed" }),
      { status: 405, headers }
    );
  }

  // Verify cron secret
  const cronSecret = req.headers.get("x-cron-secret");
  const expectedSecret = Deno.env.get("CRON_SECRET");

  if (!expectedSecret || cronSecret !== expectedSecret) {
    console.error("[NORAH-PRODUCER] Unauthorized: invalid x-cron-secret");
    return new Response(
      JSON.stringify({ ok: false, error: "unauthorized" }),
      { status: 401, headers }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });

    // Get content from last 24 hours
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    console.log(`[NORAH-PRODUCER] Fetching Norah content since ${since}`);

    // Query ai_generated_clues for recent insights
    const { data: clues, error: fetchError } = await supabase
      .from("ai_generated_clues")
      .select("id, title, content, created_at, content_type")
      .gte("created_at", since)
      .eq("content_type", "insight")
      .order("created_at", { ascending: false })
      .limit(10);

    if (fetchError) {
      console.error("[NORAH-PRODUCER] Error fetching clues:", fetchError);
      throw fetchError;
    }

    if (!clues || clues.length === 0) {
      console.log("[NORAH-PRODUCER] No new Norah content found");
      return new Response(
        JSON.stringify({
          ok: true,
          templates_created: 0,
          message: "no_new_content",
        }),
        { headers }
      );
    }

    console.log(`[NORAH-PRODUCER] Found ${clues.length} Norah insights`);

    // Transform into push templates
    const templates: PushTemplate[] = clues.map((clue: NorahContent) => ({
      kind: "norah_ai",
      title: clue.title || "🤖 Insight da Norah",
      body: (clue.content || "Nuove informazioni disponibili").slice(0, 160),
      url: "/intelligence",
      image_url: null,
      weight: 2, // Medium priority
      active: true,
    }));

    // Insert into auto_push_templates
    const { error: insertError } = await supabase
      .from("auto_push_templates")
      .insert(templates);

    if (insertError) {
      console.error("[NORAH-PRODUCER] Error inserting templates:", insertError);
      throw insertError;
    }

    console.log(`[NORAH-PRODUCER] ✅ Created ${templates.length} push templates`);

    return new Response(
      JSON.stringify({
        ok: true,
        templates_created: templates.length,
        message: `Successfully created ${templates.length} Norah AI push templates`,
      }),
      { headers }
    );
  } catch (error) {
    console.error("[NORAH-PRODUCER] Internal error:", error);
    return new Response(
      JSON.stringify({
        ok: false,
        error: "internal_error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers }
    );
  }
});
