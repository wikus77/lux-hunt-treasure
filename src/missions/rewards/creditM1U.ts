/**
 * M1U CREDIT ADAPTER (SAFE MODE)
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Safe wrapper for M1U credits.
 * In SAFE_MODE: saves to localStorage only (no DB).
 * In LIVE_MODE: would call Edge Function (not implemented yet).
 */

import { MISSIONS_REWARD_SAFE_MODE } from '../missionsRegistry';
import { addPendingReward } from '../missionState';

const PENDING_CREDITS_KEY = 'm1_daily_missions_pending_credits';

interface PendingCredit {
  amount: number;
  reason: string;
  timestamp: number;
}

/**
 * Credit M1U to user (safe mode stores locally)
 */
export async function creditM1USafe(amount: number, reason: string): Promise<boolean> {
  console.log('[M1U Credit] 💰 Crediting:', amount, 'M1U for:', reason);
  
  if (MISSIONS_REWARD_SAFE_MODE) {
    // SAFE MODE: Store in localStorage, no DB writes
    try {
      const pending = getPendingCredits();
      pending.push({ amount, reason, timestamp: Date.now() });
      localStorage.setItem(PENDING_CREDITS_KEY, JSON.stringify(pending));
      addPendingReward(amount);
      
      console.log('[M1U Credit] 🔒 SAFE MODE - Stored in localStorage');
      return true;
    } catch (err) {
      console.error('[M1U Credit] ❌ Failed to store:', err);
      return false;
    }
  }
  
  // LIVE MODE: Would call edge function here
  // NOT IMPLEMENTED - requires validation first
  console.warn('[M1U Credit] ⚠️ LIVE MODE not implemented');
  return false;
}

export function getPendingCredits(): PendingCredit[] {
  try {
    const stored = localStorage.getItem(PENDING_CREDITS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function getTotalPendingCredits(): number {
  return getPendingCredits().reduce((sum, c) => sum + c.amount, 0);
}

