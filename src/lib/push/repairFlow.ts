// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
/**
 * Push Repair Flow - Reusable subscription repair pipeline
 * Used by: Repair button, Toggle ON handler
 */

import { subscribeFlow, type SubscribeFlowResult } from './subscribeFlow';

export interface RepairFlowResult {
  ok: boolean;
  subscription: PushSubscription | null;
  endpoint?: string;
  message?: string;
  error?: string;
}

/**
 * Complete push repair flow:
 * 1. Unsubscribe existing subscription (cleanup)
 * 2. Run full subscribe pipeline (SW + permission + subscribe + upsert)
 * 
 * Idempotent: safe to call multiple times
 */
export async function runRepairFlow(): Promise<RepairFlowResult> {
  const t0 = performance.now();
  
  try {
    // Step 1: Cleanup existing subscription
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const reg = await navigator.serviceWorker.ready;
        const existingSub = await reg.pushManager.getSubscription();
        if (existingSub) {
          console.log('[RepairFlow] Unsubscribing old subscription...');
          await existingSub.unsubscribe();
        }
      } catch (cleanupError) {
        // Non-critical: continue even if cleanup fails
        console.warn('[RepairFlow] Cleanup failed (non-critical):', cleanupError);
      }
    }

    // Step 2: Run complete subscription pipeline
    const result: SubscribeFlowResult = await subscribeFlow();

    const elapsed = Math.round(performance.now() - t0);

    if (result.ok) {
      // Get the actual subscription object
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      
      return {
        ok: true,
        subscription: sub,
        endpoint: result.endpoint,
        message: `Repair completed in ${elapsed}ms`
      };
    } else {
      return {
        ok: false,
        subscription: null,
        error: result.error || 'Repair failed',
        message: `Failed after ${elapsed}ms`
      };
    }

  } catch (error: any) {
    const elapsed = Math.round(performance.now() - t0);
    console.error(`[RepairFlow] FAILED after ${elapsed}ms:`, error);
    
    return {
      ok: false,
      subscription: null,
      error: error?.message || 'Unknown error',
      message: `Error after ${elapsed}ms`
    };
  }
}
