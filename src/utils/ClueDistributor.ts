// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// Distributore indizi M1SSION™ - Gestione accesso per piano utente

export interface Clue {
  id: string;
  week: number;
  tier: 'base' | 'silver' | 'gold' | 'black' | 'titanium';
  type: 'real' | 'decoy' | 'decoy-certificato';
  title: string;
  description: string;
  difficulty: number;
  category: string;
  created_at: string;
}

export type UserPlan = 'base' | 'silver' | 'gold' | 'black' | 'titanium';

export interface ClueDistributionResult {
  availableClues: Clue[];
  totalAvailable: number;
  weeklyLimit: number;
  remainingSlots: number;
  accessLevel: UserPlan;
  canViewDecoys: boolean;
}

export interface ClueDistributionConfig {
  userPlan: UserPlan;
  allClues: Clue[];
  currentWeek: number;
}

// Mappa quantità indizi per piano (per settimana)
// 🆕 Allineato con documentazione ufficiale: Titanium = 7/settimana (era 9)
const PLAN_WEEKLY_LIMITS: Record<UserPlan, number> = {
  base: 1,
  silver: 3,
  gold: 5,
  black: 7,
  titanium: 7  // ← Corretto: allineato con docs ufficiali (era 9)
} as const;

// Mappa accesso tier per piano utente
const PLAN_TIER_ACCESS: Record<UserPlan, UserPlan[]> = {
  base: ['base'],
  silver: ['base', 'silver'],
  gold: ['base', 'silver', 'gold'],
  black: ['base', 'silver', 'gold', 'black'],
  titanium: ['base', 'silver', 'gold', 'black', 'titanium']
} as const;

/**
 * Verifica se un utente può accedere a un indizio in base al suo piano
 */
const canAccessClueTier = (userPlan: UserPlan, clueTier: UserPlan): boolean => {
  return PLAN_TIER_ACCESS[userPlan].includes(clueTier);
};

/**
 * Verifica se un utente può vedere indizi decoy certificati
 */
const canViewDecoyClues = (userPlan: UserPlan): boolean => {
  return userPlan === 'titanium';
};

/**
 * Filtra indizi per settimana corrente e precedenti
 */
const filterCluesByWeek = (clues: Clue[], currentWeek: number): Clue[] => {
  return clues.filter(clue => clue.week <= currentWeek);
};

/**
 * Filtra indizi per piano utente
 */
const filterCluesByPlan = (clues: Clue[], userPlan: UserPlan): Clue[] => {
  return clues.filter(clue => {
    // Filtra per tier accessibile
    if (!canAccessClueTier(userPlan, clue.tier)) {
      return false;
    }

    // Filtra decoy certificati (solo Titanium)
    if (clue.type === 'decoy-certificato' && !canViewDecoyClues(userPlan)) {
      return false;
    }

    return true;
  });
};

/**
 * Applica limite settimanale per piano
 */
const applyWeeklyLimit = (clues: Clue[], userPlan: UserPlan, currentWeek: number): Clue[] => {
  const weeklyLimit = PLAN_WEEKLY_LIMITS[userPlan];
  const totalLimit = weeklyLimit * currentWeek;
  
  // Ordina per settimana e difficoltà (prima i più semplici)
  const sortedClues = [...clues].sort((a, b) => {
    if (a.week !== b.week) {
      return a.week - b.week;
    }
    return a.difficulty - b.difficulty;
  });

  return sortedClues.slice(0, totalLimit);
};

/**
 * Calcola statistiche distribuzione
 */
const calculateDistributionStats = (
  filteredClues: Clue[], 
  userPlan: UserPlan, 
  currentWeek: number
): {
  totalAvailable: number;
  weeklyLimit: number;
  remainingSlots: number;
  canViewDecoys: boolean;
} => {
  const weeklyLimit = PLAN_WEEKLY_LIMITS[userPlan];
  const totalLimit = weeklyLimit * currentWeek;
  const totalAvailable = filteredClues.length;
  const remainingSlots = Math.max(0, totalLimit - totalAvailable);
  const canViewDecoys = canViewDecoyClues(userPlan);

  return {
    totalAvailable,
    weeklyLimit,
    remainingSlots,
    canViewDecoys
  };
};

/**
 * Funzione principale di distribuzione indizi
 */
export const distributeClues = (config: ClueDistributionConfig): ClueDistributionResult => {
  const { userPlan, allClues, currentWeek } = config;

  // Validazione input
  if (!allClues || allClues.length === 0) {
    return {
      availableClues: [],
      totalAvailable: 0,
      weeklyLimit: PLAN_WEEKLY_LIMITS[userPlan],
      remainingSlots: PLAN_WEEKLY_LIMITS[userPlan] * currentWeek,
      accessLevel: userPlan,
      canViewDecoys: canViewDecoyClues(userPlan)
    };
  }

  if (currentWeek < 1 || currentWeek > 4) {
    throw new Error('Settimana deve essere tra 1 e 4');
  }

  // Pipeline di filtri
  let filteredClues = allClues;

  // 1. Filtra per settimana (non mostra indizi futuri)
  filteredClues = filterCluesByWeek(filteredClues, currentWeek);

  // 2. Filtra per piano utente e tier
  filteredClues = filterCluesByPlan(filteredClues, userPlan);

  // 3. Applica limite settimanale
  filteredClues = applyWeeklyLimit(filteredClues, userPlan, currentWeek);

  // 4. Calcola statistiche
  const stats = calculateDistributionStats(filteredClues, userPlan, currentWeek);

  return {
    availableClues: filteredClues,
    totalAvailable: stats.totalAvailable,
    weeklyLimit: stats.weeklyLimit,
    remainingSlots: stats.remainingSlots,
    accessLevel: userPlan,
    canViewDecoys: stats.canViewDecoys
  };
};

/**
 * Ottieni indizi per una settimana specifica
 */
export const getCluesForWeek = (clues: Clue[], week: number): Clue[] => {
  return clues.filter(clue => clue.week === week);
};

/**
 * Ottieni indizi per tier specifico
 */
export const getCluesForTier = (clues: Clue[], tier: UserPlan): Clue[] => {
  return clues.filter(clue => clue.tier === tier);
};

/**
 * Ottieni solo indizi decoy
 */
export const getDecoyClues = (clues: Clue[]): Clue[] => {
  return clues.filter(clue => clue.type === 'decoy' || clue.type === 'decoy-certificato');
};

/**
 * Verifica se un utente può accedere a un indizio specifico
 */
export const canAccessClue = (clue: Clue, userPlan: UserPlan, currentWeek: number): boolean => {
  // Controlla settimana
  if (clue.week > currentWeek) {
    return false;
  }

  // Controlla tier
  if (!canAccessClueTier(userPlan, clue.tier)) {
    return false;
  }

  // Controlla decoy certificati
  if (clue.type === 'decoy-certificato' && !canViewDecoyClues(userPlan)) {
    return false;
  }

  return true;
};

/**
 * Ottieni riepilogo accesso per piano
 */
export const getPlanAccessSummary = (userPlan: UserPlan): {
  plan: UserPlan;
  weeklyLimit: number;
  accessibleTiers: UserPlan[];
  canViewDecoys: boolean;
  maxWeeksAccess: number;
} => {
  return {
    plan: userPlan,
    weeklyLimit: PLAN_WEEKLY_LIMITS[userPlan],
    accessibleTiers: PLAN_TIER_ACCESS[userPlan],
    canViewDecoys: canViewDecoyClues(userPlan),
    maxWeeksAccess: 4 // Sempre 4 settimane per tutte le missioni
  };
};

// Costanti esportate per uso esterno
export const CLUE_DISTRIBUTOR_CONSTANTS = {
  PLAN_WEEKLY_LIMITS,
  PLAN_TIER_ACCESS,
  MAX_WEEKS: 4,
  TIER_HIERARCHY: ['base', 'silver', 'gold', 'black', 'titanium'] as const
} as const;