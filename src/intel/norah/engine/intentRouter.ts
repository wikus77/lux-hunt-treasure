// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Norah Intent Router v5 - Pipeline: normalize → spell → synonyms → fuzzy → multi-intent

import { normalize, expandSynonyms, fuzzyScore } from './textNormalize';
import { correctPhrase } from './spell';
import { isMultiIntent, detectMultiIntents, type ParsedIntent } from './multiIntent';

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
  | 'plans'
  | 'leaderboard'
  | 'community'
  | 'data_privacy'
  | 'no_spoiler'
  | 'clarify_needed'
  | 'saluto'
  | 'no_buzz'
  | 'diff_buzz_vs_map'
  | 'help_start'
  | 'rules_short'
  | 'unknown';

export interface IntentEntities {
  topic?: string;       // BUZZ | BUZZ Map | Final Shot | premi | ...
  place?: string;       // città/luogo menzionato
  tier?: string;        // silver/gold/black/titanium
  amount?: number;      // numeri menzionati
}

export interface IntentResult {
  intent: NorahIntent;
  confidence: number;
  slots?: Record<string, any>;
  multiIntents?: ParsedIntent[]; // v5: multi-intent support
  entities?: IntentEntities;      // v6: structured entities
  needs_rag?: boolean;            // v6: RAG flag
  needs_tool?: string[];          // v6: Tool calling flag
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

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Single-word/short-query direct mapping - Extended
const SINGLE_WORD_MAP: Record<string, NorahIntent> = {
  'mission': 'about_mission',
  'm1ssion': 'about_mission',
  'm1': 'about_mission',
  'buzz': 'about_buzz',
  'indizi': 'about_buzz',
  'finalshot': 'about_finalshot',
  'fs': 'about_finalshot',
  'finale': 'about_finalshot',
  'mappa': 'buzz_map',
  'map': 'buzz_map',
  'buzzmap': 'buzz_map',
  'abbonamenti': 'plans',
  'abbo': 'plans',
  'piani': 'plans',
  'piano': 'plans',
  'prezzi': 'plans',
  'pricing': 'plans',
  'plans': 'plans',
  'plan': 'plans',
  'probabilità': 'probability',
  'prob': 'probability',
  'pattern': 'pattern',
  'decodifica': 'decode',
  'decode': 'decode',
  'decod': 'decode',
  'aiuto': 'help',
  'help': 'help',
  'aiutami': 'help',
  'inizio': 'help',
  'iniziare': 'help',
  'inizia': 'help',
  'abbonamento': 'plans',
  'regole': 'rules',
  'rules': 'rules',
  'classifica': 'leaderboard',
  'leaderboard': 'leaderboard',
  'progress': 'progress',
  'stato': 'progress',
  'mentor': 'mentor',
  'mentore': 'mentor',
  'consiglio': 'mentor',
  'profilo': 'profile',
  'profile': 'profile',
  'privacy': 'data_privacy',
  'dati': 'data_privacy',
  'community': 'community',
  'comunità': 'community'
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™ – v6.8
// Intent trigger keywords for fuzzy matching
const INTENT_TRIGGERS: Record<NorahIntent, string[]> = {
  about_mission: ['mission', 'm1ssion', 'missione', 'gioco', 'funziona', 'cosa è'],
  about_buzz: ['buzz', 'indizi', 'clue', 'segnale', 'invia'],
  about_finalshot: ['finalshot', 'final shot', 'fs', 'colpo finale', 'tentativo finale', 'vincere'],
  buzz_map: ['buzz map', 'buz map', 'mappa buzz', 'mappa', 'tasto mappa'],
  rules: ['regole', 'istruzioni', 'tutorial', 'come gioca'],
  decode: ['decodifica', 'decode', 'decifra', 'traduc', 'significa'],
  classify: ['classifica indizi', 'categoria', 'organizza'],
  probability: ['probabilità', 'prob', 'chance', 'possibilità'],
  pattern: ['pattern', 'schema', 'correlazione', 'collegamento'],
  mentor: ['consiglio', 'strategia', 'suggerimento', 'come procedo', 'mentore'],
  profile: ['chi sono', 'codice', 'agent code', 'profilo'],
  progress: ['progress', 'stato', 'quanti indizi', 'avanzamento'],
  plans: ['abbonamento', 'abbo', 'piano', 'pricing', 'subscription', 'prezzi', 'paga', 'gratis', 'prezzo', 'costa', 'quanto costa', 'gratuito'],
  leaderboard: ['classifica', 'ranking', 'leader'],
  community: ['community', 'comunità'],
  data_privacy: ['privacy', 'dati', 'sicurezza', 'privata'],
  help: ['aiuto', 'help', 'cosa puoi', 'aiutami', 'comandi'],
  smalltalk: ['ciao', 'buongiorno', 'buonasera', 'grazie', 'hey'],
  no_spoiler: [],
  clarify_needed: [],
  saluto: ['ciao', 'salve', 'buongiorno', 'buonasera', 'hey', 'ehi', 'hola', 'hello'],
  no_buzz: ['non voglio buzz', 'senza buzz', 'alternative buzz', 'no buzz', 'non uso buzz', 'se non voglio'],
  diff_buzz_vs_map: ['differenza buzz map', 'buzz vs map', 'buzz o map', 'differenze'],
  help_start: ['come inizio', 'da dove inizio', 'come si inizia', 'iniziare', 'primo passo'],
  rules_short: ['regole veloci', 'regole rapide', 'summary regole', 'regole brevi'],
  unknown: []
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// v6.2: Threshold raised to reduce false positives
const FUZZY_MIN_CONF = 0.52;
const FUZZY_THRESHOLD = 0.40; // Clarify zone
const HIGH_CONFIDENCE_THRESHOLD = 0.75;

export function routeIntent(input: string): IntentResult {
  if (!input || typeof input !== 'string') {
    return { intent: 'unknown', confidence: 0.1 };
  }

  const rawNormalized = input.toLowerCase().trim();

  // v5: Multi-intent detection (priority check before single routing)
  if (isMultiIntent(input)) {
    const multiIntents = detectMultiIntents(input);
    if (multiIntents.length >= 2) {
      console.log('[NORAH-v5] Multi-intent detected:', multiIntents);
      return {
        intent: 'help', // Use help as umbrella for multi-intent
        confidence: 0.85,
        multiIntents
      };
    }
  }

  // Guard-rail: spoiler check first
  for (const pattern of SPOILER_PATTERNS) {
    if (pattern.test(rawNormalized)) {
      console.log('[NORAH-v4] Spoiler guard triggered');
      return { intent: 'no_spoiler', confidence: 1.0 };
    }
  }

  // v4 Pipeline: normalize → spell → synonyms → fuzzy
  const spellCorrected = correctPhrase(rawNormalized);
  const tokens = normalize(spellCorrected);
  const expandedTokens = expandSynonyms(tokens);
  
  console.log('[NORAH-v4] Intent routing:', { input, spellCorrected, tokens, expandedTokens });

  // Single-word check
  if (tokens.length === 1) {
    const singleWord = tokens[0];
    if (SINGLE_WORD_MAP[singleWord]) {
      console.debug('[NORAH] Single-word match:', singleWord, '→', SINGLE_WORD_MAP[singleWord]);
      return { intent: SINGLE_WORD_MAP[singleWord], confidence: 0.95 };
    }
  }

  // Fuzzy scoring across all intents
  const scores: Array<{ intent: NorahIntent; score: number }> = [];

  for (const [intentKey, triggers] of Object.entries(INTENT_TRIGGERS)) {
    const intent = intentKey as NorahIntent;
    if (intent === 'no_spoiler' || intent === 'unknown') continue;

    let maxScore = 0;

    for (const trigger of triggers) {
      const triggerTokens = normalize(trigger);
      
      // Token overlap score
      const overlap = expandedTokens.filter(t => triggerTokens.includes(t)).length;
      const overlapScore = overlap / Math.max(triggerTokens.length, 1);

      // Fuzzy string match
      const fuzzy = fuzzyScore(rawNormalized, trigger);

      // Combined
      const score = Math.max(overlapScore * 0.6 + fuzzy * 0.4, fuzzy);
      
      if (score > maxScore) {
        maxScore = score;
      }
    }

    if (maxScore > 0) {
      scores.push({ intent, score: maxScore });
    }
  }

  // Sort by score
  scores.sort((a, b) => b.score - a.score);

  console.debug('[NORAH] Intent scores:', scores.slice(0, 3));

  // v6.2: High confidence (>= 0.52)
  if (scores.length > 0 && scores[0].score >= FUZZY_MIN_CONF) {
    const topIntent = scores[0].intent;
    const confidence = scores[0].score >= HIGH_CONFIDENCE_THRESHOLD ? 0.9 : 0.7;
    console.debug('[NORAH] Intent routed:', topIntent, 'confidence:', confidence);
    return { intent: topIntent, confidence };
  }

  // v6.2: Clarify zone (0.45 - 0.52): suggest disambiguation
  if (scores.length > 0 && scores[0].score >= 0.45) {
    const topTwo = scores.slice(0, 2).map(s => s.intent);
    console.log('[NORAH-v6.2] Clarify zone, suggesting:', topTwo);
    return {
      intent: 'help',
      confidence: 0.5,
      slots: { clarify: true, suggestedIntents: topTwo }
    };
  }

  // v5: Enhanced fallback - more synonyms for help intent
  const keywordMap: Record<string, NorahIntent> = {
    'mission': 'about_mission',
    'm1ssion': 'about_mission',
    'finalshot': 'about_finalshot',
    'buzz': 'about_buzz',
    'plan': 'plans',
    'piani': 'plans',
    'help': 'help',
    'aiuto': 'help',
    'spiega': 'help',
    'come si fa': 'help',
    'come faccio': 'help',
    'come fare': 'help',
    'spiegami': 'help'
  };
  
  for (const [keyword, intent] of Object.entries(keywordMap)) {
    if (expandedTokens.includes(keyword)) {
      console.log('[NORAH-v4] Fallback keyword match:', keyword, '→', intent);
      return { intent, confidence: 0.55 };
    }
  }

  // Ambiguous or low confidence → help with suggestions
  if (scores.length > 0 && scores[0].score >= 0.30) {
    console.log('[NORAH-v4] Low confidence, defaulting to help');
    return { 
      intent: 'help', 
      confidence: 0.5,
      slots: { 
        suggestedIntents: scores.slice(0, 3).map(s => s.intent)
      }
    };
  }

  // Unknown
  console.log('[NORAH-v4] No intent match, defaulting to help');
  return { intent: 'help', confidence: 0.4 };
}
