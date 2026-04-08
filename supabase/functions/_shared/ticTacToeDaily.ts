// © 2025 Joseph MULÉ – M1SSION™ — Tactical Tic-Tac-Toe daily puzzle (server-only truth)
// Deterministic puzzles: unique "win now for X" or "block O" move. No client trust.

export const TACTICAL_TIC_TAC_TOE_MISSION_ID = "tactical_tic_tac_toe_v1";
export const GAME_TYPE_TIC_TAC_TOE = "tic_tac_toe";

export type TttCell = "X" | "O" | null;
export type TttBoard = TttCell[];

const LINES: readonly (readonly [number, number, number])[] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function tttHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Calendar week-of-month bucket 0..3 (difficulty ramps by week, not within a single day). */
export function weekSlotFromDayKey(dayKey: string): 0 | 1 | 2 | 3 {
  const d = new Date(dayKey + "T12:00:00Z");
  const dom = d.getUTCDate();
  return Math.min(3, Math.floor((dom - 1) / 7)) as 0 | 1 | 2 | 3;
}

function lineWinningEmpty(board: TttBoard, player: "X" | "O"): number[] {
  const out: number[] = [];
  for (const [a, b, c] of LINES) {
    const marks = [board[a], board[b], board[c]].filter((v) => v === player).length;
    const empties = [a, b, c].filter((i) => board[i] === null);
    if (marks === 2 && empties.length === 1) {
      out.push(empties[0]);
    }
  }
  return [...new Set(out)];
}

/** Unique immediate win for X, else unique required block vs O; else null (not a valid daily puzzle). */
export function uniqueTacticalMove(board: TttBoard): number | null {
  const xWins = lineWinningEmpty(board, "X");
  if (xWins.length === 1) return xWins[0];
  if (xWins.length > 1) return null;
  const oThreats = lineWinningEmpty(board, "O");
  if (oThreats.length === 1) return oThreats[0];
  return null;
}

function assertPool(label: string, boards: TttBoard[]): void {
  for (let i = 0; i < boards.length; i++) {
    const u = uniqueTacticalMove(boards[i]);
    if (u === null || boards[i][u] !== null) {
      throw new Error(`[ticTacToeDaily] ${label}[${i}] invalid puzzle`);
    }
  }
}

/** Tier 0: obvious winning move for X. */
const RAW_W1: TttBoard[] = [
  ["X", "X", null, "O", null, null, null, null, null],
  ["O", null, null, "X", "X", null, null, null, "O"],
  [null, null, null, "X", "X", null, "O", null, "O"],
  ["X", null, "O", "X", null, null, null, null, null],
  ["O", "X", null, null, "X", null, null, null, "O"],
  [null, null, "O", null, "X", "X", null, null, "O"],
];

/** Tier 1: must block O (no immediate X win). */
const RAW_W2: TttBoard[] = [
  ["O", "O", null, "X", null, null, null, null, "X"],
  ["X", null, "O", null, "X", null, "O", null, null],
  ["O", "O", null, null, "X", null, null, null, "X"],
  ["O", null, "O", null, "X", null, null, null, "X"],
  [null, null, "X", "O", "O", null, null, "X", null],
  ["O", "O", null, "X", null, null, "X", null, null],
];

/** Tier 2: busier boards; still unique tactical (win or block). */
const RAW_W3: TttBoard[] = [
  ["X", "O", "X", "O", "X", null, null, null, "O"],
  ["O", "X", "O", null, "X", null, null, null, null],
  ["O", "X", null, "X", null, "O", null, "X", null],
  ["X", null, "X", "O", null, null, "O", "X", null],
  ["X", "X", null, "O", null, null, null, null, null],
  ["O", null, null, "X", "X", null, null, null, "O"],
];

/** Tier 3: more empty cells / visually open; unique tactical move. */
const RAW_W4: TttBoard[] = [
  ["X", null, "O", null, "X", null, "O", null, null],
  ["O", null, null, null, "X", "O", "X", null, null],
  [null, "O", null, "X", null, null, null, "O", "X"],
  ["X", "O", null, null, "X", null, "O", null, null],
  [null, null, "X", "O", null, null, "X", null, "O"],
  ["O", "O", null, "X", null, "X", "O", null, null],
];

assertPool("RAW_W1", RAW_W1);
assertPool("RAW_W2", RAW_W2);
assertPool("RAW_W3", RAW_W3);
assertPool("RAW_W4", RAW_W4);

const POOLS: readonly TttBoard[][] = [RAW_W1, RAW_W2, RAW_W3, RAW_W4];

export interface TicTacToePuzzle {
  board: TttBoard;
  correct_cell: number;
  difficulty: "week_1" | "week_2" | "week_3" | "week_4";
  board_seed: string;
}

export function buildTicTacToePuzzle(
  dayKey: string,
  userId: string,
  missionId: string,
  phaseTag: "p1" | "p2"
): TicTacToePuzzle {
  const weekSlot = weekSlotFromDayKey(dayKey);
  const pool = POOLS[weekSlot];
  const seed = tttHash(`${dayKey}|${userId}|${missionId}|${phaseTag}`);
  const idx = seed % pool.length;
  const board = pool[idx].map((c) => c) as TttBoard;
  const correct_cell = uniqueTacticalMove(board);
  if (correct_cell === null) {
    throw new Error("[ticTacToeDaily] internal: pool puzzle has no tactical move");
  }
  const board_seed = seed.toString(36).slice(0, 12);
  const difficulty = `week_${weekSlot + 1}` as TicTacToePuzzle["difficulty"];
  return { board, correct_cell, difficulty, board_seed };
}

export function sanitizeTttProgressForClient(p: Record<string, unknown>): Record<string, unknown> {
  const board = p.board;
  const difficulty = p.difficulty;
  const board_seed = p.board_seed;
  return {
    game_type: "tic_tac_toe",
    board,
    difficulty,
    board_seed,
  };
}
