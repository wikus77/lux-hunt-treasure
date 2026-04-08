/**
 * Pair glyphs for face-up cards (9 max pairs = week 4).
 * © 2025 Joseph MULÉ – M1SSION™
 */

const GLYPHS = ['◆', '●', '▲', '■', '★', '✦', '⌁', '◎', '◇'] as const;

export function glyphForPairId(pairId: number): string {
  if (pairId < 0 || pairId >= GLYPHS.length) return '?';
  return GLYPHS[pairId] ?? '?';
}
