/**
 * © 2025 Joseph MULÉ – M1SSION™ – Scoring System
 */

export function calculateScore(moves: number, timeMs: number): number {
  const baseScore = 600;
  const timePenalty = Math.floor(timeMs / 1000) * 2;
  const movesPenalty = moves * 5;
  
  const score = Math.max(0, baseScore - timePenalty - movesPenalty);
  return score;
}

export function getStyleBonus(chainCount: number): number {
  if (chainCount >= 2) return 100;
  return 0;
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
