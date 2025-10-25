/**
 * TRON BATTLE - Constants and Types
 * Centralized stake types and percentages
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

export type StakeType = 'buzz' | 'clue' | 'energy_frag';

export const STAKE_TYPES = [
  { value: 'energy_frag' as const, label: 'Energy Fragments', icon: '⚡' },
  { value: 'buzz' as const, label: 'Buzz Points', icon: '📡' },
  { value: 'clue' as const, label: 'Clues', icon: '🔍' },
] as const;

export const STAKE_PERCENTS = [25, 50, 75] as const;
export type StakePercent = typeof STAKE_PERCENTS[number];

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
