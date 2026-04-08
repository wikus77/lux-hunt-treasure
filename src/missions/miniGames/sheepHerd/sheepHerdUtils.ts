/**
 * Sheep Herd — small deterministic RNG + math helpers.
 * © 2025 Joseph MULÉ – M1SSION™
 */

export function createSeededRng(seedStr: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return (h >>> 0) / 4294967296;
  };
}

export function clamp(v: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, v));
}

export function len(dx: number, dy: number): number {
  return Math.hypot(dx, dy);
}
