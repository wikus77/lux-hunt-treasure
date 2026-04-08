// © 2025 Joseph MULÉ – M1SSION™ — claim-daily-phase branch: tactical_tic_tac_toe_v1 (isolated)

import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.47.1";
import {
  buildTicTacToePuzzle,
  GAME_TYPE_TIC_TAC_TOE,
  sanitizeTttProgressForClient,
  TACTICAL_TIC_TAC_TOE_MISSION_ID,
} from "./ticTacToeDaily.ts";

export { GAME_TYPE_TIC_TAC_TOE, TACTICAL_TIC_TAC_TOE_MISSION_ID };

const TTT_P1_M1U = 10;
const TTT_P2_M1U = 10;
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

function parseCellIndex(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isInteger(raw) && raw >= 0 && raw <= 8) {
    return raw;
  }
  if (typeof raw === "string") {
    const n = parseInt(raw.trim(), 10);
    if (!Number.isNaN(n) && n >= 0 && n <= 8) return n;
  }
  return null;
}

export interface TicTacToeClaimContext {
  admin: SupabaseClient;
  userId: string;
  dayKey: string;
  yesterdayKey: string;
  action: Action;
  mission_id: string;
  payload: Record<string, unknown>;
}

/** Returns Response when this handler owns the mission; otherwise null. */
export async function handleTicTacToeDailyClaim(ctx: TicTacToeClaimContext): Promise<Response | null> {
  if (ctx.mission_id !== TACTICAL_TIC_TAC_TOE_MISSION_ID) {
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
      const safe = sanitizeTttProgressForClient(row.progress_json as Record<string, unknown>);
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

    const puzzle = buildTicTacToePuzzle(dayKey, userId, mission_id, "p1");
    const progress_json: Record<string, unknown> = {
      game_type: GAME_TYPE_TIC_TAC_TOE,
      board: puzzle.board,
      correct_cell: puzzle.correct_cell,
      difficulty: puzzle.difficulty,
      board_seed: puzzle.board_seed,
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
        progress: sanitizeTttProgressForClient(progress_json),
        next_available_at: null,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  if (action === "complete_phase1") {
    const chosen = parseCellIndex(payload?.cell);
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

    const prog = r.progress_json as { correct_cell?: number };
    const correct = prog.correct_cell;
    if (typeof correct !== "number" || correct < 0 || correct > 8) {
      return new Response(JSON.stringify({ ok: false, error: "invalid_progress" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (chosen === null) {
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

    if (chosen !== correct) {
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
        amount_m1u: TTT_P1_M1U,
        idempotency_key: idempotencyKey,
      });
      if (!claimErr) {
        const { error: creditErr } = await admin.rpc("admin_credit_m1u", {
          p_user_id: userId,
          p_amount: TTT_P1_M1U,
          p_reason: `daily_mission_phase1:${mission_id}:${dayKey}`,
        });
        if (!creditErr) amount = TTT_P1_M1U;
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
    if (!phase2Payload?.correct_cell) {
      const puzzle = buildTicTacToePuzzle(yesterdayKey, userId, mission_id, "p2");
      phase2Payload = {
        game_type: GAME_TYPE_TIC_TAC_TOE,
        board: puzzle.board,
        correct_cell: puzzle.correct_cell,
        difficulty: puzzle.difficulty,
        board_seed: puzzle.board_seed,
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
        progress: sanitizeTttProgressForClient(phase2Payload),
        next_available_at: null,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  if (action === "complete_phase2") {
    const chosen = parseCellIndex(payload?.cell);
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
    const p2 = merged.phase2 as { correct_cell?: number } | undefined;
    const puzzle = buildTicTacToePuzzle(yesterdayKey, userId, mission_id, "p2");
    const correct = typeof p2?.correct_cell === "number" ? p2.correct_cell : puzzle.correct_cell;

    const win = chosen !== null && chosen === correct;

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
          phase2: { ...(merged.phase2 ?? {}), chosen_cell: chosen, result: win ? "win" : "fail" },
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
        amount_m1u: TTT_P2_M1U,
        idempotency_key: idempotencyKey,
      });
      if (!claimErr) {
        const { error: creditErr } = await admin.rpc("admin_credit_m1u", {
          p_user_id: userId,
          p_amount: TTT_P2_M1U,
          p_reason: `daily_mission_phase2:${mission_id}:${runDayKey}`,
        });
        if (!creditErr) amount = TTT_P2_M1U;
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
