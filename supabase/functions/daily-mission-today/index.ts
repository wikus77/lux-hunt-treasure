// © 2025 Joseph MULÉ – M1SSION™ – Mission Cycle Engine (Opzione B)
// Edge Function: daily-mission-today
// Returns official mission_id + day_key for today (UTC). Read-only, no DB writes.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.1";
import { withCors } from "../_shared/cors.ts";
import {
  GAME_TYPE_NEURO_MATCH,
  NEUROMATCH_MISSION_ID,
  neuroMatchPublicMeta,
} from "../_shared/dailyNeuroMatch.ts";
import {
  GAME_TYPE_SHEEP_HERD,
  SHEEP_HERD_MISSION_ID,
  sheepHerdPublicMeta,
} from "../_shared/dailySheepHerd.ts";
import {
  GAME_TYPE_TIC_TAC_TOE,
  TACTICAL_TIC_TAC_TOE_MISSION_ID,
  tttHash,
  weekSlotFromDayKey,
} from "../_shared/ticTacToeDaily.ts";

const CYCLE_VERSION = "v2";

/** Pilot: pin_rotator_timing — active only when DAILY_MINI_GAMES_PILOT_ENABLED=true and email allowlist. Rollback: unset env or set false. */
const PILOT_MISSION_ID = "dmg_v1_d01";
const PILOT_GAME_TYPE = "pin_rotator_timing";
const PILOT_VARIANT_KEY = "w1_std";
const PILOT_CYCLE_VERSION = "dmg_v1";
const PILOT_CYCLE_DAY_INDEX = 1;

function isDailyMiniGamesPilotUser(email: string | undefined): boolean {
  if (Deno.env.get("DAILY_MINI_GAMES_PILOT_ENABLED") !== "true") return false;
  if (!email) return false;
  const raw = Deno.env.get("DAILY_MINI_GAMES_PILOT_EMAILS");
  const list = raw
    ? raw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
    : ["wikus77@hotmail.it", "joseph@m1ssion.io"];
  return list.includes(email.toLowerCase());
}

/**
 * Allowlist-only QA: force tactical TTT response. Precedence over pin_rotator pilot when both match.
 * Production-safe defaults: flag off → identical behavior; flag on but empty DAILY_TTT_TEST_EMAILS → nobody matches.
 * Rollback: set DAILY_TTT_TEST_ENABLED=false or clear secrets.
 */
function isDailyTttTestAllowlistedUser(email: string | undefined): boolean {
  if (Deno.env.get("DAILY_TTT_TEST_ENABLED") !== "true") return false;
  if (!email) return false;
  const raw = Deno.env.get("DAILY_TTT_TEST_EMAILS");
  if (raw == null || raw.trim() === "") return false;
  const list = raw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  return list.includes(email.toLowerCase());
}

/** Allowlist-only QA: force neuromatch_memory_v1. Precedence above other daily test flags when enabled. */
function isDailyNeuroMatchTestAllowlistedUser(email: string | undefined): boolean {
  if (Deno.env.get("DAILY_NEUROMATCH_TEST_ENABLED") !== "true") return false;
  if (!email) return false;
  const raw = Deno.env.get("DAILY_NEUROMATCH_TEST_EMAILS");
  if (raw == null || raw.trim() === "") return false;
  const list = raw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  return list.includes(email.toLowerCase());
}

/** Allowlist-only QA: force sheep_herd_v1. */
function isDailySheepHerdTestAllowlistedUser(email: string | undefined): boolean {
  if (Deno.env.get("DAILY_SHEEP_HERD_TEST_ENABLED") !== "true") return false;
  if (!email) return false;
  const raw = Deno.env.get("DAILY_SHEEP_HERD_TEST_EMAILS");
  if (raw == null || raw.trim() === "") return false;
  const list = raw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  return list.includes(email.toLowerCase());
}

// Phase 2 — Mission Template System: 7 weekday-based templates, 3 underlying mission_ids (always playable).
// getUTCDay(): 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat.
// Product archetypes: Mon=Intelligence, Tue=Skill, Wed=Field, Thu=Orientation, Fri=Time, Sat=Strategic, Sun=Special.
const MISSION_ID_CIPHER = "cipher_drill_anagram_v1";
const MISSION_ID_WORD_DUEL = "word_duel_memory_v1";
const MISSION_ID_SIGNAL = "signal_pattern_numbers_v1";

type TemplateKey =
  | "intelligence"
  | "skill"
  | "field"
  | "orientation"
  | "time"
  | "strategic"
  | "special";

interface DayTemplate {
  template_key: TemplateKey;
  mission_id: string;
}

function getDayKeyUtc(): string {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

/** Weekday from day_key (UTC). 0=Sun, 1=Mon, ..., 6=Sat. */
function getWeekdayUtc(dayKey: string): number {
  const d = new Date(dayKey + "T00:00:00Z");
  return d.getUTCDay();
}

/** Phase 2: weekday → template_key + mission_id (one of 3 supported). */
function getTemplateForDay(dayKey: string): DayTemplate {
  const w = getWeekdayUtc(dayKey);
  switch (w) {
    case 1:
      return { template_key: "intelligence", mission_id: MISSION_ID_CIPHER };
    case 2:
      return { template_key: "skill", mission_id: MISSION_ID_WORD_DUEL };
    case 3:
      return { template_key: "field", mission_id: MISSION_ID_SIGNAL };
    case 4:
      return { template_key: "orientation", mission_id: MISSION_ID_CIPHER };
    case 5:
      return { template_key: "time", mission_id: MISSION_ID_WORD_DUEL };
    case 6:
      return { template_key: "strategic", mission_id: MISSION_ID_SIGNAL };
    case 0:
    default:
      return { template_key: "special", mission_id: MISSION_ID_CIPHER };
  }
}

/** Phase 3: get Monday (day_key) of the week containing dayKey (UTC, ISO week Mon–Sun). */
function getWeekMondayDayKey(dayKey: string): string {
  const d = new Date(dayKey + "T00:00:00Z");
  const w = d.getUTCDay();
  const daysBack = w === 0 ? 6 : w - 1;
  d.setUTCDate(d.getUTCDate() - daysBack);
  return d.toISOString().slice(0, 10);
}

/** Phase 3: return [mon, mon+1, ..., sun] day_keys for the week containing dayKey. */
function getWeekDayKeys(dayKey: string): string[] {
  const mon = getWeekMondayDayKey(dayKey);
  const out: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(mon + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

/** Previous day_key (UTC). */
function getDayKeyBefore(dayKey: string): string {
  const d = new Date(dayKey + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
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
  let { template_key, mission_id } = getTemplateForDay(dayKey);
  let game_type: string | undefined;
  let variant_key: string | undefined;
  let cycle_day_index: number | undefined;
  let cycle_version_response = CYCLE_VERSION;

  if (isDailyNeuroMatchTestAllowlistedUser(user.email)) {
    mission_id = NEUROMATCH_MISSION_ID;
    template_key = "intelligence";
    game_type = GAME_TYPE_NEURO_MATCH;
    variant_key = undefined;
    cycle_day_index = undefined;
    cycle_version_response = CYCLE_VERSION;
  } else if (isDailySheepHerdTestAllowlistedUser(user.email)) {
    mission_id = SHEEP_HERD_MISSION_ID;
    template_key = "field";
    game_type = GAME_TYPE_SHEEP_HERD;
    variant_key = undefined;
    cycle_day_index = undefined;
    cycle_version_response = CYCLE_VERSION;
  } else if (isDailyTttTestAllowlistedUser(user.email)) {
    mission_id = TACTICAL_TIC_TAC_TOE_MISSION_ID;
    template_key = "strategic";
    game_type = GAME_TYPE_TIC_TAC_TOE;
    variant_key = undefined;
    cycle_day_index = undefined;
    cycle_version_response = CYCLE_VERSION;
  } else if (isDailyMiniGamesPilotUser(user.email)) {
    mission_id = PILOT_MISSION_ID;
    template_key = "intelligence";
    game_type = PILOT_GAME_TYPE;
    variant_key = PILOT_VARIANT_KEY;
    cycle_day_index = PILOT_CYCLE_DAY_INDEX;
    cycle_version_response = PILOT_CYCLE_VERSION;
  }

  const weekday = getWeekdayUtc(dayKey);

  // Phase 3 — Retention: streak, weekly completion, agent status, Sunday reward availability
  const weekKeys = getWeekDayKeys(dayKey);
  const yesterdayKey = getDayKeyBefore(dayKey);
  const isMonday = weekday === 1;
  const [streakRes, runsRes, sundayClaimRes] = await Promise.all([
    supabase.from("daily_mission_streaks").select("current_streak").eq("user_id", user.id).maybeSingle(),
    supabase.from("daily_mission_runs").select("day_key, phase, status").eq("user_id", user.id).in("day_key", weekKeys),
    isMonday
      ? supabase.from("daily_sunday_reward_claims").select("day_key").eq("user_id", user.id).eq("day_key", yesterdayKey).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  const streak = (streakRes.data?.current_streak as number) ?? 0;
  const runs = (runsRes.data ?? []) as { day_key: string; phase: number; status: string }[];
  const completedDayKeys = new Set(runs.filter((r) => r.phase >= 3 && r.status === "completed").map((r) => r.day_key));
  const weekly_completion = weekKeys.map((k) => completedDayKeys.has(k));
  const agent_status = streak >= 1 ? "ACTIVE" : "INACTIVE";
  // Sunday Super Reward: claimable Monday when user completed Sunday's run (phase2 completes next day).
  const yesterdayWeekday = getWeekdayUtc(yesterdayKey);
  const sundayCompleted = yesterdayWeekday === 0 && completedDayKeys.has(yesterdayKey);
  const sundayRewardClaimed = sundayClaimRes.data != null;
  const sunday_reward_available = isMonday && sundayCompleted && !sundayRewardClaimed;
  const sunday_reward_day_key = sunday_reward_available ? yesterdayKey : undefined;

  const body: Record<string, unknown> = {
    ok: true,
    day_key: dayKey,
    mission_id,
    template_key,
    cycle_version: cycle_version_response,
    index: weekday,
    retention: {
      streak,
      week_start: weekKeys[0],
      weekly_completion,
      agent_status,
      sunday_reward_available,
      sunday_reward_day_key,
    },
  };
  if (game_type) {
    body.game_type = game_type;
    body.variant_key = variant_key;
    body.cycle_day_index = cycle_day_index;
  }

  if (mission_id === TACTICAL_TIC_TAC_TOE_MISSION_ID) {
    body.game_type = GAME_TYPE_TIC_TAC_TOE;
    body.difficulty_level = `week_${weekSlotFromDayKey(dayKey) + 1}`;
    body.board_seed = tttHash(`${dayKey}|${user.id}`).toString(36).slice(0, 12);
  }

  if (mission_id === SHEEP_HERD_MISSION_ID) {
    const meta = sheepHerdPublicMeta(dayKey, user.id);
    body.game_type = meta.game_type;
    body.difficulty_level = meta.difficulty_level;
    body.week_index = meta.week_index;
    body.seed = meta.seed;
  }

  if (mission_id === NEUROMATCH_MISSION_ID) {
    const meta = neuroMatchPublicMeta(dayKey, user.id);
    body.game_type = meta.game_type;
    body.difficulty_level = meta.difficulty_level;
    body.week_index = meta.week_index;
    body.seed = meta.seed;
    body.cards_total = meta.cards_total;
    body.pairs_total = meta.pairs_total;
    body.empty_slots = meta.empty_slots;
    body.grid_cols = meta.grid_cols;
    body.grid_rows = meta.grid_rows;
  }

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

serve(withCors(handler));
