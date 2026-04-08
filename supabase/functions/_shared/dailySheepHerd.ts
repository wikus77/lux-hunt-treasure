// © 2025 Joseph MULÉ – M1SSION™ — Sheep Herd daily: server params + client-safe payload
// Difficulty scales by calendar week-of-month bucket (same cadence as TTT). Timer fixed 120s all weeks.

import { weekSlotFromDayKey, tttHash } from "./ticTacToeDaily.ts";

export const SHEEP_HERD_MISSION_ID = "sheep_herd_v1";
export const GAME_TYPE_SHEEP_HERD = "sheep_herd";

export const SHEEP_HERD_TIME_LIMIT_SEC = 120;
const MAX_DURATION_SLACK_MS = 5000;

/** Win plausibility: reject impossibly fast perfect runs (tunable). */
const MIN_WIN_DURATION_MS = 6000;

export interface SheepHerdTier {
  sheep_total: number;
  required_in_pen: number;
  max_lost: number;
  /** Client physics hints (cosmetic / balance; server validates counts only). */
  scare_radius_mul: number;
  pen_radius_mul: number;
  sheep_speed_mul: number;
}

export function sheepHerdTierForSlot(slot: 0 | 1 | 2 | 3): SheepHerdTier {
  switch (slot) {
    case 0:
      return {
        sheep_total: 5,
        required_in_pen: 5,
        max_lost: 0,
        scare_radius_mul: 0.8,
        pen_radius_mul: 1.2,
        sheep_speed_mul: 0.9,
      };
    case 1:
      return {
        sheep_total: 7,
        required_in_pen: 6,
        max_lost: 1,
        scare_radius_mul: 1,
        pen_radius_mul: 1,
        sheep_speed_mul: 1,
      };
    case 2:
      return {
        sheep_total: 9,
        required_in_pen: 7,
        max_lost: 2,
        scare_radius_mul: 1.14,
        pen_radius_mul: 0.9,
        sheep_speed_mul: 1.08,
      };
    case 3:
    default:
      return {
        sheep_total: 12,
        required_in_pen: 10,
        max_lost: 1,
        scare_radius_mul: 1.22,
        pen_radius_mul: 0.82,
        sheep_speed_mul: 1.12,
      };
  }
}

export function buildSheepHerdSeed(dayKey: string, userId: string, missionId: string, phaseTag: "p1" | "p2"): string {
  const h = tttHash(`${dayKey}|${userId}|${missionId}|${phaseTag}`);
  return h.toString(36).slice(0, 16);
}

export interface SheepHerdFullConfig extends SheepHerdTier {
  seed: string;
  week_index: 1 | 2 | 3 | 4;
  difficulty_level: string;
  time_limit_sec: number;
}

export function buildSheepHerdConfig(
  dayKey: string,
  userId: string,
  missionId: string,
  phaseTag: "p1" | "p2"
): SheepHerdFullConfig {
  const slot = weekSlotFromDayKey(dayKey);
  const tier = sheepHerdTierForSlot(slot);
  return {
    ...tier,
    seed: buildSheepHerdSeed(dayKey, userId, missionId, phaseTag),
    week_index: (slot + 1) as 1 | 2 | 3 | 4,
    difficulty_level: `week_${slot + 1}`,
    time_limit_sec: SHEEP_HERD_TIME_LIMIT_SEC,
  };
}

/** Strip server-only fields for API responses (everything here is safe for client). */
export function sanitizeSheepHerdProgressForClient(p: Record<string, unknown>): Record<string, unknown> {
  const keys = [
    "game_type",
    "seed",
    "week_index",
    "difficulty_level",
    "time_limit_sec",
    "sheep_total",
    "required_in_pen",
    "max_lost",
    "scare_radius_mul",
    "pen_radius_mul",
    "sheep_speed_mul",
  ];
  const out: Record<string, unknown> = {};
  for (const k of keys) {
    if (k in p) out[k] = p[k];
  }
  return out;
}

export function sheepHerdPublicMeta(dayKey: string, userId: string): Record<string, unknown> {
  const slot = weekSlotFromDayKey(dayKey);
  const seed = tttHash(`${dayKey}|${userId}|${SHEEP_HERD_MISSION_ID}|meta`).toString(36).slice(0, 14);
  return {
    game_type: GAME_TYPE_SHEEP_HERD,
    difficulty_level: `week_${slot + 1}`,
    week_index: slot + 1,
    seed,
  };
}

export function maxAllowedDurationMs(): number {
  return SHEEP_HERD_TIME_LIMIT_SEC * 1000 + MAX_DURATION_SLACK_MS;
}

export function validateSheepHerdOutcome(
  progress: Record<string, unknown>,
  payload: Record<string, unknown>
): { ok: boolean; win: boolean; error?: string } {
  const expSeed = progress.seed as string | undefined;
  const sheep_total = progress.sheep_total as number | undefined;
  const required_in_pen = progress.required_in_pen as number | undefined;
  const max_lost = progress.max_lost as number | undefined;
  const expWeek = progress.week_index as number | undefined;

  if (!expSeed || typeof sheep_total !== "number" || typeof required_in_pen !== "number" || typeof max_lost !== "number") {
    return { ok: false, win: false, error: "invalid_progress" };
  }

  const seed = typeof payload.seed === "string" ? payload.seed : "";
  if (seed !== expSeed) {
    return { ok: false, win: false, error: "seed_mismatch" };
  }

  if (Number.isFinite(expWeek) && payload.week_index !== undefined && payload.week_index !== null) {
    const week_index = typeof payload.week_index === "number" ? payload.week_index : Number(payload.week_index);
    if (Number.isFinite(week_index) && week_index !== expWeek) {
      return { ok: false, win: false, error: "week_mismatch" };
    }
  }

  const duration_ms = typeof payload.duration_ms === "number" ? payload.duration_ms : Number(payload.duration_ms);
  if (!Number.isFinite(duration_ms) || duration_ms < 3000 || duration_ms > maxAllowedDurationMs()) {
    return { ok: false, win: false, error: "duration_implausible" };
  }

  const trapped = typeof payload.sheep_trapped === "number" ? payload.sheep_trapped : Number(payload.sheep_trapped);
  const lost = typeof payload.sheep_lost === "number" ? payload.sheep_lost : Number(payload.sheep_lost);
  if (!Number.isInteger(trapped) || !Number.isInteger(lost)) {
    return { ok: false, win: false, error: "bad_counts" };
  }
  if (trapped < 0 || lost < 0 || trapped > sheep_total || lost > sheep_total) {
    return { ok: false, win: false, error: "bad_counts" };
  }
  if (trapped + lost !== sheep_total) {
    return { ok: false, win: false, error: "count_sum" };
  }

  const win = trapped >= required_in_pen && lost <= max_lost;
  if (win && duration_ms < MIN_WIN_DURATION_MS) {
    return { ok: false, win: false, error: "duration_too_fast" };
  }

  return { ok: true, win };
}
