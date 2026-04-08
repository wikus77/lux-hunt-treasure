/**
 * M1U Credit Event — Global standard for M1U slot overlay engine
 * Any source (Shop, Wheel, Mission, Reward, etc.) emits this; global overlay shows PRE→SLOT→POST.
 * © 2025 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
 */

export const M1U_CREDIT_EVENT = 'm1u-credit-event';
export const PENDING_CREDIT_KEY = '__m1u_pending_credit__';
export const PENDING_CREDIT_TTL_MS = 5000;

export interface M1UCreditEventDetail {
  amount: number;
  source: string;
  id: string;
  issuedAt: number;
  /** Set when Conductor replays; capture listener ignores to avoid loops. */
  orchestratorReplay?: boolean;
  /** Optional tags (e.g. Victory Orch QA harness only). Product paths omit. */
  metadata?: Record<string, unknown>;
}

export type M1UCreditSource =
  | 'shop'
  | 'wheel'
  | 'mission'
  | 'lottery'
  | 'scratch'
  | 'referral'
  | 'welcome'
  | 'streak'
  | 'clue_milestone'
  | 'micro_mission'
  | 'cashback'
  | 'weekly_challenge'
  | 'reward'
  | string;

/**
 * Emit standard m1u-credit-event and set window.__m1u_pending_credit__ for pill PRE→POST sync.
 * Call this whenever M1U are credited from any source; global overlay will show and dispatch m1u-credited after delay.
 */
export function emitM1UCreditEvent(
  amount: number,
  source: M1UCreditSource,
  extra?: { metadata?: Record<string, unknown> }
): void {
  if (typeof window === 'undefined' || amount <= 0) return;
  const id = `credit-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const issuedAt = Date.now();
  const payload: M1UCreditEventDetail = {
    amount,
    source,
    id,
    issuedAt,
    ...(extra?.metadata && Object.keys(extra.metadata).length > 0 ? { metadata: extra.metadata } : {}),
  };
  (window as any)[PENDING_CREDIT_KEY] = payload;
  window.dispatchEvent(
    new CustomEvent(M1U_CREDIT_EVENT, { detail: payload })
  );
}
