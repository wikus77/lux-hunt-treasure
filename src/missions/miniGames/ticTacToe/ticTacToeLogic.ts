/**
 * Tactical Tic-Tac-Toe — UI helpers only (no answer logic).
 * © 2025 Joseph MULÉ – M1SSION™
 */

import type { TttBoard, TttCell } from './ticTacToeTypes';

function normalizeMark(raw: unknown): TttCell {
  if (raw === 'X' || raw === 'O') return raw;
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'string') {
    const u = raw.toUpperCase();
    if (u === 'X' || u === 'O') return u;
  }
  return null;
}

/** Parse server `board` (JSON nulls) into 9 cells; null if invalid. */
export function parseBoardFromProgress(raw: unknown): TttBoard | null {
  if (!Array.isArray(raw) || raw.length !== 9) return null;
  return raw.map((c) => normalizeMark(c)) as TttBoard;
}

export function isCellSelectable(board: TttBoard, index: number): boolean {
  return index >= 0 && index < 9 && board[index] === null;
}

export function displayMark(cell: TttCell): string {
  if (cell === 'X' || cell === 'O') return cell;
  return '';
}
