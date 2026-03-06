// © 2025 Joseph MULÉ – M1SSION™ – Daily Missions Server-Real
// Edge Function: claim-daily-phase
// Actions: start_phase1 | complete_phase1 | start_phase2 | complete_phase2
// Day key computed server-side (UTC). Idempotent claims. M1U via admin_credit_m1u.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.1";
import { withCors } from "../_shared/cors.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
};

function getDayKeyUtc(): string {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

function getYesterdayKeyUtc(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

// Anagram (Idea 1) — word list for server-side generation (EN; can add IT/FR later)
const ANAGRAM_WORDS = [
  "AGENT", "CIPHER", "CODE", "DRILL", "HUNT", "MISSION", "SIGNAL", "TRACE",
  "PULSE", "BUZZ", "CLUE", "MAP", "REWARD", "PHASE", "DAILY",
];

function shuffle(str: string): string {
  const a = str.split("");
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.join("");
}

function buildIdempotencyKey(userId: string, dayKey: string, missionId: string, phase: number): string {
  return `${userId}|${dayKey}|${missionId}|${phase}`;
}

// Reward amounts per phase (Idea 1: 50/50 split of e.g. 20 M1U)
const CIPHER_DRILL_P1_M1U = 10;
const CIPHER_DRILL_P2_M1U = 10;

type Action = "start_phase1" | "complete_phase1" | "start_phase2" | "complete_phase2";

interface RequestBody {
  action: Action;
  mission_id: string;
  payload?: Record<string, unknown>;
  client_day_hint?: string;
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

async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "method_not_allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "bad_json" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const { action, mission_id, payload = {}, client_day_hint } = body;
  if (!action || !mission_id) {
    return new Response(JSON.stringify({ ok: false, error: "missing_action_or_mission_id" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!url || !serviceKey) {
    return new Response(JSON.stringify({ ok: false, error: "config_missing" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const supabaseUser = createClient(url, anonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
  if (userError || !user) {
    return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
  const userId = user.id;

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  const dayKey = getDayKeyUtc();
  const yesterdayKey = getYesterdayKeyUtc();

  if (
    mission_id !== "cipher_drill_anagram_v1" &&
    mission_id !== "word_duel_memory_v1" &&
    mission_id !== "signal_pattern_numbers_v1"
  ) {
    return new Response(JSON.stringify({ ok: false, error: "unknown_mission_id" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  // ─── SIGNAL PATTERN NUMBERS (Daily #3) — 10 M1U only on Phase 2 WIN ───
  const SIGNAL_PATTERN_P2_M1U = 10;

  function simpleHash(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  }

  if (mission_id === "signal_pattern_numbers_v1") {
    const seed = simpleHash(dayKey + userId + mission_id);

    if (action === "start_phase1") {
      const { data: existing } = await admin
        .from("daily_mission_runs")
        .select("id, phase, progress_json")
        .eq("user_id", userId)
        .eq("day_key", dayKey)
        .eq("mission_id", mission_id)
        .maybeSingle();

      if (existing) {
        const prog = (existing as RunRow).progress_json as { sequence_shown?: number[] };
        return new Response(
          JSON.stringify({
            ok: true,
            phase: (existing as RunRow).phase,
            status: (existing as RunRow).status,
            progress: {
              pattern_type: (existing as RunRow).progress_json?.pattern_type,
              sequence_shown: prog?.sequence_shown ?? [],
            },
            next_available_at: null,
          }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const patternType = seed % 3;
      let sequence_shown: number[];
      let expected_next: number;

      if (patternType === 0) {
        const len = 5 + (seed % 4);
        sequence_shown = [1, 1];
        for (let i = 2; i < len; i++) {
          sequence_shown.push(sequence_shown[i - 1] + sequence_shown[i - 2]);
        }
        expected_next = sequence_shown[sequence_shown.length - 1] + sequence_shown[sequence_shown.length - 2];
      } else if (patternType === 1) {
        const start = 1 + (seed % 5);
        const diff = 2 + (seed % 4);
        sequence_shown = [];
        for (let i = 0; i < 6; i++) {
          sequence_shown.push(start + i * diff);
        }
        expected_next = start + 6 * diff;
      } else {
        const start = 1 + (seed % 3);
        const ratio = 2 + (seed % 2);
        sequence_shown = [];
        let v = start;
        for (let i = 0; i < 5; i++) {
          sequence_shown.push(v);
          v *= ratio;
        }
        expected_next = v;
      }

      const progress = {
        pattern_type: patternType === 0 ? "fibonacci" : patternType === 1 ? "arith" : "geom",
        sequence_shown,
        expected_next,
      };

      const { error: insertErr } = await admin
        .from("daily_mission_runs")
        .insert({
          user_id: userId,
          day_key: dayKey,
          mission_id,
          phase: 1,
          phase1_started_at: new Date().toISOString(),
          progress_json: progress,
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
          progress: { pattern_type: progress.pattern_type, sequence_shown },
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
      if (r.phase < 1 || r.phase1_completed_at) {
        return new Response(
          JSON.stringify({ ok: true, phase: r.phase, status: r.status, reward_awarded: false, amount: 0 }),
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

      return new Response(
        JSON.stringify({
          ok: true,
          phase: 2,
          status: "active",
          reward_awarded: false,
          amount: 0,
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

      const prog = prevRun.progress_json as { sequence_shown?: number[]; expected_next?: number };
      return new Response(
        JSON.stringify({
          ok: true,
          phase: 2,
          status: prevRun.status,
          progress: { sequence_shown: prog?.sequence_shown ?? [] },
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

      const prog = prevRun.progress_json as { expected_next?: number };
      const expectedNext = prog?.expected_next;
      const userAnswerRaw = payload?.answer;
      const userAnswer =
        typeof userAnswerRaw === "number"
          ? userAnswerRaw
          : typeof userAnswerRaw === "string"
            ? parseInt(userAnswerRaw.trim().replace(/\D/g, ""), 10)
            : NaN;
      const isValid = !Number.isNaN(userAnswer) && Number.isFinite(userAnswer);
      const win = isValid && expectedNext !== undefined && userAnswer === expectedNext;

      const runId = prevRun.id;
      const { error: updateErr } = await admin
        .from("daily_mission_runs")
        .update({
          phase: 3,
          phase2_started_at: prevRun.phase2_started_at ?? new Date().toISOString(),
          phase2_completed_at: new Date().toISOString(),
          status: win ? "completed" : "failed",
          progress_json: { ...prevRun.progress_json, userAnswer: payload?.answer, result: win ? "win" : "fail" },
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
      if (win && !existingClaim) {
        const { error: claimErr } = await admin.from("daily_mission_claims").insert({
          user_id: userId,
          day_key: runDayKey,
          mission_id,
          phase: 2,
          amount_m1u: SIGNAL_PATTERN_P2_M1U,
          idempotency_key: idempotencyKey,
        });
        if (!claimErr) {
          const { error: creditErr } = await admin.rpc("admin_credit_m1u", {
            p_user_id: userId,
            p_amount: SIGNAL_PATTERN_P2_M1U,
            p_reason: `daily_mission_phase2:${mission_id}:${runDayKey}`,
          });
          if (!creditErr) amount = SIGNAL_PATTERN_P2_M1U;
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

  // ─── WORD DUEL MEMORY (Daily #2) ───────────────────────────────────────
  const WORD_DUEL_P1_M1U = 10;
  const WORD_DUEL_P2_M1U = 10;
  const WORD_DUEL_WORDS = [
    "AGENT", "CIPHER", "CODE", "DRILL", "HUNT", "SIGNAL", "TRACE", "PULSE",
    "BUZZ", "CLUE", "MAP", "REWARD", "PHASE", "DAILY", "WORD", "DUEL", "MEMORY",
    "ROUND", "CHOICE", "SAVE", "INPUT", "WIN", "FAIL",
  ];

  function simpleHash(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  }

  function seededShuffle<T>(arr: T[], seed: number): T[] {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      const j = seed % (i + 1);
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  if (mission_id === "word_duel_memory_v1") {
    const seed = simpleHash(dayKey + userId);

    if (action === "start_phase1") {
      const { data: existing } = await admin
        .from("daily_mission_runs")
        .select("id, phase, progress_json")
        .eq("user_id", userId)
        .eq("day_key", dayKey)
        .eq("mission_id", mission_id)
        .maybeSingle();

      if (existing) {
        const prog = (existing as RunRow).progress_json as { rounds?: { round: number; left: string; right: string }[] };
        const rounds = prog?.rounds ?? [];
        return new Response(
          JSON.stringify({
            ok: true,
            phase: (existing as RunRow).phase,
            status: (existing as RunRow).status,
            progress: { rounds: rounds.map((r: { round: number; left: string; right: string }) => ({ round: r.round, left: r.left, right: r.right })) },
            next_available_at: null,
          }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const indices = Array.from({ length: WORD_DUEL_WORDS.length }, (_, i) => i);
      const shuffled = seededShuffle(indices, seed);
      const rounds: { round: number; left: string; right: string; correct: "left" | "right" }[] = [];
      for (let r = 0; r < 5; r++) {
        const i = shuffled[r * 2];
        const j = shuffled[r * 2 + 1];
        const left = WORD_DUEL_WORDS[i];
        const right = WORD_DUEL_WORDS[j];
        const correctSide: "left" | "right" = (seed + r) % 2 === 0 ? "left" : "right";
        rounds.push({ round: r + 1, left, right, correct: correctSide });
      }

      const progress = {
        rounds,
        savedWords: [] as string[],
        memorization: { durationSec: 60, startedAtUtc: null as string | null, endsAtUtc: null as string | null, completed: false },
      };

      const { data: inserted, error: insertErr } = await admin
        .from("daily_mission_runs")
        .insert({
          user_id: userId,
          day_key: dayKey,
          mission_id,
          phase: 1,
          phase1_started_at: new Date().toISOString(),
          progress_json: progress,
          status: "active",
          updated_at: new Date().toISOString(),
        })
        .select("id, phase, progress_json")
        .single();

      if (insertErr) {
        return new Response(JSON.stringify({ ok: false, error: "insert_failed" }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      const safeRounds = rounds.map((r) => ({ round: r.round, left: r.left, right: r.right }));
      return new Response(
        JSON.stringify({
          ok: true,
          phase: 1,
          status: "active",
          progress: { rounds: safeRounds },
          next_available_at: null,
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (action === "complete_phase1") {
      const choices = (payload?.choices as { round: number; choice: "left" | "right" }[]) ?? [];
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
      if (r.phase < 1 || r.phase1_completed_at) {
        return new Response(
          JSON.stringify({ ok: true, phase: r.phase, status: r.status, reward_awarded: false, amount: 0 }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const prog = r.progress_json as { rounds: { round: number; left: string; right: string; correct: "left" | "right" }[]; savedWords: string[] };
      const savedWords: string[] = [];
      for (let i = 0; i < (prog?.rounds ?? []).length; i++) {
        const round = prog.rounds[i];
        const choice = choices.find((c) => c.round === round.round)?.choice;
        if (choice && round.correct === choice) {
          savedWords.push(choice === "left" ? round.left : round.right);
        }
      }

      const nowIso = new Date().toISOString();
      const progressUpdated = {
        ...prog,
        savedWords,
        memorization: {
          durationSec: 60,
          startedAtUtc: nowIso,
          endsAtUtc: new Date(Date.now() + 60 * 1000).toISOString(),
          completed: true,
        },
      };

      const { error: updateErr } = await admin
        .from("daily_mission_runs")
        .update({
          phase: 2,
          phase1_completed_at: nowIso,
          progress_json: progressUpdated,
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
          amount_m1u: WORD_DUEL_P1_M1U,
          idempotency_key: idempotencyKey,
        });
        if (!claimErr) {
          const { error: creditErr } = await admin.rpc("admin_credit_m1u", {
            p_user_id: userId,
            p_amount: WORD_DUEL_P1_M1U,
            p_reason: `daily_mission_phase1:${mission_id}:${dayKey}`,
          });
          if (!creditErr) amount = WORD_DUEL_P1_M1U;
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
          savedWords,
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

      return new Response(
        JSON.stringify({
          ok: true,
          phase: 2,
          status: prevRun.status,
          progress: {},
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

      const prog = prevRun.progress_json as { savedWords?: string[] };
      const savedWords: string[] = Array.isArray(prog?.savedWords) ? prog.savedWords : [];
      const expectedAnswer = savedWords.join(" ");
      const userAnswer = String(payload?.answer ?? "").trim().replace(/\s+/g, " ").toLowerCase();
      const expectedNorm = expectedAnswer.trim().replace(/\s+/g, " ").toLowerCase();
      const win = expectedNorm === userAnswer;

      const runId = prevRun.id;
      const { error: updateErr } = await admin
        .from("daily_mission_runs")
        .update({
          phase: 3,
          phase2_started_at: prevRun.phase2_started_at ?? new Date().toISOString(),
          phase2_completed_at: new Date().toISOString(),
          status: win ? "completed" : "failed",
          progress_json: { ...prevRun.progress_json, userAnswer, result: win ? "win" : "fail" },
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
      const shouldCredit = win && savedWords.length > 0;
      if (shouldCredit && !existingClaim) {
        const { error: claimErr } = await admin.from("daily_mission_claims").insert({
          user_id: userId,
          day_key: runDayKey,
          mission_id,
          phase: 2,
          amount_m1u: WORD_DUEL_P2_M1U,
          idempotency_key: idempotencyKey,
        });
        if (!claimErr) {
          const { error: creditErr } = await admin.rpc("admin_credit_m1u", {
            p_user_id: userId,
            p_amount: WORD_DUEL_P2_M1U,
            p_reason: `daily_mission_phase2:${mission_id}:${runDayKey}`,
          });
          if (!creditErr) amount = WORD_DUEL_P2_M1U;
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

  // ─── CIPHER DRILL (Daily #1) ───────────────────────────────────────────
  // ─── start_phase1 ─────────────────────────────────────────────────────
  if (action === "start_phase1") {
    const { data: existing } = await admin
      .from("daily_mission_runs")
      .select("id, phase, progress_json")
      .eq("user_id", userId)
      .eq("day_key", dayKey)
      .eq("mission_id", mission_id)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({
          ok: true,
          phase: existing.phase,
          status: (existing as RunRow).status,
          progress: (existing as RunRow).progress_json,
          next_available_at: null,
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const targetWord = ANAGRAM_WORDS[Math.floor(Math.random() * ANAGRAM_WORDS.length)];
    const anagram = shuffle(targetWord);
    const progress = {
      mission_type: "anagram",
      targetWord,
      anagram,
      locale: "en",
      attempt_count: 0,
      max_attempts: 1,
    };

    const { data: inserted, error: insertErr } = await admin
      .from("daily_mission_runs")
      .insert({
        user_id: userId,
        day_key: dayKey,
        mission_id,
        phase: 1,
        phase1_started_at: new Date().toISOString(),
        progress_json: progress,
        status: "active",
        updated_at: new Date().toISOString(),
      })
      .select("id, phase, progress_json")
      .single();

    if (insertErr) {
      console.error("[claim-daily-phase] start_phase1 insert error:", insertErr);
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
        progress: { anagram, locale: "en" },
        next_available_at: null,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  // ─── complete_phase1 ──────────────────────────────────────────────────
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
    if (r.phase < 1 || r.phase1_completed_at) {
      return new Response(
        JSON.stringify({ ok: true, phase: r.phase, status: r.status, reward_awarded: false, amount: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { error: updateErr } = await admin
      .from("daily_mission_runs")
      .update({
        phase: 2,
        phase1_completed_at: new Date().toISOString(),
        status: "active",
        updated_at: new Date().toISOString(),
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
        amount_m1u: CIPHER_DRILL_P1_M1U,
        idempotency_key: idempotencyKey,
      });
      if (!claimErr) {
        const { error: creditErr } = await admin.rpc("admin_credit_m1u", {
          p_user_id: userId,
          p_amount: CIPHER_DRILL_P1_M1U,
          p_reason: `daily_mission_phase1:${mission_id}:${dayKey}`,
        });
        if (!creditErr) amount = CIPHER_DRILL_P1_M1U;
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

  // ─── start_phase2 ──────────────────────────────────────────────────────
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

    return new Response(
      JSON.stringify({
        ok: true,
        phase: 2,
        status: prevRun.status,
        progress: { anagram: prevRun.progress_json?.anagram },
        next_available_at: null,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  // ─── complete_phase2 ───────────────────────────────────────────────────
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

    const runDayKey = prevRun.day_key;
    const targetWord = (prevRun.progress_json?.targetWord as string) ?? "";
    const answer = (payload?.answer as string) ?? "";
    const normalizedAnswer = answer.trim().toUpperCase();
    const win = targetWord.toUpperCase() === normalizedAnswer;

    const runId = prevRun.id;
    const { error: updateErr } = await admin
      .from("daily_mission_runs")
      .update({
        phase: 3,
        phase2_started_at: prevRun.phase2_started_at ?? new Date().toISOString(),
        phase2_completed_at: new Date().toISOString(),
        status: win ? "completed" : "failed",
        progress_json: { ...prevRun.progress_json, attempt_count: ((prevRun.progress_json?.attempt_count as number) ?? 0) + 1 },
        updated_at: new Date().toISOString(),
      })
      .eq("id", runId);

    if (updateErr) {
      return new Response(JSON.stringify({ ok: false, error: "update_failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const idempotencyKey = buildIdempotencyKey(userId, runDayKey, mission_id, 2);
    const { data: existingClaim } = await admin
      .from("daily_mission_claims")
      .select("id, amount_m1u")
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();

    let amount = 0;
    if (win && !existingClaim) {
      const { error: claimErr } = await admin.from("daily_mission_claims").insert({
        user_id: userId,
        day_key: runDayKey,
        mission_id,
        phase: 2,
        amount_m1u: CIPHER_DRILL_P2_M1U,
        idempotency_key: idempotencyKey,
      });
      if (!claimErr) {
        const { error: creditErr } = await admin.rpc("admin_credit_m1u", {
          p_user_id: userId,
          p_amount: CIPHER_DRILL_P2_M1U,
          p_reason: `daily_mission_phase2:${mission_id}:${runDayKey}`,
        });
        if (!creditErr) amount = CIPHER_DRILL_P2_M1U;
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

serve(withCors(handler));
