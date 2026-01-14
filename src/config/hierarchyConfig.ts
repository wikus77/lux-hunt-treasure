/**
 * M1SSION™ — Hierarchy Configuration
 * Configurazione della gerarchia agenti con soglie PE
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

export interface HierarchyLevel {
  level: number;
  code: string;
  name: string;
  nameIt: string;
  peThreshold: number;      // PE totali richiesti per raggiungere questo livello
  peIncremental: number;    // PE incrementali rispetto al livello precedente
  icon: string;
  color: string;
  videoPath: string | null; // Percorso video celebrativo (null se non esiste)
}

/**
 * GERARCHIA M1SSION v3.0
 * 
 * Livello 0: Nulla (partenza)
 * Livello 1-9: Progressione agente
 * Livello 10: MCP (solo admin, inarrivabile)
 */
export const HIERARCHY_LEVELS: HierarchyLevel[] = [
  {
    level: 0,
    code: 'NONE',
    name: 'Unranked',
    nameIt: 'Senza Grado',
    peThreshold: 0,
    peIncremental: 0,
    icon: '❓',
    color: '#6B7280',
    videoPath: null,
  },
  {
    level: 1,
    code: 'RECRUIT',
    name: 'Recruit',
    nameIt: 'Recluta',
    peThreshold: 1000,
    peIncremental: 1000,
    icon: '🎖️',
    color: '#808080',
    videoPath: '/video/gerarchia M1SSION/RECRUIT-VIDEO.mp4',
  },
  {
    level: 2,
    code: 'FIELD_AGENT',
    name: 'Field Agent',
    nameIt: 'Agente sul Campo',
    peThreshold: 3000,
    peIncremental: 2000,
    icon: '🔰',
    color: '#4A90E2',
    videoPath: '/video/gerarchia M1SSION/FIELD AGENT-VIDEO.mp4',
  },
  {
    level: 3,
    code: 'OPERATIVE',
    name: 'Operative',
    nameIt: 'Operativo',
    peThreshold: 7000,
    peIncremental: 4000,
    icon: '💀',
    color: '#50C878',
    videoPath: '/video/gerarchia M1SSION/OPERATIVE-VIDEO.mp4',
  },
  {
    level: 4,
    code: 'SPECIALIST',
    name: 'Specialist',
    nameIt: 'Specialista',
    peThreshold: 15000,
    peIncremental: 8000,
    icon: '🃏',
    color: '#9370DB',
    videoPath: '/video/gerarchia M1SSION/SPECIALIST-VIDEO.mp4',
  },
  {
    level: 5,
    code: 'SHADOW_OPERATIVE',
    name: 'Shadow Operative',
    nameIt: 'Operativo Ombra',
    peThreshold: 30000,
    peIncremental: 15000,
    icon: '🧿',
    color: '#2F4F4F',
    videoPath: '/video/gerarchia M1SSION/SHADOW OPERATIVE-VIDEO.mp4',
  },
  {
    level: 6,
    code: 'ELITE_AGENT',
    name: 'Elite Agent',
    nameIt: 'Agente Elite',
    peThreshold: 60000,
    peIncremental: 30000,
    icon: '🐲',
    color: '#FFD700',
    videoPath: '/video/gerarchia M1SSION/ELITE AGENT-VIDEO.mp4',
  },
  {
    level: 7,
    code: 'COMMANDER',
    name: 'Commander',
    nameIt: 'Comandante',
    peThreshold: 120000,
    peIncremental: 60000,
    icon: '🖲️',
    color: '#FF6347',
    videoPath: '/video/gerarchia M1SSION/COMMANDER-VIDEO.mp4',
  },
  {
    level: 8,
    code: 'MASTER',
    name: 'Master',
    nameIt: 'Maestro',
    peThreshold: 250000,
    peIncremental: 130000,
    icon: '🔮',
    color: '#8B0000',
    videoPath: '/video/gerarchia M1SSION/MASTER-VIDEO.mp4', // Da creare
  },
  {
    level: 9,
    code: 'GRAND_MASTER',
    name: 'Grand Master',
    nameIt: 'Gran Maestro',
    peThreshold: 500000,
    peIncremental: 250000,
    icon: '🪬',
    color: '#4B0082',
    videoPath: '/video/gerarchia M1SSION/GRAND MASTER-VIDEO.mp4', // Da creare
  },
  {
    level: 10,
    code: 'MCP',
    name: 'MCP',
    nameIt: 'Master Control Program',
    peThreshold: 999999999, // Inarrivabile
    peIncremental: 999999999,
    icon: '🔺',
    color: '#FF0000',
    videoPath: null, // Solo admin
  },
];

/**
 * Trova il livello corrente basato sui PE totali
 */
export function getCurrentLevel(totalPE: number): HierarchyLevel {
  // Trova il livello più alto che l'utente ha raggiunto
  for (let i = HIERARCHY_LEVELS.length - 1; i >= 0; i--) {
    if (totalPE >= HIERARCHY_LEVELS[i].peThreshold) {
      return HIERARCHY_LEVELS[i];
    }
  }
  return HIERARCHY_LEVELS[0];
}

/**
 * Trova il prossimo livello
 */
export function getNextLevel(currentLevel: HierarchyLevel): HierarchyLevel | null {
  const nextIndex = currentLevel.level + 1;
  if (nextIndex >= HIERARCHY_LEVELS.length || HIERARCHY_LEVELS[nextIndex].code === 'MCP') {
    return null; // Nessun prossimo livello (o MCP inarrivabile)
  }
  return HIERARCHY_LEVELS[nextIndex];
}

/**
 * Calcola il progresso verso il prossimo livello (0-100%)
 */
export function calculateProgress(totalPE: number, currentLevel: HierarchyLevel, nextLevel: HierarchyLevel | null): number {
  if (!nextLevel) return 100; // Max level raggiunto
  
  const peInCurrentLevel = totalPE - currentLevel.peThreshold;
  const peNeededForNextLevel = nextLevel.peThreshold - currentLevel.peThreshold;
  
  return Math.min(100, Math.max(0, (peInCurrentLevel / peNeededForNextLevel) * 100));
}

/**
 * Calcola i PE mancanti per il prossimo livello
 */
export function getPEToNextLevel(totalPE: number, nextLevel: HierarchyLevel | null): number {
  if (!nextLevel) return 0;
  return Math.max(0, nextLevel.peThreshold - totalPE);
}

// © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

