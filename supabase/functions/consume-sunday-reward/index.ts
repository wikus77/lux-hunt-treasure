// © 2025 Joseph MULÉ – M1SSION™ – Phase 3 Retention Layer
// Edge Function: consume-sunday-reward
// Consumes the Sunday Super Reward entitlement for the given day_key (once per Sunday, server-side).

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.1";
import { withCors } from "../_shared/cors.ts";

function getWeekdayUtc(dayKey: string): number {
  const d = new Date(dayKey + "T00:00:00Z");
  return d.getUTCDay();
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

  let body: { day_key?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ ok: false, error: "bad_json" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const day_key = body?.day_key;
  if (!day_key || typeof day_key !== "string") {
    return new Response(
      JSON.stringify({ ok: false, error: "missing_day_key" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (getWeekdayUtc(day_key) !== 0) {
    return new Response(
      JSON.stringify({ ok: false, error: "not_sunday" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!url || !anonKey || !serviceKey) {
    return new Response(
      JSON.stringify({ ok: false, error: "config_missing" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const supabaseUser = createClient(url, anonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
  if (userError || !user) {
    return new Response(
      JSON.stringify({ ok: false, error: "unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  const { data: runRow } = await admin
    .from("daily_mission_runs")
    .select("id, phase, status")
    .eq("user_id", user.id)
    .eq("day_key", day_key)
    .limit(1)
    .maybeSingle();

  const completed = runRow && (runRow as { phase: number; status: string }).phase >= 3 && (runRow as { status: string }).status === "completed";
  if (!completed) {
    return new Response(
      JSON.stringify({ ok: false, error: "daily_not_completed" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { data: existing } = await admin
    .from("daily_sunday_reward_claims")
    .select("day_key")
    .eq("user_id", user.id)
    .eq("day_key", day_key)
    .maybeSingle();

  if (existing) {
    return new Response(
      JSON.stringify({ ok: true, consumed: false, already_consumed: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  const { error: insertErr } = await admin.from("daily_sunday_reward_claims").insert({
    user_id: user.id,
    day_key,
    consumed_at: new Date().toISOString(),
  });

  if (insertErr) {
    return new Response(
      JSON.stringify({ ok: false, error: "insert_failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ ok: true, consumed: true }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

serve(withCors(handler));
