// © 2025 Joseph MULÉ – M1SSION™ — claim-daily-phase branch: sheep_herd_v1 (isolated)

import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.47.1";
import {
  buildSheepHerdConfig,
  GAME_TYPE_SHEEP_HERD,
  sanitizeSheepHerdProgressForClient,
  SHEEP_HERD_MISSION_ID,
  validateSheepHerdOutcome,
} from "./dailySheepHerd.ts";

export { GAME_TYPE_SHEEP_HERD, SHEEP_HERD_MISSION_ID };

const SH_P1_M1U = 10;
const SH_P2_M1U = 10;
const DAILY_MISSION_PE = 50;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
};

type Action = "start_phase1" | "complete_phase1" | "start_phase2" | "complete_phase2";

interface RunRow {
  id: string;
  user_id: string;
  day_key: string;
  mission_id: string;
  phase: number;
  phase1_started_at: string | null;
  phase1_completed_at: string | null;
  phase2_started_at: string | null;
  phase2_completed_at: string | null;
  progress_json: Record<string, unknown>;
  status: string;
}

function buildIdempotencyKey(userId: string, dayKey: string, missionId: string, phase: number): string {
  return `${userId}|${dayKey}|${missionId}|${phase}`;
}

function getDayKeyBefore(dayKey: string): string {
  const d = new Date(dayKey + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

async function updateStreakAfterComplete(
  admin: SupabaseClient,
  userId: string,
  completedDayKey: string
): Promise<void> {
  const dayBefore = getDayKeyBefore(completedDayKey);
  const { data: row } = await admin
    .from("daily_mission_streaks")
    .select("current_streak, last_completed_day_key")
    .eq("user_id", userId)
    .maybeSingle();
  const currentStreak = (row?.current_streak as number) ?? 0;
  const lastKey = (row?.last_completed_day_key as string) ?? null;
  const newStreak = lastKey === dayBefore ? currentStreak + 1 : 1;
  const nowIso = new Date().toISOString();
  await admin.from("daily_mission_streaks").upsert(
    {
      user_id: userId,
      last_completed_day_key: completedDayKey,
      current_streak: newStreak,
      updated_at: nowIso,
    },
    { onConflict: "user_id" }
  );
}

export interface SheepHerdClaimContext {
  admin: SupabaseClient;
  userId: string;
  dayKey: string;
  yesterdayKey: string;
  action: Action;
  mission_id: string;
  payload: Record<string, unknown>;
}

export async function handleSheepHerdDailyClaim(ctx: SheepHerdClaimContext): Promise<Response | null> {
  if (ctx.mission_id !== SHEEP_HERD_MISSION_ID) {
    return null;
  }

  const { admin, userId, dayKey, yesterdayKey, action, mission_id, payload } = ctx;

  if (action === "start_phase1") {
    const { data: existing } = await admin
      .from("daily_mission_runs")
      .select("id, phase, status, progress_json")
      .eq("user_id", userId)
      .eq("day_key", dayKey)
      .eq("mission_id", mission_id)
      .maybeSingle();

    if (existing) {
      const row = existing as RunRow;
      const safe = sanitizeSheepHerdProgressForClient(row.progress_json as Record<string, unknown>);
      return new Response(
        JSON.stringify({
          ok: true,
          phase: row.phase,
          status: row.status,
          progress: safe,
          next_available_at: null,
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const cfg = buildSheepHerdConfig(dayKey, userId, mission_id, "p1");
    const progress_json: Record<string, unknown> = {
      game_type: GAME_TYPE_SHEEP_HERD,
      seed: cfg.seed,
      week_index: cfg.week_index,
      difficulty_level: cfg.difficulty_level,
      time_limit_sec: cfg.time_limit_sec,
      sheep_total: cfg.sheep_total,
      required_in_pen: cfg.required_in_pen,
      max_lost: cfg.max_lost,
      scare_radius_mul: cfg.scare_radius_mul,
      pen_radius_mul: cfg.pen_radius_mul,
      sheep_speed_mul: cfg.sheep_speed_mul,
    };

    const { error: insertErr } = await admin.from("daily_mission_runs").insert({
      user_id: userId,
      day_key: dayKey,
      mission_id,
      phase: 1,
      phase1_started_at: new Date().toISOString(),
      progress_json,
      status: "active",
      updated_at: new Date().toISOString(),
    });

    if (insertErr) {
      return new Response(JSON.stringify({ ok: false, error: "insert_failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(
      JSON.stringify({
        ok: true,
        phase: 1,
        status: "active",
        progress: sanitizeSheepHerdProgressForClient(progress_json),
        next_available_at: null,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  if (action === "complete_phase1") {
    const { data: run, error: runErr } = await admin
      .from("daily_mission_runs")
      .select("*")
      .eq("user_id", userId)
      .eq("day_key", dayKey)
      .eq("mission_id", mission_id)
      .maybeSingle();

    if (runErr || !run) {
      return new Response(JSON.stringify({ ok: false, error: "run_not_found" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    const r = run as RunRow;
    if (r.phase1_completed_at) {
      return new Response(
        JSON.stringify({ ok: true, phase: r.phase, status: r.status, reward_awarded: false, amount: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const prog = r.progress_json as Record<string, unknown>;
    const v = validateSheepHerdOutcome(prog, payload);
    if (!v.ok) {
      return new Response(
        JSON.stringify({
          ok: true,
          phase: 1,
          status: "active",
          result: "fail",
          reward_awarded: false,
          amount: 0,
          error: v.error ?? "validation_failed",
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!v.win) {
      const nowIso = new Date().toISOString();
      await admin
        .from("daily_mission_runs")
        .update({
          phase: 1,
          status: "active",
          progress_json: { ...prog, last_attempt: payload, last_result: "fail" },
          updated_at: nowIso,
        })
        .eq("id", r.id);
      return new Response(
        JSON.stringify({
          ok: true,
          phase: 1,
          status: "active",
          result: "fail",
          reward_awarded: false,
          amount: 0,
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const nowIso = new Date().toISOString();
    const { error: updateErr } = await admin
      .from("daily_mission_runs")
      .update({
        phase: 2,
        phase1_completed_at: nowIso,
        status: "active",
        progress_json: { ...prog, last_attempt: payload, last_result: "win" },
        updated_at: nowIso,
      })
      .eq("id", r.id);

    if (updateErr) {
      return new Response(JSON.stringify({ ok: false, error: "update_failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const idempotencyKey = buildIdempotencyKey(userId, dayKey, mission_id, 1);
    const { data: existingClaim } = await admin
      .from("daily_mission_claims")
      .select("id, amount_m1u")
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();

    let amount = 0;
    if (!existingClaim) {
      const { error: claimErr } = await admin.from("daily_mission_claims").insert({
        user_id: userId,
        day_key: dayKey,
        mission_id,
        phase: 1,
        amount_m1u: SH_P1_M1U,
        idempotency_key: idempotencyKey,
      });
      if (!claimErr) {
        const { error: creditErr } = await admin.rpc("admin_credit_m1u", {
          p_user_id: userId,
          p_amount: SH_P1_M1U,
          p_reason: `daily_mission_phase1:${mission_id}:${dayKey}`,
        });
        if (!creditErr) amount = SH_P1_M1U;
      }
    } else {
      amount = (existingClaim as { amount_m1u: number }).amount_m1u;
    }

    return new Response(
      JSON.stringify({
        ok: true,
        phase: 2,
        status: "active",
        reward_awarded: amount > 0,
        amount,
        result: "win",
        next_available_at: null,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  if (action === "start_phase2") {
    const { data: runYesterday } = await admin
      .from("daily_mission_runs")
      .select("*")
      .eq("user_id", userId)
      .eq("day_key", yesterdayKey)
      .eq("mission_id", mission_id)
      .maybeSingle();

    const prevRun = runYesterday as RunRow | null;
    if (!prevRun || !prevRun.phase1_completed_at) {
      return new Response(JSON.stringify({ ok: false, error: "phase2_not_unlocked" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (prevRun.phase2_completed_at != null || (prevRun.phase ?? 0) >= 3) {
      return new Response(JSON.stringify({ ok: false, error: "phase2_already_done" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const merged = prevRun.progress_json as { phase2?: Record<string, unknown> };
    let phase2Payload = merged.phase2 as Record<string, unknown> | undefined;
    if (!phase2Payload?.seed) {
      const cfg = buildSheepHerdConfig(yesterdayKey, userId, mission_id, "p2");
      phase2Payload = {
        game_type: GAME_TYPE_SHEEP_HERD,
        seed: cfg.seed,
        week_index: cfg.week_index,
        difficulty_level: cfg.difficulty_level,
        time_limit_sec: cfg.time_limit_sec,
        sheep_total: cfg.sheep_total,
        required_in_pen: cfg.required_in_pen,
        max_lost: cfg.max_lost,
        scare_radius_mul: cfg.scare_radius_mul,
        pen_radius_mul: cfg.pen_radius_mul,
        sheep_speed_mul: cfg.sheep_speed_mul,
      };
      const nowIso = new Date().toISOString();
      await admin
        .from("daily_mission_runs")
        .update({
          phase2_started_at: prevRun.phase2_started_at ?? nowIso,
          progress_json: { ...(prevRun.progress_json as object), phase2: phase2Payload },
          updated_at: nowIso,
        })
        .eq("id", prevRun.id);
    }

    return new Response(
      JSON.stringify({
        ok: true,
        phase: 2,
        status: prevRun.status,
        progress: sanitizeSheepHerdProgressForClient(phase2Payload),
        next_available_at: null,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  if (action === "complete_phase2") {
    const { data: runYesterday } = await admin
      .from("daily_mission_runs")
      .select("*")
      .eq("user_id", userId)
      .eq("day_key", yesterdayKey)
      .eq("mission_id", mission_id)
      .maybeSingle();

    const prevRun = runYesterday as RunRow | null;
    if (!prevRun) {
      return new Response(JSON.stringify({ ok: false, error: "run_not_found" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (prevRun.phase2_completed_at) {
      const win = prevRun.status === "completed";
      const idempotencyKeyDone = buildIdempotencyKey(userId, prevRun.day_key, mission_id, 2);
      const { data: existingClaimDone } = await admin
        .from("daily_mission_claims")
        .select("id, amount_m1u")
        .eq("idempotency_key", idempotencyKeyDone)
        .maybeSingle();
      const amountPrev = (existingClaimDone as { amount_m1u?: number } | null)?.amount_m1u ?? 0;
      return new Response(
        JSON.stringify({
          ok: true,
          phase: 3,
          status: prevRun.status,
          reward_awarded: false,
          amount: amountPrev,
          amount_pe: 0,
          result: win ? "win" : "fail",
          next_available_at: null,
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const merged = prevRun.progress_json as { phase2?: Record<string, unknown> };
    const p2 = merged.phase2 as Record<string, unknown> | undefined;
    if (!p2?.seed) {
      return new Response(JSON.stringify({ ok: false, error: "phase2_not_started" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const v = validateSheepHerdOutcome(p2, payload);
    const win = v.ok && v.win;

    const runId = prevRun.id;
    const { error: updateErr } = await admin
      .from("daily_mission_runs")
      .update({
        phase: 3,
        phase2_started_at: prevRun.phase2_started_at ?? new Date().toISOString(),
        phase2_completed_at: new Date().toISOString(),
        status: win ? "completed" : "failed",
        progress_json: {
          ...prevRun.progress_json,
          phase2: { ...(merged.phase2 ?? {}), last_attempt: payload, last_result: win ? "win" : "fail" },
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", runId);

    if (updateErr) {
      return new Response(JSON.stringify({ ok: false, error: "update_failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const runDayKey = prevRun.day_key;
    const idempotencyKey = buildIdempotencyKey(userId, runDayKey, mission_id, 2);
    const { data: existingClaim } = await admin
      .from("daily_mission_claims")
      .select("id, amount_m1u")
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();

    let amount = 0;
    let amountPe = 0;
    if (win && !existingClaim) {
      const { error: claimErr } = await admin.from("daily_mission_claims").insert({
        user_id: userId,
        day_key: runDayKey,
        mission_id,
        phase: 2,
        amount_m1u: SH_P2_M1U,
        idempotency_key: idempotencyKey,
      });
      if (!claimErr) {
        const { error: creditErr } = await admin.rpc("admin_credit_m1u", {
          p_user_id: userId,
          p_amount: SH_P2_M1U,
          p_reason: `daily_mission_phase2:${mission_id}:${runDayKey}`,
        });
        if (!creditErr) amount = SH_P2_M1U;
        const { error: peErr } = await admin.rpc("award_pulse_energy", {
          p_user_id: userId,
          p_delta_pe: DAILY_MISSION_PE,
          p_reason: "daily_mission",
          p_metadata: {},
        });
        if (!peErr) amountPe = DAILY_MISSION_PE;
        if (win) await updateStreakAfterComplete(admin, userId, runDayKey);
      }
    } else if (existingClaim) {
      amount = (existingClaim as { amount_m1u: number }).amount_m1u;
    }

    return new Response(
      JSON.stringify({
        ok: true,
        phase: 3,
        status: win ? "completed" : "failed",
        reward_awarded: amount > 0,
        amount,
        amount_pe: amountPe,
        result: win ? "win" : "fail",
        next_available_at: null,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  return new Response(JSON.stringify({ ok: false, error: "invalid_action" }), {
    status: 400,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}
