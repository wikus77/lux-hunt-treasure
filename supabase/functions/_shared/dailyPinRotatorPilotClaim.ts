// © 2025 Joseph MULÉ – M1SSION™ — Pilot daily mini game pin_rotator_timing (dmg_v1_d01)
// Allowlist-only. Env: DAILY_MINI_GAMES_PILOT_ENABLED=true, optional DAILY_MINI_GAMES_PILOT_EMAILS=comma list.

import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.47.1";

export const PILOT_PIN_ROTATOR_MISSION_ID = "dmg_v1_d01";

const PIN_P1_M1U = 10;
const PIN_P2_M1U = 10;
const PIN_PE = 50;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
};

function isDailyMiniGamesPilotUser(email: string | undefined): boolean {
  if (Deno.env.get("DAILY_MINI_GAMES_PILOT_ENABLED") !== "true") return false;
  if (!email) return false;
  const raw = Deno.env.get("DAILY_MINI_GAMES_PILOT_EMAILS");
  const list = raw
    ? raw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
    : ["wikus77@hotmail.it", "joseph@m1ssion.io"];
  return list.includes(email.toLowerCase());
}

function pinHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function angularDistanceDeg(userAngle: unknown, targetDeg: number): number {
  const x =
    typeof userAngle === "number" && Number.isFinite(userAngle)
      ? userAngle
      : typeof userAngle === "string"
        ? parseFloat(String(userAngle).replace(/,/g, "."))
        : NaN;
  if (!Number.isFinite(x)) return 999;
  const a = ((x % 360) + 360) % 360;
  const b = ((targetDeg % 360) + 360) % 360;
  let d = Math.abs(a - b);
  if (d > 180) d = 360 - d;
  return d;
}

function buildIdempotencyKey(userId: string, dayKey: string, missionId: string, phase: number): string {
  return `${userId}|${dayKey}|${missionId}|${phase}`;
}

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

type Action = "start_phase1" | "complete_phase1" | "start_phase2" | "complete_phase2";

type Admin = SupabaseClient;

async function updateStreakAfterComplete(
  admin: Admin,
  userId: string,
  completedDayKey: string
): Promise<void> {
  function getDayKeyBefore(dayKey: string): string {
    const d = new Date(dayKey + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().slice(0, 10);
  }
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

/** Same-calendar-day phase 2 (unlike cipher/word two-day flow). */
export async function handlePinRotatorPilotClaim(
  mission_id: string,
  action: Action,
  payload: Record<string, unknown>,
  userId: string,
  userEmail: string | undefined,
  dayKey: string,
  admin: Admin
): Promise<Response | null> {
  if (mission_id !== PILOT_PIN_ROTATOR_MISSION_ID) return null;

  if (!isDailyMiniGamesPilotUser(userEmail)) {
    return new Response(JSON.stringify({ ok: false, error: "unknown_mission_id" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const seed = pinHash(dayKey + userId + PILOT_PIN_ROTATOR_MISSION_ID);
  const targetP1 = seed % 360;
  const targetP2 = (seed * 31 + 17) % 360;
  const TOL1 = 22;
  const TOL2 = 12;

  if (action === "start_phase1") {
    const { data: existing } = await admin
      .from("daily_mission_runs")
      .select("id, phase, status, progress_json")
      .eq("user_id", userId)
      .eq("day_key", dayKey)
      .eq("mission_id", mission_id)
      .maybeSingle();

    if (existing) {
      const prog = (existing as RunRow).progress_json as {
        target_p1?: number;
        target_p2?: number;
        tol_p1?: number;
        tol_p2?: number;
      };
      return new Response(
        JSON.stringify({
          ok: true,
          phase: (existing as RunRow).phase,
          status: (existing as RunRow).status,
          progress: {
            target_angle: prog?.target_p1 ?? targetP1,
            tolerance_deg: prog?.tol_p1 ?? TOL1,
          },
          next_available_at: null,
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const progress_json = {
      game: "pin_rotator_timing",
      target_p1: targetP1,
      target_p2: targetP2,
      tol_p1: TOL1,
      tol_p2: TOL2,
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
        progress: { target_angle: targetP1, tolerance_deg: TOL1 },
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
    const prog = r.progress_json as { target_p1?: number; tol_p1?: number };
    const t1 = typeof prog?.target_p1 === "number" ? prog.target_p1 : targetP1;
    const tol1 = typeof prog?.tol_p1 === "number" ? prog.tol_p1 : TOL1;
    const d = angularDistanceDeg(payload?.angle_deg, t1);

    if (r.phase < 1 || r.phase1_completed_at) {
      return new Response(
        JSON.stringify({ ok: true, phase: r.phase, status: r.status, reward_awarded: false, amount: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (d > tol1) {
      return new Response(JSON.stringify({ ok: false, error: "angle_out_of_tolerance" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const nowIso = new Date().toISOString();
    const { error: updateErr } = await admin
      .from("daily_mission_runs")
      .update({
        phase: 2,
        phase1_completed_at: nowIso,
        status: "active",
        progress_json: { ...r.progress_json, submitted_p1: payload?.angle_deg, dist_p1: d },
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
        amount_m1u: PIN_P1_M1U,
        idempotency_key: idempotencyKey,
      });
      if (!claimErr) {
        const { error: creditErr } = await admin.rpc("admin_credit_m1u", {
          p_user_id: userId,
          p_amount: PIN_P1_M1U,
          p_reason: `daily_mission_phase1:${mission_id}:${dayKey}`,
        });
        if (!creditErr) amount = PIN_P1_M1U;
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
    if (!r.phase1_completed_at || r.phase < 2) {
      return new Response(JSON.stringify({ ok: false, error: "phase2_not_unlocked" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const prog = r.progress_json as { target_p2?: number; tol_p2?: number };
    const t2 = typeof prog?.target_p2 === "number" ? prog.target_p2 : targetP2;
    const tol2 = typeof prog?.tol_p2 === "number" ? prog.tol_p2 : TOL2;

    const nowIso = new Date().toISOString();
    await admin
      .from("daily_mission_runs")
      .update({
        phase2_started_at: r.phase2_started_at ?? nowIso,
        updated_at: nowIso,
      })
      .eq("id", r.id);

    return new Response(
      JSON.stringify({
        ok: true,
        phase: 2,
        status: r.status,
        progress: { target_angle: t2, tolerance_deg: tol2 },
        next_available_at: null,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  if (action === "complete_phase2") {
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
    const prog = r.progress_json as { target_p2?: number; tol_p2?: number };
    const t2 = typeof prog?.target_p2 === "number" ? prog.target_p2 : targetP2;
    const tol2 = typeof prog?.tol_p2 === "number" ? prog.tol_p2 : TOL2;
    const d = angularDistanceDeg(payload?.angle_deg, t2);
    const win = d <= tol2;

    const nowIso = new Date().toISOString();
    const { error: updateErr } = await admin
      .from("daily_mission_runs")
      .update({
        phase: 3,
        phase2_started_at: r.phase2_started_at ?? nowIso,
        phase2_completed_at: nowIso,
        status: win ? "completed" : "failed",
        progress_json: {
          ...r.progress_json,
          submitted_p2: payload?.angle_deg,
          dist_p2: d,
          result: win ? "win" : "fail",
        },
        updated_at: nowIso,
      })
      .eq("id", r.id);

    if (updateErr) {
      return new Response(JSON.stringify({ ok: false, error: "update_failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const idempotencyKey = buildIdempotencyKey(userId, dayKey, mission_id, 2);
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
        day_key: dayKey,
        mission_id,
        phase: 2,
        amount_m1u: PIN_P2_M1U,
        idempotency_key: idempotencyKey,
      });
      if (!claimErr) {
        const { error: creditErr } = await admin.rpc("admin_credit_m1u", {
          p_user_id: userId,
          p_amount: PIN_P2_M1U,
          p_reason: `daily_mission_phase2:${mission_id}:${dayKey}`,
        });
        if (!creditErr) amount = PIN_P2_M1U;
        const { error: peErr } = await admin.rpc("award_pulse_energy", {
          p_user_id: userId,
          p_delta_pe: PIN_PE,
          p_reason: "daily_mission",
          p_metadata: {},
        });
        if (!peErr) amountPe = PIN_PE;
        await updateStreakAfterComplete(admin, userId, dayKey);
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
