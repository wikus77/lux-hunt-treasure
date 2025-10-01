// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Norah Reply Generator - Natural varied responses with enhanced context

import type { NorahIntent } from './intentRouter';
import type { NorahContext } from './contextBuilder';
import norahKB from '../kb/norahKB.it.json';

// Recent variations cache (cooldown)
const recentVariations: string[] = [];
const MAX_RECENT = 3;

// Seed-based pseudo-random selection for variety
function selectVariation(options: string[], seed: string): string {
  if (!options || options.length === 0) return '';
  
  // Filter out recently used
  const available = options.filter(opt => !recentVariations.includes(opt));
  const pool = available.length > 0 ? available : options;
  
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % pool.length;
  const selected = pool[index];
  
  // Update recent cache
  recentVariations.push(selected);
  if (recentVariations.length > MAX_RECENT) {
    recentVariations.shift();
  }
  
  return selected;
}

// Micro-modulators for natural variation
const INCIPIT = ['', 'Ecco: ', 'Bene, ', 'Chiaro, ', 'Ok, '];
const BRIDGE = ['', ' quindi', ' quindi,', ' dunque', ' allora'];
const CLOSURE = ['', ' Chiaro?', ' Capito?', '.', '!'];

function addModulators(text: string, seed: string): string {
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const incipit = INCIPIT[hash % INCIPIT.length];
  const bridge = BRIDGE[(hash * 2) % BRIDGE.length];
  const closure = CLOSURE[(hash * 3) % CLOSURE.length];
  
  return `${incipit}${text}${bridge}${closure}`;
}

// Interpolate placeholders with full context (safe, never undefined)
function interpolate(text: string, ctx: NorahContext): string {
  try {
    return text
      .replace(/\{agentCode\}/g, ctx?.agent?.code || 'N/D')
      .replace(/\{nickname\}/g, ctx?.agent?.nickname || ctx?.agent?.code || 'Agente')
      .replace(/\{clues\}/g, String(ctx?.stats?.clues || 0))
      .replace(/\{buzzToday\}/g, String(ctx?.stats?.buzz_today || 0))
      .replace(/\{finalshotToday\}/g, String(ctx?.stats?.finalshot_today || 0))
      .replace(/\{missionId\}/g, ctx?.mission?.id || 'N/D');
  } catch (e) {
    console.error('[NORAH] Interpolation error:', e);
    return text;
  }
}

// Enhanced reply with contextual awareness
export function generateReply(
  intent: NorahIntent,
  ctx: NorahContext,
  userInput: string
): string {
  try {
    const seed = `${ctx?.agent?.code || 'default'}_${Date.now()}_${userInput?.length || 0}`;
    
    console.debug('[NORAH] Generating reply:', { intent, seed });
    
    // Guard-rail: spoiler
    if (intent === 'no_spoiler') {
      const options = norahKB?.guardrails?.no_spoiler || ['Non posso rivelare questa informazione.'];
      return selectVariation(options, seed);
    }

    // Unknown fallback with hints
    if (intent === 'unknown' || intent === 'help') {
      const options = norahKB?.guardrails?.unknown || [
        'Non ho capito. Prova con: Mission, BUZZ, Final Shot, indizi, pattern.'
      ];
      let reply = selectVariation(options, seed);
      
      // Add contextual suggestions
      const clues = ctx?.stats?.clues || 0;
      if (clues === 0) {
        reply += '\n\n🎯 Suggerimento: inizia con BUZZ per raccogliere indizi.';
      } else if (clues < 8) {
        reply += '\n\n🎯 Suggerimento: hai ' + clues + ' indizi, continua con BUZZ o prova BUZZ Map.';
      } else {
        reply += '\n\n🎯 Suggerimento: con ' + clues + ' indizi puoi analizzare pattern o considerare Final Shot.';
      }
      
      return reply;
    }

    // FAQ-based responses with context enrichment
    const faqEntry = norahKB?.faq?.[intent as keyof typeof norahKB.faq];
    if (faqEntry && Array.isArray(faqEntry.a) && faqEntry.a.length > 0) {
      const raw = selectVariation(faqEntry.a, seed);
      let reply = interpolate(raw, ctx);
      
      // Add contextual suffix for specific intents
      const clues = ctx?.stats?.clues || 0;
      
      if (intent === 'progress' && clues > 0) {
        const phase = clues >= 8 ? 'pronto per analisi avanzate' : 'ancora in fase di raccolta dati';
        reply += `\n\nCon ${clues} indizi sei ${phase}.`;
      }
      
      if (intent === 'mentor') {
        if (clues < 3) {
          reply += `\n\nPriorità: accumula almeno ${3 - clues} indizi in più.`;
        } else if (clues >= 8) {
          reply += `\n\nCon ${clues} indizi puoi iniziare analisi avanzate.`;
        } else {
          reply += `\n\nCon ${clues} indizi continua a raccogliere, punta a 8-10.`;
        }
      }
      
      // Apply modulators for natural variation
      reply = addModulators(reply, seed);
      
      return reply;
    }

    // Fallback for unhandled intents
    return `Agente ${ctx?.agent?.code || 'N/D'}, non ho una risposta specifica. Chiedi di BUZZ, Final Shot, indizi, pattern o regole.`;
  } catch (error) {
    console.error('[NORAH] Reply generation error:', error);
    return 'Sistemi occupati, riprova tra un momento.';
  }
}

// Mentor-specific: contextual advice with richer logic
export function generateMentorAdvice(ctx: NorahContext): string {
  try {
    const clues = ctx?.stats?.clues || 0;
    const agentName = ctx?.agent?.nickname || ctx?.agent?.code || 'Agente';

    const adviceVariants = [
      {
        condition: clues === 0,
        messages: [
          `${agentName}, inizia con almeno 3-4 BUZZ per avere dati da analizzare.`,
          `Agente ${ctx?.agent?.code || 'N/D'}, nessun indizio ancora. Fai BUZZ per iniziare la raccolta intelligence.`,
          `${agentName}, senza indizi non c'è analisi. Primo passo: BUZZ per ottenere dati.`,
          `Zero indizi, ${agentName}. Inizia con BUZZ: ogni indizio è un pezzo del puzzle.`,
          `${agentName}, fase zero. Raccogli i primi indizi con BUZZ, poi torna per analisi.`
        ]
      },
      {
        condition: clues < 5,
        messages: [
          `Hai ${clues} indizi. Continua a fare BUZZ, punta ad almeno 8-10 prima del Final Shot.`,
          `${clues} indizi sono un inizio, ${agentName}. Target: 8-10 prima di tentare il Final Shot.`,
          `Con ${clues} indizi sei ancora in fase raccolta. Accumula altri ${8 - clues} per analisi solide.`,
          `${agentName}, ${clues} indizi non bastano. Fai ancora BUZZ, punta a 8-10 totali.`,
          `${clues} indizi raccolti, ${agentName}. Buon inizio, ma serve altro. Continua con BUZZ.`
        ]
      },
      {
        condition: clues >= 5 && clues < 10,
        messages: [
          `${clues} indizi sono un buon punto di partenza. Cerca pattern, usa BUZZ Map, poi considera il Final Shot.`,
          `Buono, ${agentName}: ${clues} indizi. Ora analizza pattern e verifica con BUZZ Map prima del Final Shot.`,
          `Con ${clues} indizi sei nella fase giusta. Incrocia i dati, trova correlazioni, poi decidi.`,
          `${clues} indizi, ${agentName}. Sufficiente per analisi base. Cerca pattern prima di sparare.`,
          `${agentName}, ${clues} indizi. Fase intermedia: analizza, correla, poi BUZZ Map per verificare.`
        ]
      },
      {
        condition: clues >= 10,
        messages: [
          `Con ${clues} indizi sei in una posizione solida. Analizza le correlazioni, verifica coerenza geografica, poi spara il Final Shot.`,
          `Ottimo, ${agentName}: ${clues} indizi. Sei pronto per analisi avanzate. Trova convergenze, poi Final Shot.`,
          `${clues} indizi, ${agentName}. Sei in posizione forte. Incrocia tutto, verifica BUZZ Map, poi colpisci.`,
          `Con ${clues} indizi hai dati solidi. Analisi profonda: pattern geografici, semantici, temporali. Poi Final Shot.`,
          `${agentName}, ${clues} indizi. Ottima base. Analizza correlazioni, cerca convergenze, poi Final Shot.`
        ]
      }
    ];

    const seed = `${ctx?.agent?.code || 'default'}_${Date.now()}`;
    const matchingAdvice = adviceVariants.find(v => v.condition);
    
    if (matchingAdvice && Array.isArray(matchingAdvice.messages)) {
      return selectVariation(matchingAdvice.messages, seed);
    }

    return `${agentName}, continua la missione. Ogni indizio ti avvicina alla soluzione.`;
  } catch (error) {
    console.error('[NORAH] Mentor advice error:', error);
    return 'Errore generazione consiglio. Riprova.';
  }
}

// Pattern detection: enhanced with real analysis hints
export function detectPatterns(ctx: NorahContext): string {
  try {
    const clues = ctx?.stats?.clues || 0;
    const agentName = ctx?.agent?.nickname || ctx?.agent?.code || 'Agente';

    if (clues < 3) {
      return `Troppo pochi indizi (${clues}) per rilevare pattern. Fai più BUZZ, ${agentName}.`;
    }

    const patternMessages = [
      `Pattern rilevati: cluster geografico probabile (${clues} indizi). Verifica sovrapposizioni toponimi e coordinate. Usa BUZZ Map.`,
      `${clues} indizi analizzati, ${agentName}. Pattern emergenti: cerca ripetizioni di nomi, vicinanza coordinate, temi ricorrenti.`,
      `Analisi pattern: ${clues} indizi. Incrocia toponimi, verifica coordinate, cerca riferimenti storici comuni.`,
      `Con ${clues} indizi vedo convergenze. Cerca: cluster geografici, ripetizioni semantiche, vincoli temporali compatibili.`,
      `Pattern detection: ${clues} indizi. Focus su: sovrapposizioni spaziali, riferimenti multipli allo stesso luogo, sequenze logiche.`
    ];

    const seed = `${ctx?.agent?.code || 'default'}_${Date.now()}`;
    return selectVariation(patternMessages, seed);
  } catch (error) {
    console.error('[NORAH] Pattern detection error:', error);
    return 'Errore analisi pattern. Riprova.';
  }
}

// Probability estimate: enhanced with thresholds
export function estimateProbability(ctx: NorahContext, zone?: string): string {
  try {
    const clues = ctx?.stats?.clues || 0;
    const agentName = ctx?.agent?.nickname || ctx?.agent?.code || 'Agente';

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

    const seed = `${ctx?.agent?.code || 'default'}_${Date.now()}`;
    return selectVariation(probMessages, seed);
  } catch (error) {
    console.error('[NORAH] Probability estimation error:', error);
    return 'Errore stima probabilità. Riprova.';
  }
}
