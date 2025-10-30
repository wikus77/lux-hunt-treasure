/**
 * Rubik's Cube 4×4 Neon Color Palette
 * Standard Rubik colors with neon-enhanced variants for wireframe rendering
 */

export const RUBIK_COLORS = {
  // Standard face colors (for reference/logic)
  U: '#FFFFFF', // Up - White
  D: '#FFD700', // Down - Yellow
  L: '#FF6B35', // Left - Orange
  R: '#CC0000', // Right - Red
  F: '#00FF00', // Front - Green
  B: '#0066FF', // Back - Blue
  
  // Neon wireframe colors (additive blend optimized)
  NEON: {
    U: '#FFFFFF',   // White warm
    D: '#FFD700',   // Yellow
    L: '#FF6B35',   // Orange
    R: '#FF0033',   // Red neon
    F: '#00FF66',   // Green neon
    B: '#0088FF',   // Blue neon
    INNER: '#6FFCFF' // Cyan soft for internal edges
  }
} as const;

export type Face = 'U' | 'D' | 'L' | 'R' | 'F' | 'B';

/**
 * Get neon color for a face
 */
export function getNeonColor(face: Face): string {
  return RUBIK_COLORS.NEON[face];
}

/**
 * Get all face colors as array
 */
export function getAllFaceColors(): string[] {
  return [
    RUBIK_COLORS.NEON.U,
    RUBIK_COLORS.NEON.D,
    RUBIK_COLORS.NEON.L,
    RUBIK_COLORS.NEON.R,
    RUBIK_COLORS.NEON.F,
    RUBIK_COLORS.NEON.B
  ];
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
