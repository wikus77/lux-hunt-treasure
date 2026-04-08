/**
 * Tactical Tic-Tac-Toe (daily) — client types only. Correct answer lives on server.
 * © 2025 Joseph MULÉ – M1SSION™
 */

export type TttCell = 'X' | 'O' | null;

export type TttBoard = TttCell[];

export interface TttProgressView {
  board?: unknown;
  difficulty?: string;
  board_seed?: string;
}
