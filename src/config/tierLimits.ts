// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ Subscription Tier Limits Configuration
// Configurazione centralizzata dei limiti per ogni tier abbonamento

/**
 * Tipo tier abbonamento M1SSION™
 * Usato in tutta l'app per tipizzazione consistente
 */
export type UserTier = 'base' | 'silver' | 'gold' | 'black' | 'titanium';

/**
 * Alias per compatibilità con nomi alternativi
 */
export type SubscriptionTier = UserTier;

/**
 * Normalizza il tier a minuscolo per match consistente
 */
export const normalizeTier = (tier: string | null | undefined): UserTier => {
  if (!tier) return 'base';
  const normalized = tier.toLowerCase().trim();
  if (['base', 'free'].includes(normalized)) return 'base';
  if (['silver'].includes(normalized)) return 'silver';
  if (['gold'].includes(normalized)) return 'gold';
  if (['black'].includes(normalized)) return 'black';
  if (['titanium'].includes(normalized)) return 'titanium';
  return 'base';
};

// ============================================================================
// BUZZ GRATUITI SETTIMANALI PER TIER
// ============================================================================

/**
 * Numero di BUZZ gratuiti a settimana per ogni tier
 * - Free (Base): 1/settimana
 * - Silver: 3/settimana
 * - Gold: 4/settimana
 * - Black: 5/settimana
 * - Titanium: 7/settimana
 */
export const FREE_BUZZ_WEEKLY_BY_TIER: Record<UserTier, number> = {
  base: 1,
  silver: 3,
  gold: 4,
  black: 5,
  titanium: 7,
} as const;

// ============================================================================
// COOLDOWN BUZZ MAP PER TIER (in secondi)
// ============================================================================

/**
 * Cooldown BUZZ MAP in secondi per ogni tier
 * - Free (Base): 24h (86400 sec) - Ma non può usare BUZZ MAP (limite 0/mese)
 * - Silver: 12h (43200 sec) - Ma non può usare BUZZ MAP (limite 0/mese)
 * - Gold: 8h (28800 sec) - Ma non può usare BUZZ MAP (limite 0/mese)
 * - Black: 4h (14400 sec) - 1 BUZZ MAP/mese
 * - Titanium: 0h (0 sec) - 2 BUZZ MAP/mese, nessun cooldown
 */
export const BUZZMAP_COOLDOWN_SECONDS_BY_TIER: Record<UserTier, number> = {
  base: 24 * 60 * 60,      // 24h = 86400 sec
  silver: 12 * 60 * 60,    // 12h = 43200 sec
  gold: 8 * 60 * 60,       // 8h = 28800 sec
  black: 4 * 60 * 60,      // 4h = 14400 sec
  titanium: 0,             // Nessun cooldown
} as const;

/**
 * Cooldown BUZZ MAP in ore (per display UI)
 */
export const BUZZMAP_COOLDOWN_HOURS_BY_TIER: Record<UserTier, number> = {
  base: 24,
  silver: 12,
  gold: 8,
  black: 4,
  titanium: 0,
} as const;

// ============================================================================
// LIMITI BUZZ MAP MENSILI PER TIER
// ============================================================================

/**
 * Numero massimo di BUZZ MAP al mese per ogni tier
 * - Free/Silver/Gold: 0 (non possono usare BUZZ MAP incluso nel tier)
 * - Black: 1/mese
 * - Titanium: 2/mese
 * 
 * NOTA: Gli utenti Free/Silver/Gold possono comunque PAGARE per BUZZ MAP
 * con il pricing progressivo, ma non hanno BUZZ MAP "gratuiti" inclusi.
 */
export const BUZZMAP_MONTHLY_LIMIT_BY_TIER: Record<UserTier, number> = {
  base: 0,
  silver: 0,
  gold: 0,
  black: 1,
  titanium: 2,
} as const;

// ============================================================================
// INDIZI SETTIMANALI PER TIER
// ============================================================================

/**
 * Numero massimo di indizi a settimana per ogni tier
 * - Free (Base): 1/settimana, Livello 1
 * - Silver: 3/settimana, Livelli 1-2
 * - Gold: 5/settimana, Livelli 1-3
 * - Black: 7/settimana, Livelli 1-4
 * - Titanium: 7/settimana, Livelli 1-5 (tutti)
 */
export const CLUES_WEEKLY_BY_TIER: Record<UserTier, number> = {
  base: 1,
  silver: 3,
  gold: 5,
  black: 7,
  titanium: 7, // ← Allineato con documentazione (era 9)
} as const;

/**
 * Livelli indizi accessibili per ogni tier
 */
export const CLUE_LEVELS_BY_TIER: Record<UserTier, number[]> = {
  base: [1],
  silver: [1, 2],
  gold: [1, 2, 3],
  black: [1, 2, 3, 4],
  titanium: [1, 2, 3, 4, 5],
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Verifica se un tier può usare BUZZ MAP (ha limite > 0)
 */
export const canUseBuzzMap = (tier: UserTier): boolean => {
  return BUZZMAP_MONTHLY_LIMIT_BY_TIER[tier] > 0;
};

/**
 * Ottiene il limite BUZZ gratuiti settimanali per un tier
 */
export const getFreeBuzzLimit = (tier: string | null | undefined): number => {
  return FREE_BUZZ_WEEKLY_BY_TIER[normalizeTier(tier)];
};

/**
 * Ottiene il cooldown BUZZ MAP in secondi per un tier
 */
export const getBuzzMapCooldownSeconds = (tier: string | null | undefined): number => {
  return BUZZMAP_COOLDOWN_SECONDS_BY_TIER[normalizeTier(tier)];
};

/**
 * Ottiene il limite BUZZ MAP mensile per un tier
 */
export const getBuzzMapMonthlyLimit = (tier: string | null | undefined): number => {
  return BUZZMAP_MONTHLY_LIMIT_BY_TIER[normalizeTier(tier)];
};

/**
 * Ottiene il limite indizi settimanali per un tier
 */
export const getCluesWeeklyLimit = (tier: string | null | undefined): number => {
  return CLUES_WEEKLY_BY_TIER[normalizeTier(tier)];
};


