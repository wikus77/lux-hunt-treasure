/**
 * Pure helpers for Neuromatch board rules.
 * © 2025 Joseph MULÉ – M1SSION™
 */

export function isInactiveSlot(pairId: number): boolean {
  return pairId < 0;
}

export function expectedMatchedPairsFromBoard(matchedIndices: Set<number>, board: number[]): number {
  const seen = new Set<number>();
  for (const i of matchedIndices) {
    const p = board[i];
    if (p >= 0) seen.add(p);
  }
  return seen.size;
}
