// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

export interface DNAScores {
  intuito: number;
  audacia: number;
  etica: number;
  rischio: number;
  vibrazione: number;
}

export type Archetype = 'Seeker' | 'Breaker' | 'Oracle' | 'Warden' | 'Nomad';

export interface DNAProfile extends DNAScores {
  archetype: Archetype;
  completedAt?: string;
}

export interface ArchetypeConfig {
  id: Archetype;
  name: string;
  nameIt: string;
  description: string;
  color: string;
  icon: string;
  accentVar: string;
}

export const ARCHETYPE_CONFIGS: Record<Archetype, ArchetypeConfig> = {
  Seeker: {
    id: 'Seeker',
    name: 'Seeker',
    nameIt: 'Cercatore',
    description: 'Guidato dall\'intuizione e dalla vibrazione. Esplori territori inesplorati con curiosità e apertura mentale.',
    color: '#00d1ff',
    icon: '🔍',
    accentVar: 'hsl(190, 100%, 50%)'
  },
  Breaker: {
    id: 'Breaker',
    name: 'Breaker',
    nameIt: 'Spezzacatene',
    description: 'Audacia e rischio sono il tuo motore. Sfidi i limiti e rompi gli schemi con coraggio.',
    color: '#ff2768',
    icon: '⚡',
    accentVar: 'hsl(345, 100%, 57%)'
  },
  Oracle: {
    id: 'Oracle',
    name: 'Oracle',
    nameIt: 'Oracolo',
    description: 'Intuito elevato e rischio calibrato. Vedi oltre le apparenze e comprendi le dinamiche nascoste.',
    color: '#8a5cff',
    icon: '🔮',
    accentVar: 'hsl(260, 100%, 67%)'
  },
  Warden: {
    id: 'Warden',
    name: 'Warden',
    nameIt: 'Guardiano',
    description: 'Etica e prudenza definiscono le tue scelte. Proteggi ciò che è giusto con integrità.',
    color: '#00ff85',
    icon: '🛡️',
    accentVar: 'hsl(152, 100%, 50%)'
  },
  Nomad: {
    id: 'Nomad',
    name: 'Nomad',
    nameIt: 'Nomade',
    description: 'Equilibrio e adattabilità. Il tuo DNA è in costante ricerca della propria identità.',
    color: '#9d9d9d',
    icon: '🌐',
    accentVar: 'hsl(0, 0%, 62%)'
  }
};

/**
 * Calculate archetype from DNA scores
 */
export function calculateArchetype(scores: DNAScores): Archetype {
  const { intuito, audacia, etica, rischio, vibrazione } = scores;
  
  // Calculate weighted scores for each archetype
  const seekerScore = intuito + vibrazione + (etica >= 50 ? 10 : 0);
  const breakerScore = audacia + rischio + (etica <= 55 ? 10 : 0);
  const oracleScore = (intuito >= 70 ? intuito + 20 : intuito) + (60 - Math.abs(rischio - 50));
  const wardenScore = (etica >= 70 ? etica + 20 : etica) + (60 - Math.abs(rischio - 30));
  
  // Find highest score
  const scores_map = {
    Seeker: seekerScore,
    Breaker: breakerScore,
    Oracle: oracleScore,
    Warden: wardenScore
  };
  
  const sorted = Object.entries(scores_map).sort((a, b) => b[1] - a[1]);
  return sorted[0][0] as Archetype;
}

/**
 * Generate default DNA scores (neutral)
 */
export function getDefaultScores(): DNAScores {
  return {
    intuito: 50,
    audacia: 50,
    etica: 50,
    rischio: 50,
    vibrazione: 50
  };
}

/**
 * Quiz questions for DNA calibration
 */
export interface DNAQuestion {
  id: string;
  attribute: keyof DNAScores;
  question: string;
  options: Array<{
    label: string;
    value: number; // 0-100
  }>;
}

export const DNA_QUESTIONS: DNAQuestion[] = [
  {
    id: 'q1',
    attribute: 'intuito',
    question: 'Di fronte a una situazione nuova, ti affidi a:',
    options: [
      { label: 'Analisi razionale e dati', value: 30 },
      { label: 'Mix di logica e intuizione', value: 60 },
      { label: 'Istinto e sensazioni', value: 90 }
    ]
  },
  {
    id: 'q2',
    attribute: 'audacia',
    question: 'Preferisci prendere decisioni:',
    options: [
      { label: 'Dopo aver valutato ogni dettaglio', value: 30 },
      { label: 'Con una buona pianificazione', value: 60 },
      { label: 'Rapidamente, seguendo l\'impulso', value: 90 }
    ]
  },
  {
    id: 'q3',
    attribute: 'etica',
    question: 'Per raggiungere un obiettivo importante:',
    options: [
      { label: 'Tutti i mezzi sono leciti', value: 20 },
      { label: 'Accetto compromessi ragionevoli', value: 60 },
      { label: 'Mai scendere a compromessi etici', value: 95 }
    ]
  },
  {
    id: 'q4',
    attribute: 'rischio',
    question: 'Il tuo rapporto con il rischio:',
    options: [
      { label: 'Lo evito quando possibile', value: 20 },
      { label: 'Lo gestisco con attenzione', value: 50 },
      { label: 'Lo cerco attivamente', value: 85 }
    ]
  },
  {
    id: 'q5',
    attribute: 'vibrazione',
    question: 'Ti senti più connesso a:',
    options: [
      { label: 'Fatti concreti e tangibili', value: 30 },
      { label: 'Equilibrio tra reale e possibile', value: 60 },
      { label: 'Energie e possibilità nascoste', value: 90 }
    ]
  }
];

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
