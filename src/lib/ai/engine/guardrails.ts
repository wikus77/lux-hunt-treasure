// © 2025 Joseph MULÉ – M1SSION™
// Intelligence Guard Rails - Anti-spoiler protection

import type { IntelContext } from './context';

interface GuardResult {
  blocked: boolean;
  text?: string;
}

const SPOILER_KEYWORDS = [
  'dov\'è', 'dove si trova', 'dove è', 'location', 'posizione esatta',
  'coordinate', 'dimmi dove', 'indirizzo', 'qual è il luogo',
  'svelami', 'dammi la risposta', 'dammi la soluzione',
  'qual è l\'indirizzo', 'rivela', 'svela il posto',
  'dammi le coordinate', 'dammi il posto', 'quale città'
];

const GUARD_RESPONSES = [
  'Non posso rivelare luoghi o coordinate — è parte del gioco. Ma posso aiutarti a stringere il cerchio: analizza i pattern ricorrenti nei tuoi indizi.',
  'Il mio compito è guidarti, non svelarti la soluzione. Però posso evidenziare temi dominanti: vuoi che analizzi le connessioni?',
  'Niente spoiler: è la regola base. Ma se mi indichi quale area geografica ti sembra coerente, posso dirti se sei sulla pista giusta.',
  'Le coordinate sono il tuo obiettivo finale, non il mio da rivelare. Però posso classificare gli indizi per tipo: vuoi provare?'
];

/**
 * Enforce guardrails before generating response
 */
export function enforce(msg: string, ctx: IntelContext): GuardResult {
  const lowerMsg = msg.toLowerCase().trim();

  // 1. Check for spoiler requests
  const hasSpoilerIntent = SPOILER_KEYWORDS.some(kw => lowerMsg.includes(kw));
  
  if (hasSpoilerIntent) {
    const seed = ctx.agentCode.charCodeAt(0) + Math.floor(Date.now() / 60000);
    const response = GUARD_RESPONSES[seed % GUARD_RESPONSES.length];
    return {
      blocked: true,
      text: `🔒 **Agente ${ctx.agentCode}**, ${response}`
    };
  }

  // 2. Check for requests about non-collected clues
  if (lowerMsg.includes('altri indizi') || lowerMsg.includes('indizi nascosti')) {
    if (ctx.userClues.length === 0) {
      return {
        blocked: true,
        text: `📭 **Agente ${ctx.agentCode}**, non hai ancora indizi nel sistema. Usa BUZZ per sbloccare i primi frammenti, poi torno operativo.`
      };
    }
  }

  // 3. Length check (avoid abuse)
  if (msg.length > 500) {
    return {
      blocked: true,
      text: `⚠️ Messaggio troppo lungo. Sintetizza la richiesta in max 2-3 frasi, grazie.`
    };
  }

  // 4. Check for empty/nonsense
  if (lowerMsg.length < 3 || !/[a-z]/i.test(lowerMsg)) {
    return {
      blocked: true,
      text: `🤔 Non ho capito. Prova con una domanda più chiara (es: "classifica gli indizi" o "trova pattern").`
    };
  }

  return { blocked: false };
}

/**
 * Post-process output to clamp length
 */
export function clampOutput(text: string, maxLength: number = 800): string {
  if (text.length <= maxLength) return text;
  
  // Truncate at sentence boundary
  const truncated = text.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastQuestion = truncated.lastIndexOf('?');
  const lastExclaim = truncated.lastIndexOf('!');
  
  const cutPoint = Math.max(lastPeriod, lastQuestion, lastExclaim);
  
  if (cutPoint > maxLength * 0.7) {
    return truncated.substring(0, cutPoint + 1);
  }
  
  return truncated + '...';
}
