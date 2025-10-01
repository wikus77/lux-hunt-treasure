// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Norah Intent Router - IT keyword matching

export type NorahIntent = 
  | 'about_mission'
  | 'about_buzz'
  | 'about_finalshot'
  | 'buzz_map'
  | 'rules'
  | 'decode'
  | 'classify'
  | 'probability'
  | 'pattern'
  | 'mentor'
  | 'profile'
  | 'progress'
  | 'help'
  | 'smalltalk'
  | 'no_spoiler'
  | 'unknown';

export interface IntentResult {
  intent: NorahIntent;
  confidence: number;
  slots?: Record<string, any>;
}

// Spoiler guard patterns (priorità massima)
const SPOILER_PATTERNS = [
  /dov[eè]\s+(è|si\s+trova|sta)/i,
  /coord[iy]nat[ae]/i,
  /indirizzo\s+(esatt[oa]|precis[oa])/i,
  /dimmi\s+(dov[eè]|il\s+luogo)/i,
  /qual['\s]?è\s+(il\s+posto|la\s+posizione)/i,
  /rivel[ao]/i,
  /\bpremi[oa]\b.*\bdov[eè]\b/i
];

// Intent patterns
const INTENT_PATTERNS: Record<NorahIntent, RegExp[]> = {
  about_mission: [
    /cos['\s]?è\s+m1ssion/i,
    /parlami\s+di\s+m1ssion/i,
    /come\s+funziona\s+m1ssion/i,
    /spiega.*m1ssion/i
  ],
  about_buzz: [
    /cos['\s]?è\s+(il\s+)?buzz/i,
    /come\s+funziona.*buzz/i,
    /buzz.*serve/i,
    /come\s+ottengo\s+indizi/i
  ],
  about_finalshot: [
    /final\s+shot/i,
    /colpo\s+finale/i,
    /come\s+(vinco|si\s+vince)/i,
    /tentativo\s+finale/i
  ],
  buzz_map: [
    /buzz\s+map/i,
    /mappa\s+buzz/i,
    /dove.*buzz\s+map/i,
    /tasto.*buzz\s+map/i
  ],
  rules: [
    /regole/i,
    /come\s+si\s+gioca/i,
    /istruzioni/i,
    /tutorial/i
  ],
  decode: [
    /decodific[ao]/i,
    /decifr[ao]/i,
    /traduc[oi].*indizio/i,
    /cosa\s+significa/i
  ],
  classify: [
    /classifica.*indizi/i,
    /categori[ae].*indizi/i,
    /organizza.*indizi/i
  ],
  probability: [
    /probabilit[àa]/i,
    /chance/i,
    /possibilit[àa]/i,
    /quanto.*probabile/i
  ],
  pattern: [
    /pattern/i,
    /trova.*pattern/i,
    /correlazion[ie]/i,
    /collegament[oi]/i
  ],
  mentor: [
    /consig[lh]i[oa]/i,
    /strategi[ae]/i,
    /suggeriment[oi]/i,
    /come\s+procedo/i
  ],
  profile: [
    /chi\s+sono/i,
    /mio\s+codice/i,
    /agent.*code/i,
    /profilo/i
  ],
  progress: [
    /progress[io]/i,
    /stato/i,
    /quanti\s+indizi/i,
    /dove\s+sono/i
  ],
  help: [
    /aiuto/i,
    /cosa\s+puoi/i,
    /come\s+mi\s+aiuti/i,
    /comandi/i,
    /cosa.*chieder[eti]/i,
    /per\s+aiutarmi/i
  ],
  smalltalk: [
    /^ciao$/i,
    /buongiorno/i,
    /buonasera/i,
    /come\s+va/i,
    /grazie/i,
    /hey/i
  ],
  no_spoiler: [],
  unknown: []
};

export function routeIntent(input: string): IntentResult {
  const normalized = input.toLowerCase().trim();

  // Guard-rail: spoiler check first
  for (const pattern of SPOILER_PATTERNS) {
    if (pattern.test(normalized)) {
      return { intent: 'no_spoiler', confidence: 1.0 };
    }
  }

  // Match intent patterns
  for (const [intentKey, patterns] of Object.entries(INTENT_PATTERNS)) {
    const intent = intentKey as NorahIntent;
    if (intent === 'no_spoiler' || intent === 'unknown') continue;

    for (const pattern of patterns) {
      if (pattern.test(normalized)) {
        return { intent, confidence: 0.9 };
      }
    }
  }

  // Default: unknown or help fallback
  if (normalized.includes('?')) {
    return { intent: 'help', confidence: 0.4 };
  }

  return { intent: 'unknown', confidence: 0.1 };
}
