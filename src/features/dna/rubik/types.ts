/**
 * Type definitions for Rubik's Cube 4×4 implementation
 */

import type { Face as FaceColor } from './colors';

// Re-export Face type
export type Face = FaceColor;

/**
 * Position in 3D grid (0-3 for 4×4 cube)
 */
export type Position = [number, number, number];

/**
 * Orientation as Euler angles (0, 90, 180, 270 degrees)
 */
export type Orientation = [number, number, number];

/**
 * Individual cubie (mini-cube) state
 */
export interface RubikCubie {
  id: number;                    // 0..63
  pos: Position;                 // Current position in grid
  orient: Orientation;           // Current orientation
  stickers?: Partial<Record<Face, string>>; // Visible face colors
}

/**
 * Complete cube state (64 cubies for 4×4)
 */
export interface RubikState {
  size: 4;
  cubies: RubikCubie[];         // 64 pieces
  history: string[];            // Move notation (e.g., "U", "R2", "F'")
}

/**
 * Move notation
 * Face rotations: U, D, L, R, F, B
 * Modifiers: ' (counter-clockwise), 2 (180°)
 * Slice rotations: Uw, Dw, etc. (includes adjacent layer)
 */
export type Move = string;

/**
 * Animation state for smooth transitions
 */
export interface AnimationState {
  active: boolean;
  face: Face;
  sliceIndex: number;
  angle: number;              // Current angle (0 to 90)
  duration: number;           // Total duration in ms
  startTime: number;          // Animation start timestamp
  clockwise: boolean;
}

/**
 * Gesture input data
 */
export interface GestureInput {
  type: 'drag' | 'tap' | 'pinch';
  face?: Face;
  sliceIndex?: number;
  direction?: 'cw' | 'ccw';
  delta?: { x: number; y: number };
  scale?: number;
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
