// @ts-nocheck
// © 2025 Joseph MULÉ – M1SSION™
// Intelligence Engine - Main orchestrator

import { buildContext, type IntelContext } from './context';
import { enforce, clampOutput } from './guardrails';
import { detectIntent, nextState, getStatePrefix, isIntentValid, type Intent, type State } from './router';
import { analyze } from './heuristics';
import { seedFrom, addVariety, pickHedge, pickMarker, pickCloser, pickTemplate } from './variety';
import { getTemplates } from './templates';
import { PERSONA, injectAgentRef } from './persona';

// Session state (in-memory, could be moved to sessionStorage)
let SESSION_STATE: State = 'idle';
let MESSAGE_COUNT = 0;

/**
 * Main analyst reply function
 */
export async function analystReply(
  userInput: string, 
  explicitMode?: Intent
): Promise<string> {
  try {
    // 1. Build context
    const ctx = await buildContext();

    // 2. Enforce guardrails
    const guardResult = enforce(userInput, ctx);
    if (guardResult.blocked) {
      return guardResult.text!;
    }

    // 3. Special: First message greeting
    if (MESSAGE_COUNT === 0) {
      MESSAGE_COUNT++;
      return PERSONA.greeting(ctx);
    }

    // 4. Detect intent (or use explicit mode)
    const intent = explicitMode || detectIntent(userInput, ctx);

    // 5. Update FSM state
    SESSION_STATE = nextState(SESSION_STATE, userInput, ctx);

    // 6. Check if intent is valid for state
    if (!isIntentValid(intent, SESSION_STATE)) {
      return `📭 Servono prima ${3 - ctx.userClues.length} indizi in più per questa analisi. Usa BUZZ per sbloccarli.`;
    }

    // 7. Run heuristics
    const analysis = await analyze(intent, ctx);

    // 8. Generate seed
    const seed = seedFrom(ctx, intent, SESSION_STATE);

    // 9. Pick template function
    const templates = getTemplates(intent, SESSION_STATE);
    const templateFn = pickTemplate(templates, seed);

    // 10. Generate base response
    const baseResponse = templateFn({
      ctx,
      analysis,
      hedges: pickHedge(seed),
      marker: pickMarker(seed + 1),
      closer: pickCloser(seed + 2)
    });

    // 11. Add variety
    let response = addVariety(baseResponse, seed);

    // 12. Inject agent reference (every 5 messages)
    MESSAGE_COUNT++;
    if (MESSAGE_COUNT % 5 === 0) {
      response = injectAgentRef(response, ctx, 5);
    }

    // 13. Add state prefix if in collect/analyze
    if (SESSION_STATE !== 'idle') {
      const prefix = getStatePrefix(SESSION_STATE, ctx);
      response = prefix + response;
    }

    // 14. Clamp length
    response = clampOutput(response, 800);

    // 15. Post-process confidence
    if (analysis.confidence < 0.3 && !response.includes('probabilmente')) {
      response = response.replace(/^/, 'Attenzione: confidenza bassa. ');
    }

    return response;

  } catch (error) {
    console.error('Analyst engine error:', error);
    return '⚠️ Errore temporaneo. Riprova tra qualche secondo.';
  }
}

/**
 * Reset session (e.g., when user logs out)
 */
export function resetSession(): void {
  SESSION_STATE = 'idle';
  MESSAGE_COUNT = 0;
}

/**
 * Get current session state (for debugging)
 */
export function getSessionState(): { state: State; messageCount: number } {
  return {
    state: SESSION_STATE,
    messageCount: MESSAGE_COUNT
  };
}
