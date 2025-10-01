// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Norah Reply Generator - Natural varied responses with enhanced context

import type { NorahIntent } from './intentRouter';
import type { NorahContext } from './contextBuilder';
import norahKB from '../kb/norahKB.it.json';

// Seed-based pseudo-random selection for variety
function selectVariation(options: string[], seed: string): string {
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % options.length;
  return options[index];
}

// Interpolate placeholders with full context
function interpolate(text: string, ctx: NorahContext): string {
  return text
    .replace(/\{agentCode\}/g, ctx.agent.code)
    .replace(/\{nickname\}/g, ctx.agent.nickname || ctx.agent.code)
    .replace(/\{clues\}/g, String(ctx.stats.clues))
    .replace(/\{buzzToday\}/g, String(ctx.stats.buzz_today))
    .replace(/\{finalshotToday\}/g, String(ctx.stats.finalshot_today));
}

// Enhanced reply with contextual awareness
export function generateReply(
  intent: NorahIntent,
  ctx: NorahContext,
  userInput: string
): string {
  const seed = `${ctx.agent.code}_${Date.now()}_${userInput.length}`;
  
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

  // FAQ-based responses with context enrichment
  const faqEntry = norahKB.faq[intent as keyof typeof norahKB.faq];
  if (faqEntry && faqEntry.a) {
    const raw = selectVariation(faqEntry.a, seed);
    let reply = interpolate(raw, ctx);
    
    // Add contextual suffix for specific intents
    if (intent === 'progress' && ctx.stats.clues > 0) {
      reply += `\n\nRicorda: con ${ctx.stats.clues} indizi sei ${ctx.stats.clues >= 8 ? 'pronto per analisi avanzate' : 'ancora in fase di raccolta dati'}.`;
    }
    
    if (intent === 'mentor' && ctx.stats.clues < 5) {
      reply += `\n\nPriorità: accumula almeno ${5 - ctx.stats.clues} indizi in più prima di considerare il Final Shot.`;
    }
    
    return reply;
  }

  // Fallback for unhandled intents
  return `Agente ${ctx.agent.code}, non ho una risposta specifica. Chiedi di BUZZ, Final Shot, indizi, pattern o regole.`;
}

// Mentor-specific: contextual advice with richer logic
export function generateMentorAdvice(ctx: NorahContext): string {
  const { clues, buzz_today, finalshot_today } = ctx.stats;
  const agentName = ctx.agent.nickname || ctx.agent.code;

  const adviceVariants = [
    {
      condition: clues === 0,
      messages: [
        `${agentName}, inizia con almeno 3-4 BUZZ per avere dati da analizzare. Poi torna qui.`,
        `Agente ${ctx.agent.code}, nessun indizio ancora. Fai BUZZ per iniziare la raccolta intelligence.`,
        `${agentName}, senza indizi non c'è analisi. Primo passo: BUZZ per ottenere dati.`,
        `Zero indizi, ${agentName}. Inizia con BUZZ: ogni indizio è un pezzo del puzzle.`
      ]
    },
    {
      condition: clues < 5,
      messages: [
        `Hai ${clues} indizi. Continua a fare BUZZ, punta ad almeno 8-10 prima del Final Shot.`,
        `${clues} indizi sono un inizio, ${agentName}. Target: 8-10 prima di tentare il Final Shot.`,
        `Con ${clues} indizi sei ancora in fase raccolta. Accumula altri ${8 - clues} per analisi solide.`,
        `${agentName}, ${clues} indizi non bastano. Fai ancora BUZZ, punta a 8-10 totali.`
      ]
    },
    {
      condition: clues >= 5 && clues < 10,
      messages: [
        `${clues} indizi sono un buon punto di partenza. Cerca pattern, usa BUZZ Map, poi considera il Final Shot.`,
        `Buono, ${agentName}: ${clues} indizi. Ora analizza pattern e verifica con BUZZ Map prima del Final Shot.`,
        `Con ${clues} indizi sei nella fase giusta. Incrocia i dati, trova correlazioni, poi decidi.`,
        `${clues} indizi, ${agentName}. Sufficiente per analisi base. Cerca pattern prima di sparare.`
      ]
    },
    {
      condition: clues >= 10,
      messages: [
        `Con ${clues} indizi sei in una posizione solida. Analizza le correlazioni, verifica coerenza geografica, poi spara il Final Shot.`,
        `Ottimo, ${agentName}: ${clues} indizi. Sei pronto per analisi avanzate. Trova convergenze, poi Final Shot.`,
        `${clues} indizi, ${agentName}. Sei in posizione forte. Incrocia tutto, verifica BUZZ Map, poi colpisci.`,
        `Con ${clues} indizi hai dati solidi. Analisi profonda: pattern geografici, semantici, temporali. Poi Final Shot.`
      ]
    }
  ];

  const seed = `${ctx.agent.code}_${Date.now()}`;
  const matchingAdvice = adviceVariants.find(v => v.condition);
  
  if (matchingAdvice) {
    return selectVariation(matchingAdvice.messages, seed);
  }

  return `${agentName}, continua la missione. Ogni indizio ti avvicina alla soluzione.`;
}

// Pattern detection: enhanced with real analysis hints
export function detectPatterns(ctx: NorahContext): string {
  const { clues } = ctx;
  const agentName = ctx.agent.nickname || ctx.agent.code;

  if (clues.length < 3) {
    return `Troppo pochi indizi (${clues.length}) per rilevare pattern. Fai più BUZZ, ${agentName}.`;
  }

  const patternMessages = [
    `Pattern rilevati: cluster geografico probabile (${clues.length} indizi). Verifica sovrapposizioni toponimi e coordinate. Usa BUZZ Map.`,
    `${clues.length} indizi analizzati, ${agentName}. Pattern emergenti: cerca ripetizioni di nomi, vicinanza coordinate, temi ricorrenti.`,
    `Analisi pattern: ${clues.length} indizi. Incrocia toponimi, verifica coordinate, cerca riferimenti storici comuni.`,
    `Con ${clues.length} indizi vedo convergenze. Cerca: cluster geografici, ripetizioni semantiche, vincoli temporali compatibili.`,
    `Pattern detection: ${clues.length} indizi. Focus su: sovrapposizioni spaziali, riferimenti multipli allo stesso luogo, sequenze logiche.`
  ];

  const seed = `${ctx.agent.code}_${Date.now()}`;
  return selectVariation(patternMessages, seed);
}

// Probability estimate: enhanced with thresholds
export function estimateProbability(ctx: NorahContext, zone?: string): string {
  const { clues } = ctx.stats;
  const agentName = ctx.agent.nickname || ctx.agent.code;

  if (clues < 5) {
    return `Con ${clues} indizi, la stima è inaffidabile. Raccogli più dati prima di valutare probabilità, ${agentName}.`;
  }

  const probMessages = [
    `Zona ${zone || 'ipotizzata'}: con ${clues} indizi, probabilità stimata ~60-70%. Più indizi = più precisione.`,
    `${clues} indizi, ${agentName}. Stima probabilità zona ${zone || 'target'}: 60-70% se convergono. Verifica con BUZZ Map.`,
    `Probabilità per ${zone || 'area ipotizzata'}: con ${clues} indizi siamo a ~65%. Aumenta indizi per maggiore certezza.`,
    `${agentName}, ${clues} indizi danno stima 60-70% per zona ${zone || 'target'}. Correlazioni forti aumentano probabilità.`,
    `Valutazione: ${clues} indizi, probabilità ~65% per ${zone || 'zona ipotizzata'}. Più dati convergono, più sale.`
  ];

  const seed = `${ctx.agent.code}_${Date.now()}`;
  return selectVariation(probMessages, seed);
}
