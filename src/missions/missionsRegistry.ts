/**
 * DAILY MISSIONS REGISTRY
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Central config-driven missions registry.
 * Add new missions here without code changes elsewhere.
 * 
 * 🔒 ROLLBACK: Set MISSIONS_ENABLED = false to disable entire system.
 */

// ═══════════════════════════════════════════════════════════════
// 🎚️ MASTER FLAGS
// ═══════════════════════════════════════════════════════════════

/**
 * Master kill switch for entire missions system.
 * Phase 0 (Daily Legacy Hide): set to false to hide all legacy daily mission UI.
 * Rollback: set back to true to restore legacy daily missions.
 */
export const MISSIONS_ENABLED = false;

/** Safe mode: rewards stored in localStorage only, no DB writes */
export const MISSIONS_REWARD_SAFE_MODE = true;

// ═══════════════════════════════════════════════════════════════
// 📊 TYPES
// ═══════════════════════════════════════════════════════════════

export type MissionDifficulty = 'base' | 'logic' | 'complex' | 'special';

export type MissionPhase = 0 | 1 | 2 | 3;
// 0 = not started
// 1 = phase1 active (today)
// 2 = awaiting phase2 (return tomorrow)
// 3 = completed

/** Input validation configuration */
export interface InputValidation {
  /** 'exact' = exact match, 'regex' = regex pattern, 'any' = any non-empty */
  type: 'exact' | 'regex' | 'any';
  /** Pattern for exact match or regex (not needed for 'any') */
  pattern?: string;
  /** Case insensitive match (default: true) */
  caseSensitive?: boolean;
  /** Error message shown on validation failure */
  errorMessage?: string;
}

/** Counter configuration for game/skill missions */
export interface CounterConfig {
  /** Storage key in progressData */
  key: string;
  /** Target count to reach */
  target: number;
  /** Label shown in UI (Italian) */
  label?: string;
}

export interface MissionDefinition {
  id: string;
  title: string;
  /** Briefing text (ENGLISH) */
  briefing: string;
  /** Description/explanation (ITALIAN) */
  description: string;
  difficulty: MissionDifficulty;
  totalRewardM1U: number;
  phase1: {
    /** Instruction text (ITALIAN) */
    instruction: string;
    actionType: 'input' | 'confirm' | 'select_zone' | 'counter';
    /** For input type: placeholder text */
    inputPlaceholder?: string;
    /** For input type: validation rules */
    inputValidation?: InputValidation;
    /** For counter type: counter configuration */
    counter?: CounterConfig;
  };
  phase2: {
    /** Instruction text (ITALIAN) */
    instruction: string;
    actionType: 'confirm' | 'input' | 'counter';
    /** For input type: placeholder text */
    inputPlaceholder?: string;
    /** For input type: validation rules */
    inputValidation?: InputValidation;
    /** For counter type: counter configuration */
    counter?: CounterConfig;
    /** Optional hint text (ITALIAN) */
    hint?: string;
  };
  icon: string;
  /** If true, mission available every day. If false, one-time. */
  repeatable: boolean;
}

// ═══════════════════════════════════════════════════════════════
// 💰 REWARD BOUNDS (DO NOT EXCEED)
// ═══════════════════════════════════════════════════════════════

export const REWARD_BOUNDS: Record<MissionDifficulty, { min: number; max: number }> = {
  base: { min: 10, max: 20 },
  logic: { min: 20, max: 40 },
  complex: { min: 40, max: 80 },
  special: { min: 20, max: 60 },
};

// ═══════════════════════════════════════════════════════════════
// 🎯 MISSIONS REGISTRY (30 REAL MISSIONS)
// ═══════════════════════════════════════════════════════════════

export const MISSIONS_REGISTRY: MissionDefinition[] = [
  // ─────────────────────────────────────────────────────────────
  // MISSION 1 — OPEN SOURCE INTEL (WEB)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'open_source_intel',
    title: 'OPEN SOURCE INTEL',
    briefing: 'An intelligence fragment is missing.\nSearch the web. Verify the source.\nReturn here with the correct answer.',
    description: 'Cerca online l\'informazione richiesta.\nTorna in M1SSION e inserisci la risposta corretta.',
    difficulty: 'logic',
    totalRewardM1U: 20, // Split: 10 + 10
    phase1: {
      instruction: 'Inserisci il codice segreto trovato durante la ricerca.',
      actionType: 'input',
      inputPlaceholder: 'Inserisci il codice...',
      inputValidation: {
        type: 'exact',
        pattern: 'PROJECT_AURORA',
        caseSensitive: false,
        errorMessage: 'Codice non valido. Cerca meglio!',
      },
    },
    phase2: {
      instruction: 'Inserisci la fonte dove hai trovato l\'informazione (nome sito o dominio).',
      actionType: 'input',
      inputPlaceholder: 'Es: wikipedia.org',
      inputValidation: {
        type: 'any',
        errorMessage: 'Inserisci una fonte valida.',
      },
    },
    icon: '🌐',
    repeatable: true,
  },

  // ─────────────────────────────────────────────────────────────
  // MISSION 2 — URBAN RIDDLE (CITTÀ)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'urban_riddle',
    title: 'URBAN RIDDLE',
    briefing: 'A location is known.\nThe path is hidden.\nDecode it.',
    description: 'Non devi muoverti fisicamente.\nRisolvi l\'indovinello urbano.',
    difficulty: 'logic',
    totalRewardM1U: 40, // Split: 20 + 20
    phase1: {
      instruction: 'Quale strada romana porta il nome di un famoso condottiero?',
      actionType: 'input',
      inputPlaceholder: 'Inserisci la risposta...',
      inputValidation: {
        type: 'regex',
        pattern: 'cesare',
        caseSensitive: false,
        errorMessage: 'Risposta errata. Pensa all\'antica Roma...',
      },
    },
    phase2: {
      instruction: 'Conferma la tua risposta e completa la missione.',
      actionType: 'confirm',
      hint: 'Suggerimento: pensa all\'epoca imperiale.',
    },
    icon: '🏛️',
    repeatable: true,
  },

  // ─────────────────────────────────────────────────────────────
  // MISSION 3 — PULSE BREAKER CHALLENGE
  // ─────────────────────────────────────────────────────────────
  {
    id: 'pulse_breaker_challenge',
    title: 'PULSE BREAKER CHALLENGE',
    briefing: 'System instability detected.\nStabilize the pulse.',
    description: 'Vai su Pulse Breaker.\nOttieni 5 risultati positivi oggi, poi altri 3 domani.',
    difficulty: 'special',
    totalRewardM1U: 20, // Split: 10 + 10
    phase1: {
      instruction: 'Gioca a Pulse Breaker e ottieni 5 vittorie.',
      actionType: 'counter',
      counter: {
        key: 'pulse_breaker_wins',
        target: 5,
        label: 'Vittorie',
      },
    },
    phase2: {
      instruction: 'Completa altre 3 vittorie per finalizzare la sfida.',
      actionType: 'counter',
      counter: {
        key: 'pulse_breaker_wins',
        target: 8, // Cumulative: 5 + 3
        label: 'Vittorie totali',
      },
    },
    icon: '🎮',
    repeatable: true,
  },

  // ─────────────────────────────────────────────────────────────
  // MISSION 4 — SIGNAL TRACE (OSSERVAZIONE)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'signal_trace',
    title: 'SIGNAL TRACE',
    briefing: 'A hidden signal awaits.\nFind the unique visual detail within the app.',
    description: 'Trova un dettaglio visivo unico nell\'app.\nDomani conferma dove l\'hai visto.',
    difficulty: 'base',
    totalRewardM1U: 20, // Split: 10 + 10
    phase1: {
      instruction: 'Descrivi il dettaglio visivo che hai trovato nell\'app.',
      actionType: 'input',
      inputPlaceholder: 'Cosa hai notato?',
      inputValidation: {
        type: 'any',
      },
    },
    phase2: {
      instruction: 'Indica dove esattamente hai visto questo dettaglio.',
      actionType: 'input',
      inputPlaceholder: 'Es: nella mappa, nel menu...',
      inputValidation: {
        type: 'any',
      },
    },
    icon: '📡',
    repeatable: true,
  },

  // ─────────────────────────────────────────────────────────────
  // MISSION 5 — CODE FRAGMENT (LOGICA/DEDUZIONE)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'code_fragment',
    title: 'CODE FRAGMENT',
    briefing: 'A fragment is corrupted.\nChoose the correct piece to restore the sequence.',
    description: 'Scegli il frammento corretto per completare la sequenza.\nDomani spiega il perché.',
    difficulty: 'logic',
    totalRewardM1U: 30, // Split: 15 + 15
    phase1: {
      instruction: 'Sequenza: 2, 4, 8, 16, ?\nQual è il numero successivo?',
      actionType: 'input',
      inputPlaceholder: 'Inserisci il numero...',
      inputValidation: {
        type: 'exact',
        pattern: '32',
        errorMessage: 'Risposta errata. Osserva la progressione...',
      },
    },
    phase2: {
      instruction: 'Spiega la logica dietro la sequenza.',
      actionType: 'input',
      inputPlaceholder: 'Es: ogni numero raddoppia...',
      inputValidation: {
        type: 'any',
      },
    },
    icon: '🧩',
    repeatable: true,
  },

  // ─────────────────────────────────────────────────────────────
  // MISSION 6 — AREA UNDER OBSERVATION (LITE)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'area_observation_lite',
    title: 'AREA UNDER OBSERVATION',
    briefing: 'Intelligence required.\nObserve the map. Report your findings.',
    description: 'Osserva la mappa e rispondi a una semplice domanda.\nNessun Buzz richiesto, nessuna spesa.',
    difficulty: 'base',
    totalRewardM1U: 20, // Split: 10 + 10
    phase1: {
      instruction: 'Osserva la mappa. Quanti marker vedi nella tua zona?',
      actionType: 'input',
      inputPlaceholder: 'Inserisci un numero...',
      inputValidation: {
        type: 'any', // Accept any answer for observation
      },
    },
    phase2: {
      instruction: 'Conferma la tua osservazione e completa la missione.',
      actionType: 'confirm',
    },
    icon: '🔭',
    repeatable: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // 🆕 WEEK 2 MISSIONS (7-11)
  // ═══════════════════════════════════════════════════════════════

  // ─────────────────────────────────────────────────────────────
  // MISSION 7 — PATTERN BREAK (LOGICA/DEDUZIONE)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'pattern_break',
    title: 'PATTERN BREAK',
    briefing: 'Something doesn\'t belong.\nFind the anomaly.',
    description: 'Osserva gli elementi mostrati.\nUno di essi rompe il pattern. Trovalo.',
    difficulty: 'logic',
    totalRewardM1U: 40, // Split: 20 + 20
    phase1: {
      instruction: 'Elementi: 🔴 🔴 🔴 🟢 🔴\nQuale elemento rompe il pattern? (inserisci la posizione: 1-5)',
      actionType: 'input',
      inputPlaceholder: 'Inserisci il numero (1-5)...',
      inputValidation: {
        type: 'exact',
        pattern: '4',
        caseSensitive: false,
        errorMessage: 'Risposta errata. Osserva meglio il pattern...',
      },
    },
    phase2: {
      instruction: 'Spiega perché quell\'elemento rompe il pattern.',
      actionType: 'input',
      inputPlaceholder: 'Es: perché è l\'unico verde...',
      inputValidation: {
        type: 'any',
      },
    },
    icon: '🔍',
    repeatable: true,
  },

  // ─────────────────────────────────────────────────────────────
  // MISSION 8 — CHAIN OF INTEL (INVESTIGATIVA/MULTI-STEP)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'chain_of_intel',
    title: 'CHAIN OF INTEL',
    briefing: 'One answer leads to another.\nFollow the chain.',
    description: 'Una risposta porta alla successiva.\nSegui la catena di informazioni.',
    difficulty: 'logic',
    totalRewardM1U: 40, // Split: 20 + 20
    phase1: {
      instruction: 'Domanda A: Qual è la capitale dell\'Italia?',
      actionType: 'input',
      inputPlaceholder: 'Inserisci la risposta...',
      inputValidation: {
        type: 'regex',
        pattern: 'roma',
        caseSensitive: false,
        errorMessage: 'Risposta errata. Pensa alla geografia italiana...',
      },
    },
    phase2: {
      instruction: 'Domanda B: In quale regione si trova la capitale che hai indicato ieri?',
      actionType: 'input',
      inputPlaceholder: 'Inserisci la regione...',
      inputValidation: {
        type: 'regex',
        pattern: 'lazio',
        caseSensitive: false,
        errorMessage: 'Risposta errata. Verifica la tua risposta precedente...',
      },
      hint: 'La risposta è collegata alla capitale italiana.',
    },
    icon: '🔗',
    repeatable: true,
  },

  // ─────────────────────────────────────────────────────────────
  // MISSION 9 — TIME DISTORTION (LOGICA/CRONOLOGIA)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'time_distortion',
    title: 'TIME DISTORTION',
    briefing: 'Time is out of order.\nRestore it.',
    description: 'Il tempo è stato alterato.\nRimetti in ordine gli eventi.',
    difficulty: 'logic',
    totalRewardM1U: 40, // Split: 20 + 20
    phase1: {
      instruction: 'Eventi: A) Scoperta dell\'America, B) Rivoluzione Francese, C) Caduta Impero Romano\nOrdina cronologicamente (es: C,A,B)',
      actionType: 'input',
      inputPlaceholder: 'Es: C,A,B',
      inputValidation: {
        type: 'regex',
        pattern: '^\\s*c\\s*,\\s*a\\s*,\\s*b\\s*$',
        caseSensitive: false,
        errorMessage: 'Ordine errato. Pensa alle date storiche...',
      },
    },
    phase2: {
      instruction: 'Inserisci l\'anno approssimativo di uno degli eventi (es: 1492 per la Scoperta dell\'America).',
      actionType: 'input',
      inputPlaceholder: 'Inserisci un anno...',
      inputValidation: {
        type: 'any',
      },
      hint: 'Impero Romano caduto nel 476 d.C., America 1492, Rivoluzione Francese 1789.',
    },
    icon: '⏰',
    repeatable: true,
  },

  // ─────────────────────────────────────────────────────────────
  // MISSION 10 — FALSE SIGNAL (ANALISI CRITICA)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'false_signal',
    title: 'FALSE SIGNAL',
    briefing: 'Not everything is true.\nIdentify the false signal.',
    description: 'Non tutto è vero.\nIdentifica l\'affermazione falsa.',
    difficulty: 'complex',
    totalRewardM1U: 60, // Split: 30 + 30
    phase1: {
      instruction: 'Quale affermazione è FALSA?\nA) Il sole sorge a est\nB) L\'acqua bolle a 50°C\nC) La Terra orbita attorno al Sole\n(Inserisci A, B o C)',
      actionType: 'input',
      inputPlaceholder: 'Inserisci A, B o C',
      inputValidation: {
        type: 'exact',
        pattern: 'B',
        caseSensitive: false,
        errorMessage: 'Risposta errata. Rifletti sulle leggi della fisica...',
      },
    },
    phase2: {
      instruction: 'Spiega perché quell\'affermazione è falsa.',
      actionType: 'input',
      inputPlaceholder: 'Es: perché l\'acqua bolle a 100°C...',
      inputValidation: {
        type: 'any',
      },
    },
    icon: '⚠️',
    repeatable: true,
  },

  // ─────────────────────────────────────────────────────────────
  // MISSION 11 — SHADOW ZONE (STRATEGICA/MAPPA)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'shadow_zone',
    title: 'SHADOW ZONE',
    briefing: 'Some areas are silent.\nFind out why.',
    description: 'Alcune aree sono silenziose.\nScopri il perché.',
    difficulty: 'logic',
    totalRewardM1U: 40, // Split: 20 + 20
    phase1: {
      instruction: 'Osserva la mappa. Quale tipo di area sembra avere meno attività? (es: centro, periferia, zone verdi, zone industriali)',
      actionType: 'input',
      inputPlaceholder: 'Inserisci la tua osservazione...',
      inputValidation: {
        type: 'any',
      },
    },
    phase2: {
      instruction: 'Spiega perché pensi che quell\'area abbia meno attività.',
      actionType: 'input',
      inputPlaceholder: 'Es: meno popolazione, zona isolata...',
      inputValidation: {
        type: 'any',
      },
      hint: 'Pensa alla densità abitativa e ai punti di interesse.',
    },
    icon: '🌑',
    repeatable: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // 🆕 BATCH 2 — MISSIONS 12-30 (MEDIA → ALTA → BONUS)
  // ═══════════════════════════════════════════════════════════════

  // ─────────────────────────────────────────────────────────────
  // MISSION 12 — CIPHER DECODE (LOGICA)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'cipher_decode',
    title: 'CIPHER DECODE',
    briefing: 'A coded message awaits.\nDecode it to proceed.',
    description: 'Un messaggio cifrato ti aspetta.\nDecifralo per procedere.',
    difficulty: 'logic',
    totalRewardM1U: 30, // Split: 15 + 15
    phase1: {
      instruction: 'Decifra: Se A=1, B=2, C=3... cosa significa "13-1-16-16-1"?',
      actionType: 'input',
      inputPlaceholder: 'Inserisci la parola...',
      inputValidation: {
        type: 'regex',
        pattern: 'mappa',
        caseSensitive: false,
        errorMessage: 'Codice errato. Ogni numero corrisponde a una lettera...',
      },
    },
    phase2: {
      instruction: 'Crea un tuo codice numerico per la parola "INTEL" e inseriscilo.',
      actionType: 'input',
      inputPlaceholder: 'Es: 9-14-20-5-12',
      inputValidation: {
        type: 'regex',
        pattern: '9.*14.*20.*5.*12',
        caseSensitive: false,
        errorMessage: 'Codice non corretto. Ricorda: I=9, N=14, T=20, E=5, L=12',
      },
      hint: 'I=9, N=14, T=20, E=5, L=12',
    },
    icon: '🔐',
    repeatable: true,
  },

  // ─────────────────────────────────────────────────────────────
  // MISSION 13 — MEMORY MATRIX (MEMORIA)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'memory_matrix',
    title: 'MEMORY MATRIX',
    briefing: 'Your memory is tested.\nRemember the sequence.',
    description: 'La tua memoria viene testata.\nRicorda la sequenza.',
    difficulty: 'logic',
    totalRewardM1U: 30, // Split: 15 + 15
    phase1: {
      instruction: 'Memorizza questa sequenza: 🔵 🔴 🟢 🔵 🟡\nDomani dovrai ricordarla. Conferma di aver memorizzato.',
      actionType: 'confirm',
    },
    phase2: {
      instruction: 'Qual era la sequenza di ieri? (usa le iniziali: B=blu, R=rosso, G=verde, Y=giallo)',
      actionType: 'input',
      inputPlaceholder: 'Es: B,R,G,B,Y',
      inputValidation: {
        type: 'regex',
        pattern: '^\\s*b\\s*,\\s*r\\s*,\\s*g\\s*,\\s*b\\s*,\\s*y\\s*$',
        caseSensitive: false,
        errorMessage: 'Sequenza errata. Era: Blu, Rosso, Verde, Blu, Giallo',
      },
    },
    icon: '🧠',
    repeatable: true,
  },

  // ─────────────────────────────────────────────────────────────
  // MISSION 14 — WORD PUZZLE (LINGUISTICA)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'word_puzzle',
    title: 'WORD PUZZLE',
    briefing: 'Words hide secrets.\nUnscramble them.',
    description: 'Le parole nascondono segreti.\nRiordinale.',
    difficulty: 'logic',
    totalRewardM1U: 30, // Split: 15 + 15
    phase1: {
      instruction: 'Anagramma: NEISSIMO = ?',
      actionType: 'input',
      inputPlaceholder: 'Inserisci la parola...',
      inputValidation: {
        type: 'regex',
        pattern: 'missione',
        caseSensitive: false,
        errorMessage: 'Parola errata. Riordina le lettere...',
      },
    },
    phase2: {
      instruction: 'Crea un anagramma della parola "AGENTE" e inseriscilo.',
      actionType: 'input',
      inputPlaceholder: 'Es: TENGAE, GETNAE...',
      inputValidation: {
        type: 'any',
      },
    },
    icon: '📝',
    repeatable: true,
  },

  // ─────────────────────────────────────────────────────────────
  // MISSION 15 — MATH SEQUENCE (MATEMATICA)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'math_sequence',
    title: 'MATH SEQUENCE',
    briefing: 'Numbers tell stories.\nFind the pattern.',
    description: 'I numeri raccontano storie.\nTrova il pattern.',
    difficulty: 'logic',
    totalRewardM1U: 40, // Split: 20 + 20
    phase1: {
      instruction: 'Sequenza: 1, 1, 2, 3, 5, 8, ?\nQual è il numero successivo?',
      actionType: 'input',
      inputPlaceholder: 'Inserisci il numero...',
      inputValidation: {
        type: 'exact',
        pattern: '13',
        errorMessage: 'Risposta errata. È la sequenza di Fibonacci...',
      },
    },
    phase2: {
      instruction: 'Come si chiama questa famosa sequenza numerica?',
      actionType: 'input',
      inputPlaceholder: 'Inserisci il nome...',
      inputValidation: {
        type: 'regex',
        pattern: 'fibonacci',
        caseSensitive: false,
        errorMessage: 'Nome errato. Cerca su internet...',
      },
      hint: 'Prende il nome da un matematico italiano del 1200.',
    },
    icon: '🔢',
    repeatable: true,
  },

  // ─────────────────────────────────────────────────────────────
  // MISSION 16 — HIDDEN MESSAGE (INVESTIGAZIONE)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'hidden_message',
    title: 'HIDDEN MESSAGE',
    briefing: 'Look closer.\nThe message is hidden in plain sight.',
    description: 'Guarda più attentamente.\nIl messaggio è nascosto in bella vista.',
    difficulty: 'logic',
    totalRewardM1U: 30, // Split: 15 + 15
    phase1: {
      instruction: 'Leggi le iniziali: "Mission Impossible Starts Saturday In October Now"\nQuale parola formano?',
      actionType: 'input',
      inputPlaceholder: 'Inserisci la parola...',
      inputValidation: {
        type: 'regex',
        pattern: 'mission',
        caseSensitive: false,
        errorMessage: 'Parola errata. Leggi solo le iniziali...',
      },
    },
    phase2: {
      instruction: 'Crea una frase le cui iniziali formano "INTEL" e inseriscila.',
      actionType: 'input',
      inputPlaceholder: 'Es: I Never Tell Everyone Lies',
      inputValidation: {
        type: 'any',
      },
    },
    icon: '🔎',
    repeatable: true,
  },

  // ─────────────────────────────────────────────────────────────
  // MISSION 17 — LOCATION TRACKER (GEOGRAFIA)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'location_tracker',
    title: 'LOCATION TRACKER',
    briefing: 'A location must be identified.\nUse your knowledge.',
    description: 'Una posizione deve essere identificata.\nUsa le tue conoscenze.',
    difficulty: 'logic',
    totalRewardM1U: 40, // Split: 20 + 20
    phase1: {
      instruction: 'Quale città italiana è famosa per il Colosseo?',
      actionType: 'input',
      inputPlaceholder: 'Inserisci la città...',
      inputValidation: {
        type: 'regex',
        pattern: 'roma',
        caseSensitive: false,
        errorMessage: 'Città errata. Pensa ai monumenti romani...',
      },
    },
    phase2: {
      instruction: 'Nomina un altro famoso monumento di quella città.',
      actionType: 'input',
      inputPlaceholder: 'Es: Fontana di Trevi, Pantheon...',
      inputValidation: {
        type: 'any',
      },
      hint: 'Roma ha molti monumenti famosi: fontane, chiese, fori...',
    },
    icon: '📍',
    repeatable: true,
  },

  // ─────────────────────────────────────────────────────────────
  // MISSION 18 — LOGIC GATE (LOGICA BOOLEANA)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'logic_gate',
    title: 'LOGIC GATE',
    briefing: 'True or False?\nThe logic must be sound.',
    description: 'Vero o Falso?\nLa logica deve essere corretta.',
    difficulty: 'logic',
    totalRewardM1U: 40, // Split: 20 + 20
    phase1: {
      instruction: 'Se TUTTI i gatti sono animali, e TUTTI gli animali respirano, allora TUTTI i gatti respirano. Vero o Falso?',
      actionType: 'input',
      inputPlaceholder: 'Inserisci V o F',
      inputValidation: {
        type: 'regex',
        pattern: '^\\s*(v|vero|true|t)\\s*$',
        caseSensitive: false,
        errorMessage: 'Risposta errata. Ragiona sulla logica transitiva...',
      },
    },
    phase2: {
      instruction: 'Spiega perché la tua risposta è corretta.',
      actionType: 'input',
      inputPlaceholder: 'Es: perché se A implica B e B implica C...',
      inputValidation: {
        type: 'any',
      },
    },
    icon: '🔀',
    repeatable: true,
  },

  // ─────────────────────────────────────────────────────────────
  // MISSION 19 — DEEP SEARCH (INVESTIGAZIONE AVANZATA)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'deep_search',
    title: 'DEEP SEARCH',
    briefing: 'Surface data is not enough.\nDig deeper.',
    description: 'I dati superficiali non bastano.\nScava più a fondo.',
    difficulty: 'complex',
    totalRewardM1U: 50, // Split: 25 + 25
    phase1: {
      instruction: 'Cerca online: in che anno è stata fondata Wikipedia?',
      actionType: 'input',
      inputPlaceholder: 'Inserisci l\'anno...',
      inputValidation: {
        type: 'exact',
        pattern: '2001',
        errorMessage: 'Anno errato. Verifica su internet...',
      },
    },
    phase2: {
      instruction: 'Chi sono i due fondatori di Wikipedia? (inserisci entrambi i cognomi)',
      actionType: 'input',
      inputPlaceholder: 'Es: Cognome1, Cognome2',
      inputValidation: {
        type: 'regex',
        pattern: '(wales.*sanger|sanger.*wales)',
        caseSensitive: false,
        errorMessage: 'Nomi errati. Cerca "fondatori Wikipedia"...',
      },
      hint: 'Jimmy W. e Larry S.',
    },
    icon: '🕵️',
    repeatable: true,
  },

  // ─────────────────────────────────────────────────────────────
  // MISSION 20 — COUNTER STRIKE (SKILL/COUNTER)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'counter_strike',
    title: 'COUNTER STRIKE',
    briefing: 'Precision is key.\nHit your targets.',
    description: 'La precisione è fondamentale.\nColpisci i tuoi obiettivi.',
    difficulty: 'special',
    totalRewardM1U: 40, // Split: 20 + 20
    phase1: {
      instruction: 'Gioca a Pulse Breaker e raggiungi 10 vittorie.',
      actionType: 'counter',
      counter: {
        key: 'counter_strike_wins',
        target: 10,
        label: 'Vittorie',
      },
    },
    phase2: {
      instruction: 'Raggiungi 15 vittorie totali per completare la sfida.',
      actionType: 'counter',
      counter: {
        key: 'counter_strike_wins',
        target: 15,
        label: 'Vittorie totali',
      },
    },
    icon: '🎯',
    repeatable: true,
  },

  // ─────────────────────────────────────────────────────────────
  // MISSION 21 — TRIVIA MASTER (CULTURA GENERALE)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'trivia_master',
    title: 'TRIVIA MASTER',
    briefing: 'Knowledge is power.\nProve your wisdom.',
    description: 'La conoscenza è potere.\nDimostra la tua saggezza.',
    difficulty: 'complex',
    totalRewardM1U: 50, // Split: 25 + 25
    phase1: {
      instruction: 'Quale pianeta del sistema solare è il più grande?',
      actionType: 'input',
      inputPlaceholder: 'Inserisci il nome del pianeta...',
      inputValidation: {
        type: 'regex',
        pattern: 'giove|jupiter',
        caseSensitive: false,
        errorMessage: 'Pianeta errato. È un gigante gassoso...',
      },
    },
    phase2: {
      instruction: 'Quante lune ha approssimativamente questo pianeta? (inserisci un numero)',
      actionType: 'input',
      inputPlaceholder: 'Inserisci un numero...',
      inputValidation: {
        type: 'regex',
        pattern: '(7[0-9]|8[0-9]|9[0-5])',
        caseSensitive: false,
        errorMessage: 'Numero errato. Giove ha tra 70 e 95 lune conosciute...',
      },
      hint: 'Giove ha più di 70 lune confermate.',
    },
    icon: '🏆',
    repeatable: true,
  },

  // ─────────────────────────────────────────────────────────────
  // MISSION 22 — VISUAL SCAN (OSSERVAZIONE)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'visual_scan',
    title: 'VISUAL SCAN',
    briefing: 'Eyes wide open.\nNotice what others miss.',
    description: 'Occhi ben aperti.\nNota ciò che gli altri non vedono.',
    difficulty: 'base',
    totalRewardM1U: 20, // Split: 10 + 10
    phase1: {
      instruction: 'Esplora l\'app M1SSION. Di che colore è principalmente l\'interfaccia? (es: blu, verde, nero...)',
      actionType: 'input',
      inputPlaceholder: 'Inserisci il colore dominante...',
      inputValidation: {
        type: 'any',
      },
    },
    phase2: {
      instruction: 'Quale icona appare nel menu di navigazione in basso? Descrivi una di esse.',
      actionType: 'input',
      inputPlaceholder: 'Es: casa, mappa, profilo...',
      inputValidation: {
        type: 'any',
      },
    },
    icon: '👁️',
    repeatable: true,
  },

  // ─────────────────────────────────────────────────────────────
  // MISSION 23 — CRYPTO ANALYSIS (CRITTOGRAFIA)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'crypto_analysis',
    title: 'CRYPTO ANALYSIS',
    briefing: 'Encrypted data detected.\nBreak the code.',
    description: 'Dati criptati rilevati.\nDecifra il codice.',
    difficulty: 'complex',
    totalRewardM1U: 60, // Split: 30 + 30
    phase1: {
      instruction: 'Cifrario di Cesare (+3): "DJHQWH" diventa?',
      actionType: 'input',
      inputPlaceholder: 'Inserisci la parola decifrata...',
      inputValidation: {
        type: 'regex',
        pattern: 'agente',
        caseSensitive: false,
        errorMessage: 'Decifratura errata. Sposta ogni lettera indietro di 3 posizioni...',
      },
    },
    phase2: {
      instruction: 'Cifra la parola "INTEL" con Cesare +3 e inseriscila.',
      actionType: 'input',
      inputPlaceholder: 'Inserisci la parola cifrata...',
      inputValidation: {
        type: 'regex',
        pattern: 'lqwho',
        caseSensitive: false,
        errorMessage: 'Cifratura errata. I→L, N→Q, T→W, E→H, L→O',
      },
      hint: 'Cesare +3: A→D, B→E, C→F...',
    },
    icon: '🔒',
    repeatable: true,
  },

  // ─────────────────────────────────────────────────────────────
  // MISSION 24 — BINARY DECODE (INFORMATICA)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'binary_decode',
    title: 'BINARY DECODE',
    briefing: '01001000 01101001\nTranslate the machine language.',
    description: 'Traduci il linguaggio macchina.\n0 e 1 nascondono messaggi.',
    difficulty: 'complex',
    totalRewardM1U: 60, // Split: 30 + 30
    phase1: {
      instruction: 'Quale numero decimale corrisponde a 1010 in binario?',
      actionType: 'input',
      inputPlaceholder: 'Inserisci il numero decimale...',
      inputValidation: {
        type: 'exact',
        pattern: '10',
        errorMessage: 'Numero errato. 1010 = 8+0+2+0 = ?',
      },
    },
    phase2: {
      instruction: 'Converti il numero 15 in binario.',
      actionType: 'input',
      inputPlaceholder: 'Inserisci il numero binario...',
      inputValidation: {
        type: 'regex',
        pattern: '1111',
        caseSensitive: false,
        errorMessage: 'Conversione errata. 15 = 8+4+2+1 = 1111',
      },
      hint: '15 = 8+4+2+1. Ogni posizione che vale 1...',
    },
    icon: '💻',
    repeatable: true,
  },

  // ─────────────────────────────────────────────────────────────
  // MISSION 25 — PUZZLE MASTER (ALTA DIFFICOLTÀ)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'puzzle_master',
    title: 'PUZZLE MASTER',
    briefing: 'The ultimate test.\nOnly the sharpest minds prevail.',
    description: 'Il test definitivo.\nSolo le menti più acute prevalgono.',
    difficulty: 'complex',
    totalRewardM1U: 70, // Split: 35 + 35
    phase1: {
      instruction: 'Risolvi: Se 2+3=10, 7+2=63, 6+5=66, allora 8+4=?',
      actionType: 'input',
      inputPlaceholder: 'Inserisci il risultato...',
      inputValidation: {
        type: 'exact',
        pattern: '96',
        errorMessage: 'Risposta errata. La formula è: a×b + a = risultato (quindi 8×4+8×4=96? No... a×(a+b)=risultato → 8×12=96)',
      },
    },
    phase2: {
      instruction: 'Spiega la logica che hai usato per risolvere il puzzle.',
      actionType: 'input',
      inputPlaceholder: 'Es: ogni risultato è a×(a+b)...',
      inputValidation: {
        type: 'any',
      },
      hint: 'Formula: primo numero × (primo + secondo)',
    },
    icon: '🧩',
    repeatable: true,
  },

  // ─────────────────────────────────────────────────────────────
  // MISSION 26 — HISTORICAL INTEL (STORIA)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'historical_intel',
    title: 'HISTORICAL INTEL',
    briefing: 'History holds the keys.\nUnlock the past.',
    description: 'La storia custodisce le chiavi.\nSblocca il passato.',
    difficulty: 'complex',
    totalRewardM1U: 60, // Split: 30 + 30
    phase1: {
      instruction: 'In quale anno l\'uomo è atterrato sulla Luna per la prima volta?',
      actionType: 'input',
      inputPlaceholder: 'Inserisci l\'anno...',
      inputValidation: {
        type: 'exact',
        pattern: '1969',
        errorMessage: 'Anno errato. Pensa alla missione Apollo...',
      },
    },
    phase2: {
      instruction: 'Come si chiamava la missione spaziale? (nome completo)',
      actionType: 'input',
      inputPlaceholder: 'Inserisci il nome della missione...',
      inputValidation: {
        type: 'regex',
        pattern: 'apollo.*11|apollo\\s*11',
        caseSensitive: false,
        errorMessage: 'Nome errato. Era Apollo qualcosa...',
      },
      hint: 'La missione porta il nome del dio greco del sole.',
    },
    icon: '📜',
    repeatable: true,
  },

  // ─────────────────────────────────────────────────────────────
  // MISSION 27 — ENDURANCE TEST (SKILL/COUNTER AVANZATO)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'endurance_test',
    title: 'ENDURANCE TEST',
    briefing: 'Stamina required.\nProve your persistence.',
    description: 'Resistenza richiesta.\nDimostra la tua perseveranza.',
    difficulty: 'complex',
    totalRewardM1U: 80, // Split: 40 + 40
    phase1: {
      instruction: 'Raggiungi 20 vittorie in Pulse Breaker. La sfida è impegnativa!',
      actionType: 'counter',
      counter: {
        key: 'endurance_wins',
        target: 20,
        label: 'Vittorie',
      },
    },
    phase2: {
      instruction: 'Completa altre 10 vittorie per un totale di 30.',
      actionType: 'counter',
      counter: {
        key: 'endurance_wins',
        target: 30,
        label: 'Vittorie totali',
      },
    },
    icon: '💪',
    repeatable: true,
  },

  // ─────────────────────────────────────────────────────────────
  // MISSION 28 — SCIENCE LAB (SCIENZA)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'science_lab',
    title: 'SCIENCE LAB',
    briefing: 'Scientific knowledge required.\nAnalyze the data.',
    description: 'Conoscenze scientifiche richieste.\nAnalizza i dati.',
    difficulty: 'complex',
    totalRewardM1U: 60, // Split: 30 + 30
    phase1: {
      instruction: 'Qual è il simbolo chimico dell\'oro?',
      actionType: 'input',
      inputPlaceholder: 'Inserisci il simbolo...',
      inputValidation: {
        type: 'exact',
        pattern: 'Au',
        caseSensitive: false,
        errorMessage: 'Simbolo errato. Deriva dal latino "Aurum"...',
      },
    },
    phase2: {
      instruction: 'Qual è il numero atomico dell\'oro?',
      actionType: 'input',
      inputPlaceholder: 'Inserisci il numero...',
      inputValidation: {
        type: 'exact',
        pattern: '79',
        errorMessage: 'Numero errato. Cerca nella tavola periodica...',
      },
      hint: 'È un numero tra 70 e 80.',
    },
    icon: '🔬',
    repeatable: true,
  },

  // ─────────────────────────────────────────────────────────────
  // MISSION 29 — FINAL LOGIC (LOGICA AVANZATA)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'final_logic',
    title: 'FINAL LOGIC',
    briefing: 'The last test of reason.\nThink carefully.',
    description: 'L\'ultimo test di ragionamento.\nPensa attentamente.',
    difficulty: 'complex',
    totalRewardM1U: 70, // Split: 35 + 35
    phase1: {
      instruction: 'Un contadino ha 17 pecore. Tutte tranne 9 scappano. Quante pecore restano?',
      actionType: 'input',
      inputPlaceholder: 'Inserisci il numero...',
      inputValidation: {
        type: 'exact',
        pattern: '9',
        errorMessage: 'Risposta errata. Rileggi: "tutte TRANNE 9"...',
      },
    },
    phase2: {
      instruction: 'Spiega perché la risposta non è 17-9=8.',
      actionType: 'input',
      inputPlaceholder: 'Es: perché la frase dice che...',
      inputValidation: {
        type: 'any',
      },
      hint: '"Tutte tranne 9" significa che 9 NON scappano.',
    },
    icon: '🎓',
    repeatable: true,
  },

  // ─────────────────────────────────────────────────────────────
  // MISSION 30 — ULTIMATE CHALLENGE (BONUS FINALE)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'ultimate_challenge',
    title: 'ULTIMATE CHALLENGE',
    briefing: 'The final mission.\nAll skills combined.\nProve you are a true M1SSION Agent.',
    description: 'La missione finale.\nTutte le abilità combinate.\nDimostra di essere un vero Agente M1SSION.',
    difficulty: 'complex',
    totalRewardM1U: 100, // Split: 50 + 50
    phase1: {
      instruction: 'Risolvi questa combinazione:\n1. Decifra ROT13: "ZVFFVBA" = ?\n2. La risposta è il nome dell\'app.',
      actionType: 'input',
      inputPlaceholder: 'Inserisci la risposta decifrata...',
      inputValidation: {
        type: 'regex',
        pattern: 'mission',
        caseSensitive: false,
        errorMessage: 'Risposta errata. ROT13: ogni lettera viene spostata di 13 posizioni...',
      },
    },
    phase2: {
      instruction: 'Hai completato tutte le sfide! Scrivi "M1SSION AGENT" per confermare il tuo status.',
      actionType: 'input',
      inputPlaceholder: 'Inserisci la conferma...',
      inputValidation: {
        type: 'regex',
        pattern: 'm1ssion.*agent',
        caseSensitive: false,
        errorMessage: 'Conferma errata. Scrivi esattamente "M1SSION AGENT"',
      },
      hint: 'Congratulazioni per essere arrivato fin qui!',
    },
    icon: '🏅',
    repeatable: true,
  },
  // ─── SERVER-REAL: Cipher Drill (Anagram) — Idea 1
  {
    id: 'cipher_drill_anagram_v1',
    title: 'CIPHER DRILL',
    briefing: 'Memorize the anagram shown for 60 seconds. Return tomorrow and type the original word.',
    description: 'Memorizza l\'anagramma per 60 secondi. Torna domani e inserisci la parola originale.',
    difficulty: 'logic',
    totalRewardM1U: 20,
    phase1: {
      instruction: 'Memorize the word. You have 60 seconds.',
      actionType: 'confirm',
    },
    phase2: {
      instruction: 'Enter the original word you memorized yesterday.',
      actionType: 'input',
      inputPlaceholder: 'Original word…',
      inputValidation: { type: 'any' },
    },
    icon: '🔤',
    repeatable: true,
  },

  // Daily #2 — Word Duel Memory (5 rounds + 60s memorize + tomorrow input)
  {
    id: 'word_duel_memory_v1',
    title: 'WORD DUEL',
    briefing: '5 rounds: pick the correct word. Memorize the saved words for 60s. Tomorrow enter the sequence.',
    description: '5 round: scegli la parola corretta. Memorizza le parole salvate per 60s. Domani inserisci la sequenza.',
    difficulty: 'logic',
    totalRewardM1U: 20,
    phase1: { instruction: 'Choose the correct word each round.', actionType: 'confirm' },
    phase2: { instruction: 'Enter the words you saved, in order.', actionType: 'input', inputPlaceholder: 'Words…', inputValidation: { type: 'any' } },
    icon: '📝',
    repeatable: true,
  },

  // Daily #3 — Signal Pattern Numbers (sequence + next number tomorrow)
  {
    id: 'signal_pattern_numbers_v1',
    title: 'Signal Pattern',
    briefing: 'Memorize the number sequence. Tomorrow enter the next number.',
    description: 'Memorizza la sequenza numerica. Domani inserisci il numero successivo.',
    difficulty: 'logic',
    totalRewardM1U: 10,
    phase1: { instruction: 'Memorize: tomorrow enter the next number.', actionType: 'confirm' },
    phase2: { instruction: 'Enter the next number.', actionType: 'input', inputPlaceholder: 'Number…', inputValidation: { type: 'any' } },
    icon: '🔢',
    repeatable: true,
  },
];

// ═══════════════════════════════════════════════════════════════
// 🔧 UTILITIES — Mission Cycle (no dayOfYear; sync fallback for engine)
// ═══════════════════════════════════════════════════════════════

/** Cycle of 15 mission IDs — must match server daily-mission-today. Used for sync fallback only. */
const MISSION_CYCLE_FALLBACK: string[] = [
  'cipher_drill_anagram_v1',
  'word_duel_memory_v1',
  'signal_pattern_numbers_v1',
  'open_source_intel',
  'urban_riddle',
  'pulse_breaker_challenge',
  'signal_trace',
  'code_fragment',
  'area_observation_lite',
  'pattern_break',
  'chain_of_intel',
  'time_distortion',
  'false_signal',
  'shadow_zone',
  'cipher_decode',
  'memory_matrix',
  'word_puzzle',
];

function getEpochDay(dayKey: string): number {
  const t = new Date(dayKey + 'T00:00:00Z').getTime();
  return Math.floor(t / 86400000);
}

function getMissionIdFromDayKey(dayKey: string): string {
  const epochDay = getEpochDay(dayKey);
  const idx = epochDay % MISSION_CYCLE_FALLBACK.length;
  const index = idx >= 0 ? idx : idx + MISSION_CYCLE_FALLBACK.length;
  return MISSION_CYCLE_FALLBACK[index];
}

/**
 * Get mission of the day (sync fallback: deterministic from day_key UTC, cycle of 15).
 * UI should use useMissionOfTheDay() for server-driven value. This is for missionEngine and legacy callers.
 * Set VITE_FORCE_DAILY_MISSION=cipher_drill_anagram_v1 in .env.local for testing.
 */
export function getMissionOfTheDay(): MissionDefinition {
  const forcedId = import.meta.env.VITE_FORCE_DAILY_MISSION;
  if (forcedId && typeof forcedId === 'string') {
    const found = MISSIONS_REGISTRY.find((m) => m.id === forcedId);
    if (found) return found;
  }
  // UTC day_key (same as missionState.getTodayKey()) + same cycle as server (epochDay % 15)
  const dayKey = new Date().toISOString().split('T')[0];
  const missionId = getMissionIdFromDayKey(dayKey);
  const def = MISSIONS_REGISTRY.find((m) => m.id === missionId);
  return def ?? MISSIONS_REGISTRY[0];
}

/**
 * Calculate phase rewards (50/50 split)
 */
export function calculatePhaseRewards(totalReward: number): { phase1: number; phase2: number } {
  const phase1 = Math.floor(totalReward * 0.5);
  const phase2 = totalReward - phase1;
  return { phase1, phase2 };
}

/**
 * Validate user input against mission validation rules
 */
export function validateInput(input: string, validation?: InputValidation): { valid: boolean; error?: string } {
  if (!validation) return { valid: true };
  
  const trimmedInput = input.trim();
  
  if (validation.type === 'any') {
    if (!trimmedInput) {
      return { valid: false, error: validation.errorMessage || 'Campo obbligatorio.' };
    }
    return { valid: true };
  }
  
  if (validation.type === 'exact') {
    const pattern = validation.pattern || '';
    const isMatch = validation.caseSensitive === true
      ? trimmedInput === pattern
      : trimmedInput.toLowerCase() === pattern.toLowerCase();
    
    if (!isMatch) {
      return { valid: false, error: validation.errorMessage || 'Risposta non corretta.' };
    }
    return { valid: true };
  }
  
  if (validation.type === 'regex') {
    try {
      const flags = validation.caseSensitive === true ? '' : 'i';
      const regex = new RegExp(validation.pattern || '', flags);
      const isMatch = regex.test(trimmedInput);
      
      if (!isMatch) {
        return { valid: false, error: validation.errorMessage || 'Risposta non corretta.' };
      }
      return { valid: true };
    } catch {
      // Invalid regex, treat as failed
      return { valid: false, error: 'Errore di validazione.' };
    }
  }
  
  return { valid: true };
}

