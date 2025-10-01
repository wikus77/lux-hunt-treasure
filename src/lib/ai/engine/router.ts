// © 2025 Joseph MULÉ – M1SSION™
// Intelligence Router - Intent detection & state machine

import type { IntelContext } from './context';

export type Intent = 'about' | 'classify' | 'patterns' | 'decode' | 'probability' | 'mentor';
export type State = 'idle' | 'collect' | 'analyze' | 'advise';

const INTENT_KEYWORDS: Record<Intent, string[]> = {
  about: ['parlami di m1ssion', 'cos\'è m1ssion', 'cosa è m1ssion', 'spiega m1ssion'],
  classify: ['classifica', 'categorizza', 'organizza', 'separa', 'raggruppa'],
  patterns: ['pattern', 'collegamento', 'correlazione', 'connessione', 'trova', 'ricorrente'],
  decode: ['decodifica', 'decifra', 'anagramma', 'base64', 'caesar', 'codice', 'cripta'],
  probability: ['probabilità', 'chance', 'vincere', 'quanto', 'percentuale', 'stima'],
  mentor: ['aiuto', 'consiglio', 'motivazione', 'cosa fare', 'prossimo passo', 'suggerimento']
};

/**
 * Detect user intent from input text
 */
export function detectIntent(input: string, ctx: IntelContext): Intent {
  const lowerInput = input.toLowerCase().trim();

  // Check each intent's keywords
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (keywords.some(kw => lowerInput.includes(kw))) {
      return intent as Intent;
    }
  }

  // Default: if user has clues, analyze; else mentor
  return ctx.userClues.length >= 3 ? 'patterns' : 'mentor';
}

/**
 * Mini FSM: determine next state based on context
 */
export function nextState(current: State, input: string, ctx: IntelContext): State {
  const clueCount = ctx.userClues.length;

  // State transitions
  if (clueCount === 0) {
    return 'collect'; // Need to collect clues first
  }

  if (clueCount < 3) {
    return 'collect'; // Still in collection phase
  }

  if (clueCount >= 3 && clueCount < 8) {
    return 'analyze'; // Enough data to analyze
  }

  return 'advise'; // Rich dataset, can give strategic advice
}

/**
 * Get state-appropriate message prefix
 */
export function getStatePrefix(state: State, ctx: IntelContext): string {
  switch (state) {
    case 'collect':
      return `📥 **Fase raccolta** (${ctx.totals.found}/3 min): `;
    case 'analyze':
      return `🔬 **Fase analisi** (${ctx.totals.found} indizi): `;
    case 'advise':
      return `🎯 **Fase strategica** (${ctx.totals.found} frammenti): `;
    default:
      return '';
  }
}

/**
 * Check if intent is valid for current state
 */
export function isIntentValid(intent: Intent, state: State): boolean {
  // 'about' and 'mentor' always valid
  if (intent === 'about' || intent === 'mentor') return true;

  // Other intents need clues
  if (state === 'collect') return false;

  return true;
}
