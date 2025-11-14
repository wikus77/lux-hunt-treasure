// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ Clue Generator Engine - Sistema indizi progressivi con antiforcing

export interface ClueGeneratorParams {
  userId: string;
  buzzCount: number; // Weekly buzz count for this user
  weekOfYear: number; // 1-52
}

interface ClueData {
  text: string;
  week: number; // 1-4 (monthly week)
  tier: 'base' | 'silver' | 'gold' | 'black' | 'titanium';
  difficulty: number;
}

// Settimane tematiche M1SSION™
const WEEKLY_THEMES = {
  1: {
    theme: "Simbolico e Mitologico",
    difficulty: "Molto alta"
  },
  2: {
    theme: "Geografia Macro e Cultura",
    difficulty: "Alta"
  },
  3: {
    theme: "Microzona e Premio",
    difficulty: "Media"
  },
  4: {
    theme: "Coordinate e Precisione",
    difficulty: "Bassa"
  }
};

// Pool indizi per ogni settimana e tier
const CLUE_POOLS = {
  week1: {
    base: [
      "Dove il sole del Mediterraneo abbraccia l'innovazione moderna",
      "Nel cuore di una terra che unisce passato e futuro",
      "Là dove la cultura antica incontra la tecnologia contemporanea"
    ],
    silver: [
      "Cerca dove l'aquila romana veglia sulla Silicon Valley europea",
      "Nel regno della pizza, ma non dove la tradizione comanda",
      "Dove Virgilio e Dante avrebbero ammirato le startup"
    ],
    gold: [
      "Tra sette colli digitali e un vulcano che osserva",
      "Nel triangolo sacro tra mare, montagna e innovazione",
      "Dove i cesari digitali costruiscono il nuovo impero"
    ],
    black: [
      "Nel punto d'incontro tra 40°N e la via della seta tecnologica",
      "Dove l'alfabeto greco diventa codice binario",
      "Nel laboratorio segreto del Rinascimento 4.0"
    ],
    titanium: [
      "Sotto lo sguardo del gigante dormiente, dove i numeri romani diventano algoritmi",
      "Nel cerchio magico che collega tre capitali europee dell'innovazione"
    ]
  },
  week2: {
    base: [
      "In una nazione a forma di stivale, nella regione del sole",
      "Dove il caffè è espresso e l'innovazione rapida",
      "Nel paese delle mille città, cerca quella più giovane"
    ],
    silver: [
      "Capitale regionale del sud che guarda a nord",
      "Città universitaria con vista sul golfo più bello",
      "Dove Partenope danza con i bit e i byte"
    ],
    gold: [
      "La terza città più grande, seconda per importanza storica",
      "Porto antico, hub moderno tra Europa e Africa",
      "Dove il barocco incontra il blockchain"
    ],
    black: [
      "Coordinate: 40.8° latitudine, capitale culturale del Mezzogiorno",
      "Nel triangolo Milano-Roma-X, dove X è la sorpresa del sud",
      "Città dei tre castelli e infinite startup"
    ],
    titanium: [
      "Tra Vesuvio e Campi Flegrei, nel cratere dell'innovazione italiana",
      "Dove San Gennaro protegge gli acceleratori e le scale-up"
    ]
  },
  week3: {
    base: [
      "In un quartiere dove l'arte urbana incontra il codice",
      "Vicino a un parco tecnologico, ma non troppo lontano dal mare",
      "Dove i giovani founders bevono caffè speciali"
    ],
    silver: [
      "Nel distretto delle startup, vicino alla fermata della metro",
      "Tra incubatori certificati e coworking vista città",
      "Dove si tengono i più importanti meetup tech del sud"
    ],
    gold: [
      "A 500 metri dall'hub dell'innovazione regionale",
      "Nel raggio di 3 isolati dal centro congressi tech",
      "Edificio moderno, vetrate ampie, zona pedonale"
    ],
    black: [
      "Piano terra di un palazzo del 2015, lato strada principale",
      "Tra via Toledo e via Caracciolo, nel nuovo corso digitale",
      "Codice postale: 801XX, zona centrale moderna"
    ],
    titanium: [
      "Il premio attende al civico che risolve l'equazione: 3² + 7² + 5",
      "Longitudine 14.25°E ± 500m, cerca l'insegna blu"
    ]
  },
  week4: {
    base: [
      "Il premio è reale: un voucher Amazon da 100€",
      "Dentro una busta sigillata con QR code di validazione",
      "Nascosto in un luogo pubblico, ma non evidente"
    ],
    silver: [
      "Anagramma della via: OATLANDI → Ordina le lettere",
      "Il numero civico è la somma dei primi 4 numeri primi",
      "Guardalo bene: è dietro una pianta, a 1.60m da terra"
    ],
    gold: [
      "Coordinate precise: 40.8518°N, 14.2681°E (±10m)",
      "Orario migliore per la ricerca: 10:00-18:00 giorni feriali",
      "Il QR code sulla busta contiene la parola chiave: M1SSION"
    ],
    black: [
      "Nel raggio di 5 metri dal punto 40.8518°N 14.2681°E",
      "Altezza esatta: 1.60m, direzione: nordest rispetto all'ingresso",
      "Il premio è assicurato: polizza n. IT-M1S-2025-001"
    ],
    titanium: [
      "Ultimo indizio: Via dei Mille, 8b, 80121 Napoli - Acceleratore XYZ",
      "Il voucher è nel vaso della pianta di Ficus, interno reception"
    ]
  }
};

/**
 * Determina la settimana del mese corrente (1-4)
 * basata sulla settimana dell'anno (1-52)
 */
function getWeekOfMonth(weekOfYear: number): 1 | 2 | 3 | 4 {
  // Ciclo mensile di 4 settimane
  const weekInMonth = ((weekOfYear - 1) % 4) + 1;
  return weekInMonth as 1 | 2 | 3 | 4;
}

/**
 * Determina il tier basato sul conteggio BUZZ settimanale
 */
function getTierForBuzzCount(buzzCount: number): ClueData['tier'] {
  if (buzzCount < 3) return 'base';
  if (buzzCount < 7) return 'silver';
  if (buzzCount < 12) return 'gold';
  if (buzzCount < 20) return 'black';
  return 'titanium';
}

/**
 * Genera un seed pseudo-casuale ma deterministico per user + week
 */
function generateSeed(userId: string, weekOfYear: number): number {
  let hash = 0;
  const input = `${userId}-${weekOfYear}`;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Seleziona un indizio dal pool usando un seed deterministico
 * per evitare ripetizioni immediate
 */
function selectClueFromPool(pool: string[], seed: number, buzzCount: number): string {
  // Usa seed + buzzCount per variare la selezione
  const index = (seed + buzzCount) % pool.length;
  return pool[index];
}

/**
 * Motore principale di generazione indizi M1SSION™
 */
export function generateMissionClue(params: ClueGeneratorParams): ClueData {
  const { userId, buzzCount, weekOfYear } = params;
  
  const weekOfMonth = getWeekOfMonth(weekOfYear);
  const tier = getTierForBuzzCount(buzzCount);
  const seed = generateSeed(userId, weekOfYear);
  
  console.log('🎯 M1SSION™ CLUE GENERATION:', {
    userId: userId.substring(0, 8) + '...',
    buzzCount,
    weekOfYear,
    weekOfMonth,
    tier,
    seed: seed % 1000 // Log partial seed for privacy
  });
  
  // Seleziona il pool appropriato
  const weekKey = `week${weekOfMonth}` as keyof typeof CLUE_POOLS;
  const weekPool = CLUE_POOLS[weekKey];
  const tierPool = weekPool[tier];
  
  // Seleziona l'indizio usando il seed deterministico
  const clueText = selectClueFromPool(tierPool, seed, buzzCount);
  
  // Calcola difficoltà (1-10)
  const baseDifficulty = {
    base: 2,
    silver: 4,
    gold: 6,
    black: 8,
    titanium: 10
  }[tier];
  
  const difficulty = Math.min(10, baseDifficulty + Math.floor(buzzCount / 5));
  
  return {
    text: clueText,
    week: weekOfMonth,
    tier,
    difficulty
  };
}

/**
 * Helper: Ottiene la settimana dell'anno corrente (1-52)
 */
export function getCurrentWeekOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.ceil(diff / oneWeek);
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
