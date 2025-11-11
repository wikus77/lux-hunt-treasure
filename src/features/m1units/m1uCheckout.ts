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
  const amount = PACK_PRICES_EUR[packCode];
  if (typeof amount !== 'number') {
    console.error('[M1U] Invalid pack code', packCode);
    return false;
  }
  // Reuse BUZZ one-off flow — same edge function, no new endpoints
  return opts.processBuzzPurchase(false, amount, opts.redirectUrl, opts.sessionId);
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
