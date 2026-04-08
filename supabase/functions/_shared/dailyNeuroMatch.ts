// © 2025 Joseph MULÉ – M1SSION™ — Neuromatch Memory daily: server board + pragmatic validation
// Weekly layout: W1 9/4+1 empty, W2 12/6, W3 15/7+1 empty, W4 18/9. Timer 120s fixed; mismatch penalty client-only (documented).

import { tttHash, weekSlotFromDayKey } from "./ticTacToeDaily.ts";

export const NEUROMATCH_MISSION_ID = "neuromatch_memory_v1";
export const GAME_TYPE_NEURO_MATCH = "neuro_match";

export const NEURO_TIME_LIMIT_SEC = 120;
export const NEURO_MISMATCH_PENALTY_SEC = 4;
const MAX_DURATION_SLACK_MS = 8000;
const MIN_WIN_DURATION_MS = 5000;

/** Seeded PRNG (mulberry32). */
function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface NeuroWeekLayout {
  cells_total: number;
  pairs_total: number;
  empty_slots: number;
  grid_cols: number;
  grid_rows: number;
}

export function neuroLayoutForSlot(slot: 0 | 1 | 2 | 3): NeuroWeekLayout {
  switch (slot) {
    case 0:
      return { cells_total: 9, pairs_total: 4, empty_slots: 1, grid_cols: 3, grid_rows: 3 };
    case 1:
      return { cells_total: 12, pairs_total: 6, empty_slots: 0, grid_cols: 4, grid_rows: 3 };
    case 2:
      return { cells_total: 15, pairs_total: 7, empty_slots: 1, grid_cols: 5, grid_rows: 3 };
    case 3:
    default:
      return { cells_total: 18, pairs_total: 9, empty_slots: 0, grid_cols: 6, grid_rows: 3 };
  }
}

export function buildNeuroMatchSeed(
  dayKey: string,
  userId: string,
  missionId: string,
  phaseTag: "p1" | "p2"
): string {
  const h = tttHash(`${dayKey}|${userId}|${missionId}|${phaseTag}`);
  return h.toString(36).slice(0, 16);
}

/** Build multiset: each pair id 0..pairs_total-1 twice, plus -1 for each empty slot; shuffle deterministically. */
export function buildNeuroBoardLayout(seed: string, layout: NeuroWeekLayout): number[] {
  const deck: number[] = [];
  for (let i = 0; i < layout.pairs_total; i++) {
    deck.push(i, i);
  }
  for (let e = 0; e < layout.empty_slots; e++) {
    deck.push(-1);
  }
  if (deck.length !== layout.cells_total) {
    throw new Error("[dailyNeuroMatch] deck length mismatch");
  }
  const rng = mulberry32(tttHash(`${seed}|neuro_shuffle`));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = deck[i];
    deck[i] = deck[j];
    deck[j] = tmp;
  }
  return deck;
}

export interface NeuroMatchFullConfig {
  seed: string;
  week_index: 1 | 2 | 3 | 4;
  difficulty_level: string;
  time_limit_sec: number;
  mismatch_penalty_sec: number;
  cards_total: number;
  pairs_total: number;
  empty_slots: number;
  grid_cols: number;
  grid_rows: number;
  board_layout: number[];
}

export function buildNeuroMatchConfig(
  dayKey: string,
  userId: string,
  missionId: string,
  phaseTag: "p1" | "p2"
): NeuroMatchFullConfig {
  const slot = weekSlotFromDayKey(dayKey);
  const layout = neuroLayoutForSlot(slot);
  const seed = buildNeuroMatchSeed(dayKey, userId, missionId, phaseTag);
  const board_layout = buildNeuroBoardLayout(seed, layout);
  return {
    seed,
    week_index: (slot + 1) as 1 | 2 | 3 | 4,
    difficulty_level: `week_${slot + 1}`,
    time_limit_sec: NEURO_TIME_LIMIT_SEC,
    mismatch_penalty_sec: NEURO_MISMATCH_PENALTY_SEC,
    cards_total: layout.cells_total,
    pairs_total: layout.pairs_total,
    empty_slots: layout.empty_slots,
    grid_cols: layout.grid_cols,
    grid_rows: layout.grid_rows,
    board_layout,
  };
}

const CLIENT_PROGRESS_KEYS = [
  "game_type",
  "seed",
  "week_index",
  "difficulty_level",
  "time_limit_sec",
  "mismatch_penalty_sec",
  "cards_total",
  "pairs_total",
  "empty_slots",
  "grid_cols",
  "grid_rows",
  "board_layout",
] as const;

export function sanitizeNeuroMatchProgressForClient(p: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of CLIENT_PROGRESS_KEYS) {
    if (k in p) out[k] = p[k];
  }
  return out;
}

export function neuroMatchPublicMeta(dayKey: string, userId: string): Record<string, unknown> {
  const slot = weekSlotFromDayKey(dayKey);
  const layout = neuroLayoutForSlot(slot);
  const seed = tttHash(`${dayKey}|${userId}|${NEUROMATCH_MISSION_ID}|meta`).toString(36).slice(0, 14);
  return {
    game_type: GAME_TYPE_NEURO_MATCH,
    difficulty_level: `week_${slot + 1}`,
    week_index: slot + 1,
    seed,
    cards_total: layout.cells_total,
    pairs_total: layout.pairs_total,
    empty_slots: layout.empty_slots,
    grid_cols: layout.grid_cols,
    grid_rows: layout.grid_rows,
  };
}

export function maxAllowedNeuroDurationMs(timeLimitSec: number): number {
  return timeLimitSec * 1000 + MAX_DURATION_SLACK_MS;
}

function num(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.trim() !== "") return Number(v);
  return NaN;
}

/**
 * Pragmatic validation: seed/week/counters/duration/moves bounds. Board permutation is fixed in progress_json;
 * client cannot claim win without matched_pairs === pairs_total.
 */
export function validateNeuroMatchOutcome(
  progress: Record<string, unknown>,
  payload: Record<string, unknown>
): { ok: boolean; win: boolean; error?: string } {
  const expSeed = progress.seed as string | undefined;
  const pairs_total = progress.pairs_total as number | undefined;
  const cards_total = progress.cards_total as number | undefined;
  const expWeek = progress.week_index as number | undefined;
  const time_limit_sec =
    typeof progress.time_limit_sec === "number" && Number.isFinite(progress.time_limit_sec)
      ? progress.time_limit_sec
      : NEURO_TIME_LIMIT_SEC;

  if (!expSeed || typeof pairs_total !== "number" || typeof cards_total !== "number") {
    return { ok: false, win: false, error: "invalid_progress" };
  }

  const seed = typeof payload.seed === "string" ? payload.seed : "";
  if (seed !== expSeed) {
    return { ok: false, win: false, error: "seed_mismatch" };
  }

  if (Number.isFinite(expWeek) && payload.week_index != null && payload.week_index !== "") {
    const week_index = num(payload.week_index);
    if (Number.isFinite(week_index) && week_index !== expWeek) {
      return { ok: false, win: false, error: "week_mismatch" };
    }
  }

  const pc = num(payload.cards_total);
  const pp = num(payload.pairs_total);
  if (Number.isFinite(pc) && pc !== cards_total) {
    return { ok: false, win: false, error: "cards_mismatch" };
  }
  if (Number.isFinite(pp) && pp !== pairs_total) {
    return { ok: false, win: false, error: "pairs_mismatch" };
  }

  const duration_ms = num(payload.duration_ms);
  const maxDur = maxAllowedNeuroDurationMs(time_limit_sec);
  if (!Number.isFinite(duration_ms) || duration_ms < 1500 || duration_ms > maxDur) {
    return { ok: false, win: false, error: "duration_implausible" };
  }

  const matched_pairs = num(payload.matched_pairs);
  const moves = num(payload.moves);
  const mismatches = num(payload.mismatches);
  const won = payload.won === true;

  if (!Number.isInteger(matched_pairs) || !Number.isInteger(moves) || !Number.isInteger(mismatches)) {
    return { ok: false, win: false, error: "bad_integers" };
  }
  if (matched_pairs < 0 || matched_pairs > pairs_total) {
    return { ok: false, win: false, error: "matched_bad" };
  }
  if (moves < 0 || moves > cards_total * 50) {
    return { ok: false, win: false, error: "moves_bad" };
  }
  if (mismatches < 0 || mismatches > moves) {
    return { ok: false, win: false, error: "mismatch_bad" };
  }

  if (won && matched_pairs !== pairs_total) {
    return { ok: false, win: false, error: "win_inconsistent" };
  }
  if (!won && matched_pairs >= pairs_total) {
    return { ok: false, win: false, error: "lose_inconsistent" };
  }

  const win = won && matched_pairs === pairs_total;
  if (win) {
    const minMoves = pairs_total * 2;
    if (moves < minMoves) {
      return { ok: false, win: false, error: "moves_too_low" };
    }
    if (duration_ms < MIN_WIN_DURATION_MS) {
      return { ok: false, win: false, error: "duration_too_fast" };
    }
  }

  return { ok: true, win };
}
