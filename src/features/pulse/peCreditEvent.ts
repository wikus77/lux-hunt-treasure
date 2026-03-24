/**
 * PE Credit Event — Global standard for PE fullscreen reward overlay
 * Any source that credits PE (useAwardPE, clue milestone, onboarding, Vera Bomb) emits this;
 * GlobalPERewardOverlay shows fullscreen cinematic reward modal.
 * © 2025 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
 */

export const PE_CREDIT_EVENT = 'pe-credit-event';

export interface PECreditEventDetail {
  amount: number;
  source: string;
  id: string;
  issuedAt: number;
  /** Optional: pre-value for animation baseline */
  preValue?: number;
  /** Optional: post-value after credit */
  postValue?: number;
  metadata?: Record<string, unknown>;
}

export type PECreditSource =
  | 'buzz_click'
  | 'buzz_map_click'
  | 'pulse_breaker_win'
  | 'pulse_breaker_play'
  | 'fortune_wheel'
  | 'aion_chat'
  | 'forum_post'
  | 'forum_comment'
  | 'map_time_240s'
  | 'map_time_600s'
  | 'marker_claim'
  | 'battle_win'
  | 'battle_lose'
  | 'country_conquest'
  | 'daily_login'
  | 'daily_mission'
  | 'referral_signup'
  | 'final_shoot_win'
  | 'clue_milestone'
  | 'onboarding'
  | 'vera_bomb'
  | 'practice_mode_win'
  | 'battle_defense_win'
  | string;

/** PE modal runtime tracing — always on for iOS forensics (remove after diagnosis). */
const peEmit = (msg: string, data?: unknown) => {
  if (typeof console !== 'undefined') console.log('[PE-TRACE-EMIT]', msg, data ?? '');
};

/**
 * Emit pe-credit-event for global fullscreen PE reward overlay.
 * Call only after PE has been actually credited (RPC success or DB update confirmed).
 * Does nothing if amount <= 0.
 */
export function emitPECreditEvent(
  amount: number,
  source: PECreditSource,
  metadata?: { preValue?: number; postValue?: number; [key: string]: unknown }
): void {
  const rawAmount = amount;
  const numAmount = Number(amount);
  peEmit('CALLED', { rawAmount, numAmount, typeOfAmount: typeof amount, source, metadata });
  if (typeof window === 'undefined') {
    peEmit('EXIT no-window');
    return;
  }
  if (amount <= 0) {
    peEmit('EXIT amount<=0', { amount, numAmount });
    return;
  }
  const id = `pe-credit-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const issuedAt = Date.now();
  const payload: PECreditEventDetail = {
    amount,
    source,
    id,
    issuedAt,
    preValue: metadata?.preValue,
    postValue: metadata?.postValue,
    metadata,
  };
  peEmit('BEFORE dispatchEvent', { payload, id: payload.id, amount: payload.amount });
  window.dispatchEvent(new CustomEvent(PE_CREDIT_EVENT, { detail: payload }));
  peEmit('AFTER dispatchEvent', { id: payload.id });
}
