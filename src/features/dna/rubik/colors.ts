/**
 * Rubik's Cube 4×4 Neon Color Palette
 * Standard Rubik colors with neon-enhanced variants for wireframe rendering
 */

export const RUBIK_COLORS = {
  // Standard Rubik face colors (official palette)
  U: '#FFFFFF', // Up - White
  D: '#FFD500', // Down - Yellow
  L: '#FF5800', // Left - Orange
  R: '#C41E3A', // Right - Red
  F: '#00A651', // Front - Green
  B: '#0051BA', // Back - Blue
  INNER: '#66FFF0' // Inner edges - Cyan tenue (10-20% alpha)
} as const;

export type Face = 'U' | 'D' | 'L' | 'R' | 'F' | 'B';

/**
 * Get color for a face
 */
export function getFaceColor(face: Face): string {
  return RUBIK_COLORS[face];
}

/**
 * Get all face colors as array
 */
export function getAllFaceColors(): string[] {
  return [
    RUBIK_COLORS.U,
    RUBIK_COLORS.D,
    RUBIK_COLORS.L,
    RUBIK_COLORS.R,
    RUBIK_COLORS.F,
    RUBIK_COLORS.B
  ];
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
