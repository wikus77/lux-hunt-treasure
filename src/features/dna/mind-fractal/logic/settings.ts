/**
 * © 2025 Joseph MULÉ – M1SSION™ – Mind Fractal Settings
 */

export interface MindFractalSettings {
  reduceAnimations: boolean;
  bloomIntensity: number;
  audioVolume: number;
  tunnelRings: number;
  tunnelSegments: number;
}

export const DEFAULT_SETTINGS: MindFractalSettings = {
  reduceAnimations: false,
  bloomIntensity: 0.85, // Lower for iPhone
  audioVolume: 0.3,
  tunnelRings: 240,
  tunnelSegments: 180
};

export const REDUCED_SETTINGS: MindFractalSettings = {
  reduceAnimations: true,
  bloomIntensity: 0.0,
  audioVolume: 0.12,
  tunnelRings: 120,
  tunnelSegments: 90
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
