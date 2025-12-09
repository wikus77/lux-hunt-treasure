// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION Cashback Vault™ - Configuration
// Sistema di cashback in M1U per BUZZ, BUZZ MAP e AION

import { UserTier } from '@/config/tierLimits';

/**
 * ⚠️ FEATURE FLAG PRINCIPALE
 * Quando false, tutto il sistema cashback è completamente disattivato:
 * - Nessuna chiamata al backend
 * - Nessun accrual
 * - Pill in home nascosto o in stato "coming soon"
 * 
 * ✅ ATTIVATO dal Founder il 2025-12-07
 */
export const M1SSION_ENABLE_CASHBACK = true;

/**
 * Percentuali cashback per tier (DECISIONI FINALI FOUNDER 2025-12-07)
 * Cashback in M1U calcolato sul costo in € della transazione
 * Es: €10 spesi con tier Gold (2%) = 2 M1U di cashback
 */
export const CASHBACK_RATES_BY_TIER: Record<UserTier, number> = {
  base: 0.005,     // 0.5%
  silver: 0.01,    // 1%
  gold: 0.02,      // 2%
  black: 0.03,     // 3%
  titanium: 0.05,  // 5%
} as const;

/**
 * Cap settimanale cashback in M1U per tier
 * Oltre questo limite, il cashback non viene accumulato
 */
export const CASHBACK_WEEKLY_CAP_M1U: Record<UserTier, number> = {
  base: 50,
  silver: 100,
  gold: 200,
  black: 500,
  titanium: 1000,
} as const;

/**
 * Giorni minimi tra un claim e l'altro
 */
export const CASHBACK_CLAIM_COOLDOWN_DAYS = 7;

/**
 * Calcola il cashback M1U per una transazione
 * @param costEur - Costo in euro della transazione
 * @param tier - Tier abbonamento utente
 * @returns M1U di cashback (minimo 1 M1U se costEur > 0)
 */
export const calculateCashbackM1U = (costEur: number, tier: UserTier): number => {
  if (costEur <= 0) return 0;
  const rate = CASHBACK_RATES_BY_TIER[tier] || CASHBACK_RATES_BY_TIER.base;
  // 1 M1U = €0.10, quindi moltiplichiamo per 10
  // 🔥 FIX: Usa Math.max(1, ...) per garantire almeno 1 M1U di cashback
  const rawCashback = costEur * rate * 10;
  const cashbackM1U = Math.max(1, Math.ceil(rawCashback));
  return cashbackM1U;
};

/**
 * Verifica se un utente può accumulare altro cashback questa settimana
 * @param currentWeeklyAccumulated - M1U già accumulati questa settimana
 * @param tier - Tier abbonamento utente
 * @returns true se può ancora accumulare
 */
export const canAccrueCashback = (currentWeeklyAccumulated: number, tier: UserTier): boolean => {
  const cap = CASHBACK_WEEKLY_CAP_M1U[tier] || CASHBACK_WEEKLY_CAP_M1U.base;
  return currentWeeklyAccumulated < cap;
};

/**
 * Calcola quanto cashback può ancora essere accumulato questa settimana
 * @param currentWeeklyAccumulated - M1U già accumulati questa settimana
 * @param tier - Tier abbonamento utente
 * @returns M1U rimanenti prima del cap
 */
export const getRemainingWeeklyCashback = (currentWeeklyAccumulated: number, tier: UserTier): number => {
  const cap = CASHBACK_WEEKLY_CAP_M1U[tier] || CASHBACK_WEEKLY_CAP_M1U.base;
  return Math.max(0, cap - currentWeeklyAccumulated);
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

