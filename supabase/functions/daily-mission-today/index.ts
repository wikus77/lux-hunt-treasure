// © 2025 Joseph MULÉ – M1SSION™ – Mission Cycle Engine (Opzione B)
// Edge Function: daily-mission-today
// Returns official mission_id + day_key for today (UTC). Read-only, no DB writes.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.1";
import { withCors } from "../_shared/cors.ts";

const CYCLE_VERSION = "v1";

// 15 mission IDs — deterministic cycle (epochDay % 15). Includes cipher_drill + word_duel.
const MISSION_CYCLE: string[] = [
  "cipher_drill_anagram_v1",
  "word_duel_memory_v1",
  "signal_pattern_numbers_v1",
  "open_source_intel",
  "urban_riddle",
  "pulse_breaker_challenge",
  "signal_trace",
  "code_fragment",
  "area_observation_lite",
  "pattern_break",
  "chain_of_intel",
  "time_distortion",
  "false_signal",
  "shadow_zone",
  "cipher_decode",
  "memory_matrix",
  "word_puzzle",
];

function getDayKeyUtc(): string {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

function getEpochDay(dayKey: string): number {
  const t = new Date(dayKey + "T00:00:00Z").getTime();
  return Math.floor(t / 86400000);
}

function getMissionIndex(dayKey: string): number {
  const epochDay = getEpochDay(dayKey);
  const idx = epochDay % MISSION_CYCLE.length;
  return idx >= 0 ? idx : idx + MISSION_CYCLE.length;
}

async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ ok: false, error: "method_not_allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ ok: false, error: "unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  if (!url || !anonKey) {
    return new Response(
      JSON.stringify({ ok: false, error: "config_missing" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return new Response(
      JSON.stringify({ ok: false, error: "unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const dayKey = getDayKeyUtc();
  const index = getMissionIndex(dayKey);
  const mission_id = MISSION_CYCLE[index];

  return new Response(
    JSON.stringify({
      ok: true,
      day_key: dayKey,
      mission_id,
      cycle_version: CYCLE_VERSION,
      index,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

serve(withCors(handler));
