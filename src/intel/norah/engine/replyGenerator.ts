// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Norah Reply Generator - Natural varied responses

import type { NorahIntent } from './intentRouter';
import type { NorahContext } from './contextBuilder';
import norahKB from '../kb/norahKB.it.json';

// Seed-based pseudo-random selection for variety
function selectVariation(options: string[], seed: string): string {
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % options.length;
  return options[index];
}

// Interpolate placeholders
function interpolate(text: string, ctx: NorahContext): string {
  return text
    .replace(/\{agentCode\}/g, ctx.agent.code)
    .replace(/\{clues\}/g, String(ctx.stats.clues))
    .replace(/\{buzzToday\}/g, String(ctx.stats.buzz_today));
}

export function generateReply(
  intent: NorahIntent,
  ctx: NorahContext,
  userInput: string
): string {
  const seed = `${ctx.agent.code}_${Date.now()}`;
  
  // Guard-rail: spoiler
  if (intent === 'no_spoiler') {
    const options = norahKB.guardrails.no_spoiler;
    return selectVariation(options, seed);
  }

  // Unknown fallback
  if (intent === 'unknown') {
    const options = norahKB.guardrails.unknown;
    return selectVariation(options, seed);
  }

  // FAQ-based responses
  const faqEntry = norahKB.faq[intent as keyof typeof norahKB.faq];
  if (faqEntry && faqEntry.a) {
    const raw = selectVariation(faqEntry.a, seed);
    return interpolate(raw, ctx);
  }

  // Fallback for unhandled intents
  return `Agente ${ctx.agent.code}, non ho una risposta specifica. Chiedi di BUZZ, Final Shot, indizi, pattern o regole.`;
}

// Mentor-specific: contextual advice
export function generateMentorAdvice(ctx: NorahContext): string {
  const { clues, buzz_today } = ctx.stats;

  if (clues === 0) {
    return `Agente ${ctx.agent.code}, inizia con almeno 3-4 BUZZ per avere dati da analizzare. Poi torna qui.`;
  }

  if (clues < 5) {
    return `Hai ${clues} indizi. Continua a fare BUZZ, punta ad almeno 8-10 prima del Final Shot.`;
  }

  if (clues < 10) {
    return `${clues} indizi sono un buon punto di partenza. Cerca pattern, usa BUZZ Map, poi considera il Final Shot.`;
  }

  return `Con ${clues} indizi sei in una posizione solida. Analizza le correlazioni, verifica coerenza geografica, poi spara il Final Shot.`;
}

// Pattern detection: simple heuristic
export function detectPatterns(ctx: NorahContext): string {
  const { clues } = ctx;

  if (clues.length < 3) {
    return `Troppo pochi indizi (${clues.length}) per rilevare pattern. Fai più BUZZ.`;
  }

  // Dummy logic: in real scenario, analyze clue_id, meta, etc.
  return `Pattern rilevati: cluster geografico probabile (${clues.length} indizi). Verifica sovrapposizioni toponimi e coordinate. Usa BUZZ Map.`;
}

// Probability estimate (mock)
export function estimateProbability(ctx: NorahContext, zone?: string): string {
  const { clues } = ctx.stats;

  if (clues < 5) {
    return `Con ${clues} indizi, la stima è inaffidabile. Raccogli più dati.`;
  }

  return `Zona ${zone || 'ipotizzata'}: con ${clues} indizi, probabilità stimata ~60-70%. Più indizi = più precisione.`;
}
