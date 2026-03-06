// © 2026 Joseph MULÉ – M1SSION™ – Wheel server-real (1 spin/day)
// Edge: spin-wheel — action status | spin; idempotent; M1U via admin_credit_m1u; clue from prize_clues.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.1";
import { withCors } from "../_shared/cors.ts";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
};

const SEGMENT_COUNT = 16;
// segment_id 1..16 -> type and value (same as client WHEEL_SEGMENTS)
const SEGMENT_MAP: { type: string; value: number }[] = [
  { type: "m1u", value: 50 },   // 1
  { type: "m1u", value: 5 },    // 2
  { type: "progress", value: 5 }, // 3
  { type: "pe", value: 50 },    // 4
  { type: "m1u", value: 50 },   // 5
  { type: "pe", value: 200 },   // 6
  { type: "pe", value: 100 },   // 7
  { type: "m1u", value: 50 },   // 8
  { type: "progress", value: 10 }, // 9
  { type: "retry", value: 0 },  // 10
  { type: "clue", value: 1 },   // 11
  { type: "m1u", value: 5 },    // 12
  { type: "retry", value: 0 },  // 13
  { type: "progress", value: 15 }, // 14
  { type: "m1u", value: 3 },    // 15
  { type: "m1u", value: 2 },    // 16
];

function getDayKeyUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function simpleHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h = ((h << 5) - h + c) | 0;
  }
  return Math.abs(h);
}

function jsonResp(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResp({ ok: false, error: "method_not_allowed" }, 405);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return jsonResp({ ok: false, error: "unauthorized" }, 401);
  }

  let body: { action?: string; locale?: string } = {};
  try {
    body = await req.json();
  } catch {
    return jsonResp({ ok: false, error: "bad_json" }, 400);
  }

  const action = body.action === "spin" ? "spin" : "status";
  const locale = (body.locale || "it").toLowerCase().slice(0, 2);
  const dayKey = getDayKeyUtc();

  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!url || !serviceKey) {
    return jsonResp({ ok: false, error: "config_missing" }, 500);
  }

  const userClient = createClient(url, anonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) {
    return jsonResp({ ok: false, error: "unauthorized" }, 401);
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  const { data: existing } = await admin
    .from("daily_wheel_runs")
    .select("id, segment_id, reward_type, credited_amount, reward_payload")
    .eq("user_id", user.id)
    .eq("day_key", dayKey)
    .maybeSingle();

  if (existing) {
    return jsonResp({
      ok: true,
      already_spun: true,
      day_key: dayKey,
      segment_id: existing.segment_id,
      reward_type: existing.reward_type,
      credited_amount: existing.credited_amount ?? 0,
      reward_payload: existing.reward_payload ?? {},
    });
  }

  if (action === "status") {
    return jsonResp({
      ok: true,
      already_spun: false,
      day_key: dayKey,
    });
  }

  const seed = `${user.id}|${dayKey}|wheel_v1`;
  const segmentId = (simpleHash(seed) % SEGMENT_COUNT) + 1;
  const seg = SEGMENT_MAP[segmentId - 1];
  let creditedAmount = 0;
  let rewardPayload: Record<string, unknown> = {};

  if (seg.type === "m1u" && seg.value > 0) {
    const { error: creditErr } = await admin.rpc("admin_credit_m1u", {
      p_user_id: user.id,
      p_amount: seg.value,
      p_reason: `wheel:${dayKey}`,
    });
    if (!creditErr) creditedAmount = seg.value;
  }

  if (seg.type === "clue") {
    let activePrizeId: string | null = null;
    const { data: mission } = await admin
      .from("current_mission_data")
      .select("id")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (mission?.id) activePrizeId = mission.id;
    if (!activePrizeId) {
      const { data: prize } = await admin
        .from("prizes")
        .select("id")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (prize?.id) activePrizeId = prize.id;
    }
    if (activePrizeId) {
      const { data: clues } = await admin
        .from("prize_clues")
        .select("id, description_it, clue_text")
        .eq("prize_id", activePrizeId)
        .limit(50);
      const list = clues ?? [];
      if (list.length > 0) {
        const idx = simpleHash(seed + "clue") % list.length;
        const c = list[idx];
        const clueId = c.id;
        const clueText = (c as { description_it?: string; clue_text?: string }).description_it
          ?? (c as { clue_text?: string }).clue_text
          ?? "Indizio sbloccato.";
        rewardPayload = { clue_id: clueId, clue_text: clueText };
      } else {
        rewardPayload = { clue_id: null, clue_text: "Indizio sbloccato." };
      }
    } else {
      rewardPayload = { clue_id: null, clue_text: "Indizio sbloccato." };
    }
  }

  const { error: insertErr } = await admin.from("daily_wheel_runs").insert({
    user_id: user.id,
    day_key: dayKey,
    segment_id: segmentId,
    reward_type: seg.type,
    credited_amount: creditedAmount,
    reward_payload: rewardPayload,
  });

  if (insertErr) {
    console.error("[spin-wheel] insert failed:", insertErr);
    return jsonResp({ ok: false, error: "insert_failed" }, 500);
  }

  return jsonResp({
    ok: true,
    already_spun: false,
    day_key: dayKey,
    segment_id: segmentId,
    reward_type: seg.type,
    credited_amount: creditedAmount,
    reward_payload: rewardPayload,
  });
}

serve(withCors(handler));
