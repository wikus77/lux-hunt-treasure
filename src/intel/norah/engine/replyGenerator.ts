// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Norah Reply Generator v4 - Persona + Coach + Empathy

import type { NorahIntent } from './intentRouter';
import type { NorahContext } from './contextBuilder';
import norahKB from '../kb/norahKB.it.json';

// Recent variations cache (cooldown)
const recentVariations: string[] = [];
const MAX_RECENT = 3;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// v4: Empathy/Tone Layer - Pre-incipit variabili
const EMPATHY_INTROS = [
  'Capito, {nickname}!',
  'Ottima mossa, agente {code}.',
  'Perfetto!',
  'Ci sono!',
  'Vediamo insieme.',
  'Ok, analizziamo.',
  'Bene!',
  'D\'accordo.'
];

function getEmpathyIntro(ctx: NorahContext): string {
  const intro = EMPATHY_INTROS[Math.floor(Math.random() * EMPATHY_INTROS.length)];
  return intro
    .replace('{nickname}', ctx?.agent?.nickname || 'agente')
    .replace('{code}', ctx?.agent?.code || 'N/D');
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// v4: Mentor/Coach Layer - CTA dinamiche basate su progressione
function getCoachCTA(ctx: NorahContext): string {
  const clues = ctx?.stats?.clues || 0;
  
  if (clues === 0) {
    return '\n\n💡 **Prossimo passo**: Apri BUZZ e raccogli 2-3 indizi oggi. Poi torniamo qui per analizzarli insieme.';
  }
  
  if (clues >= 1 && clues <= 3) {
    return '\n\n💡 **Suggerimento**: Hai i primi indizi. Continua con BUZZ per averne almeno 4-5, poi possiamo cercare pattern interessanti.';
  }
  
  if (clues >= 4 && clues <= 7) {
    return '\n\n💡 **Ottimo ritmo!** Ora posso cercare pattern e correlazioni nei tuoi indizi. Vuoi che analizzi tutto?';
  }
  
  if (clues >= 8) {
    return '\n\n💡 **Fase avanzata**: Hai abbastanza dati. Se i segnali convergono, valuta Final Shot (max 2/giorno). Vuoi che verifichi la coerenza prima?';
  }
  
  return '';
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// v4: Engagement Hooks - Proposta utile per domande generiche
function getEngagementHook(intent: NorahIntent): string {
  if (intent === 'help' || intent === 'unknown') {
    return '\n\n✅ **Ti preparo una checklist rapida?** Dimmi cosa ti serve: buzz, final shot, regole, piani.';
  }
  return '';
}

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

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// v4: Enhanced reply with empathy, coach CTA, engagement hooks
export function generateReply(
  intent: NorahIntent,
  ctx: NorahContext,
  userInput: string
): string {
  try {
    const seed = `${ctx?.agent?.code || 'default'}_${Date.now()}_${userInput?.length || 0}`;
    
    console.log('[NORAH-v4] Generating reply:', { intent, seed });
    
    // Guard-rail: spoiler
    if (intent === 'no_spoiler') {
      const options = norahKB?.guardrails?.no_spoiler || ['Non posso rivelare questa informazione.'];
      const reply = selectVariation(options, seed);
      return reply + '\n\n💡 **Posso aiutarti a verificare se i segnali convergono**, senza rivelare nulla di proibito.';
    }

    // © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
    // Unknown/Help fallback with smart contextual suggestions
    if (intent === 'unknown' || intent === 'help') {
      // Check if user mentioned known keywords but intent was missed
      const lowerInput = (userInput || '').toLowerCase();
      const knownKeywords = ['mission', 'm1ssion', 'buzz', 'finalshot', 'fs', 'mappa', 'piani', 'abbo', 'pattern', 'decode'];
      const foundKeyword = knownKeywords.find(kw => lowerInput.includes(kw));
      
      if (foundKeyword) {
        // Redirect to most likely intent based on keyword
        if (['mission', 'm1ssion'].some(k => lowerInput.includes(k))) {
          const missionOptions = norahKB?.faq?.mission?.a || ['M1SSION™ è un gioco di intelligence e ricerca del premio.'];
          return selectVariation(missionOptions, seed);
        }
        if (['finalshot', 'fs'].some(k => lowerInput.includes(k))) {
          const fsOptions = norahKB?.faq?.finalshot?.a || ['Final Shot: tentativo finale per vincere (max 2 al giorno).'];
          return selectVariation(fsOptions, seed);
        }
        if (['piani', 'abbo'].some(k => lowerInput.includes(k))) {
          const planOptions = norahKB?.faq?.subscriptions?.a || ['Vai su Abbonamenti per vedere i piani disponibili.'];
          return selectVariation(planOptions, seed);
        }
      }
      
      const options = norahKB?.guardrails?.unknown || [
        'Non ho capito. Prova: Mission, BUZZ, Final Shot, indizi, pattern, piani.'
      ];
      let reply = selectVariation(options, seed);
      
      // Add contextual suggestions based on agent state
      const clues = ctx?.stats?.clues || 0;
      const agentName = ctx?.agent?.nickname || ctx?.agent?.code || 'Agente';
      
      if (ctx?.agent?.code === 'AG-UNKNOWN') {
        reply += `\n\n⚠️ Profilo non sincronizzato. Prova a ricaricare la pagina.`;
      } else if (clues === 0) {
        reply += `\n\n🎯 ${agentName}, inizia con BUZZ per raccogliere indizi.`;
      } else if (clues < 8) {
        reply += `\n\n🎯 ${agentName}, hai ${clues} indizi. Continua con BUZZ o prova BUZZ Map.`;
      } else {
        reply += `\n\n🎯 ${agentName}, con ${clues} indizi puoi analizzare pattern o valutare Final Shot.`;
      }
      
      return reply;
    }

    // © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
    // v4: Add empathy intro (already filtered no_spoiler/unknown/help above)
    let reply = getEmpathyIntro(ctx) + ' ';
    
    // FAQ-based responses with context enrichment - Map intents to KB keys
    const intentToKbKey: Record<string, string> = {
      'about_mission': 'mission',
      'about_buzz': 'buzz',
      'about_finalshot': 'finalshot',
      'buzz_map': 'buzz_map',
      'plans': 'subscriptions',
      'leaderboard': 'leaderboard',
      'community': 'community',
      'data_privacy': 'data_privacy'
    };
    
    const kbKey = intentToKbKey[intent] || intent;
    const faqEntry = norahKB?.faq?.[kbKey as keyof typeof norahKB.faq];
    if (faqEntry && Array.isArray(faqEntry.a) && faqEntry.a.length > 0) {
      const raw = selectVariation(faqEntry.a, seed);
      reply += interpolate(raw, ctx);
      
      // v4: Add Coach CTA
      reply += getCoachCTA(ctx);
      
      // v4: Add engagement hook
      reply += getEngagementHook(intent);
      
      // Apply modulators for natural variation
      reply = addModulators(reply, seed);
      
      console.log('[NORAH-v4] Reply with persona/coach/engagement:', { intent, hasCoachCTA: true });
      
      return reply;
    }

    // Fallback for unhandled intents
    const fallback = `Agente ${ctx?.agent?.code || 'N/D'}, non ho una risposta specifica. Chiedi di BUZZ, Final Shot, indizi, pattern o regole.`;
    return fallback + getCoachCTA(ctx) + getEngagementHook(intent);
  } catch (error) {
    console.error('[NORAH-v4] Reply generation error:', error);
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
