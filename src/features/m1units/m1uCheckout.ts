// M1U Checkout thin wrapper — Reuses existing BUZZ Stripe flow
// Maps pack codes to EUR and delegates to processBuzzPurchase
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

export type M1UPackCode =
  | 'M1U_STARTER'
  | 'M1U_AGENT'
  | 'M1U_ELITE'
  | 'M1U_COMMANDER'
  | 'M1U_DIRECTOR'
  | 'M1U_MASTER';

const PACK_PRICES_EUR: Record<M1UPackCode, number> = {
  M1U_STARTER: 4.99,
  M1U_AGENT: 9.99,
  M1U_ELITE: 19.99,
  M1U_COMMANDER: 39.99,
  M1U_DIRECTOR: 79.99,
  M1U_MASTER: 199.99,
};

interface StartCheckoutOptions {
  redirectUrl: string;
  sessionId: string;
  // Delegated BUZZ flow executor
  processBuzzPurchase: (
    isBuzzMap: boolean,
    amount: number,
    redirectUrl?: string,
    sessionId?: string
  ) => Promise<boolean>;
}

export async function startM1UCheckout(
  packCode: M1UPackCode,
  opts: StartCheckoutOptions
): Promise<boolean> {
  console.log('[M1U] ========== START M1U CHECKOUT ==========');
  console.log('[M1U] Pack code:', packCode);
  
  const amountEur = PACK_PRICES_EUR[packCode];
  if (typeof amountEur !== 'number') {
    console.error('[M1U] Invalid pack code', packCode);
    return false;
  }
  
  // ✅ FIX: Convert EUR to cents BEFORE calling processBuzzPurchase
  const amountCents = Math.round(amountEur * 100);
  
  // Anti-regression guard: minimum 50 cents (€0.50)
  if (amountCents < 50) {
    console.error(`[M1U] Amount too low: ${amountCents} cents (€${amountEur})`);
    return false;
  }
  
  console.log(`[M1U] Checkout payload:`, {
    packCode,
    amountEur,
    amountCents,
    redirectUrl: opts.redirectUrl,
    sessionId: opts.sessionId,
    isBuzzMap: false
  });
  
  console.log('[M1U] Calling processBuzzPurchase with:', {
    isBuzzMap: false,
    amount: amountCents,
    redirectUrl: opts.redirectUrl,
    sessionId: opts.sessionId
  });
  
  try {
    // Reuse BUZZ one-off flow — same edge function, no new endpoints
    const result = await opts.processBuzzPurchase(false, amountCents, opts.redirectUrl, opts.sessionId);
    console.log('[M1U] processBuzzPurchase result:', result);
    console.log('[M1U] ========== END M1U CHECKOUT ==========');
    return result;
  } catch (error) {
    console.error('[M1U] processBuzzPurchase threw error:', error);
    console.error('[M1U] Error stack:', error instanceof Error ? error.stack : 'No stack');
    return false;
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
