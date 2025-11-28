/**
 * TRON BATTLE - Constants and Types
 * Centralized stake types and percentages
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

export type StakeType = 'm1u' | 'pulse_energy';

export const STAKE_TYPES = [
  { value: 'm1u' as const, label: 'M1 Units (M1U)', icon: '💰', description: 'Stake your M1U balance' },
  { value: 'pulse_energy' as const, label: 'Pulse Energy (PE)', icon: '⚡', description: 'Stake your Pulse Energy' },
] as const;

export const STAKE_PERCENTS = [25, 50, 75] as const;
export type StakePercent = typeof STAKE_PERCENTS[number];

// Calculate stake amount based on user balance and percentage
export function calculateStakeAmount(balance: number, percentage: StakePercent): number {
  return Math.floor(balance * (percentage / 100));
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
