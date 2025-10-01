// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Norah Reply Generator v6 - Coach+Friend with Humor, Anti-echo, Predictive NBA

import type { NorahIntent, IntentResult } from './intentRouter';
import type { NorahContext } from './contextBuilder';
import norahKB from '../kb/norahKB.it.json';
import { getPhase, nextBestAction, getPhaseContext, type NorahPhase } from './dialogueManager';
import { detectSentiment, getToneModifier, type SentimentLabel } from './sentiment';
import { isFollowUp, generateFollowUpReply } from './followUp';
import { type ParsedIntent } from './multiIntent';
import { maybeJoke } from './humorEngine';
import { getPredictiveAction, computeNBA } from './nextBestAction';
import { summarizeWindow } from '../state/messageStore';

// PATCH v6.1: Anti-repetition tracking (last 3 responses per intent)
const recentVariations: string[] = [];
const MAX_RECENT = 4;
const recentIntentResponses = new Map<NorahIntent, string[]>();

function trackIntentResponse(intent: NorahIntent, response: string) {
  if (!recentIntentResponses.has(intent)) {
    recentIntentResponses.set(intent, []);
  }
  const responses = recentIntentResponses.get(intent)!;
  responses.push(response);
  if (responses.length > 3) responses.shift(); // Keep only last 3
}

function wasRecentlyUsed(intent: NorahIntent, response: string): boolean {
  const responses = recentIntentResponses.get(intent) || [];
  return responses.includes(response);
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// v5: Empathy/Tone Layer - Expanded to 20 variants
const EMPATHY_INTROS = [
  'Capito, {nickname}!',
  'Ottima mossa, agente {code}.',
  'Perfetto!',
  'Ci sono!',
  'Vediamo insieme.',
  'Ok, analizziamo.',
  'Bene!',
  'D\'accordo.',
  'Capisco, {nickname}.',
  'Roger, agente {code}.',
  'Interessante.',
  'Procediamo.',
  'Chiaro, {nickname}.',
  'Ok agente {code}!',
  'Bene, vediamo.',
  'Ricevuto!',
  '{nickname}, perfetto.',
  'Ok {code}, ci siamo.',
  'Bene così!',
  'Roger!'
];

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// v4.2: Friend nudge - casual, warm closing (10% chance)
const FRIEND_NUDGES = [
  '\n\nTi tengo il posto in BUZZ 😉',
  '\n\nTorno qui quando vuoi!',
  '\n\nSempre qui per te, agente.',
  '\n\nUn passo alla volta, ok?',
  '\n\nCi sentiamo presto!',
  '\n\nSai dove trovarmi 🎯',
  '\n\nAvanti così!',
  '\n\nBuona caccia! 🚀'
];

/**
 * PATCH v6.1: Enhanced anti-echo (lower threshold, ignore stop-words, no "Hai chiesto...")
 * Check if reply echoes user input
 */
function hasEcho(reply: string, userInput: string): boolean {
  const userWords = userInput.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const replyWords = reply.toLowerCase().split(/\s+/);
  
  if (userWords.length < 2) return false; // PATCH v6.1: Lower from 3 to 2
  
  // PATCH v6.1: Expanded stop-words list
  const stopWords = new Set([
    'buzz', 'map', 'final', 'shot', 'indizio', 'come', 'cosa', 'dove', 'quando',
    'perche', 'quale', 'chi', 'quanto', 'fare', 'spiegare', 'capire', 'aiutare'
  ]);
  
  let matches = 0;
  for (const word of userWords) {
    if (!stopWords.has(word) && replyWords.includes(word)) {
      matches++;
    }
  }
  
  // PATCH v6.1: Echo if >30% match (lower from 40%)
  return matches > userWords.length * 0.3;
}

/**
 * Build next step suggestion (follow-up helper)
 */
function buildNextStep(ctx: NorahContext, phase: NorahPhase, sentiment: SentimentLabel): string {
  const nba = computeNBA(ctx, phase, sentiment);
  
  // Closers pool (no repetitions)
  const closers = [
    '\n\nVai così!',
    '\n\nProcedi pure.',
    '\n\nFammi sapere come va.',
    '\n\nCi siamo!',
    '\n\nSei sulla strada giusta.',
    '\n\nDai, che ce la fai!'
  ];
  
  const closer = closers[Math.floor(Math.random() * closers.length)];
  
  // Format NBA as next step
  let reply = `🎯 **Prossimo passo:**\n\n`;
  reply += nba.steps.slice(0, 2).map((step, idx) => `${idx + 1}. ${step}`).join('\n');
  reply += closer;
  
  return reply;
}

/**
 * PATCH v6.1: Enhanced pricing detection (+ isRetentionQuery for "me ne vado")
 * Detect BUZZ pricing query
 */
function isPricingQuery(input: string): boolean {
  const lower = input.toLowerCase();
  const patterns = [
    /si\s+paga/i,
    /è\s+gratis/i,
    /costa/i,
    /prezzo/i,
    /quanto\s+costa/i,
    /è\s+a\s+pagamento/i,
    /devo\s+pagare/i,
    /gratuito/i
  ];
  
  return patterns.some(p => p.test(lower)) && lower.includes('buzz');
}

/**
 * PATCH v6.1: Detect retention-risk queries ("me ne vado", "non ho tempo")
 */
function isRetentionQuery(input: string): boolean {
  const lower = input.toLowerCase();
  const patterns = [
    /me\s+ne\s+vado/i,
    /abbandono/i,
    /non\s+ho\s+tempo/i,
    /troppo\s+difficile/i,
    /troppo\s+complicato/i,
    /inutile/i,
    /basta/i
  ];
  
  return patterns.some(p => p.test(lower));
}

function maybeAddFriendNudge(): string {
  return Math.random() < 0.10 ? FRIEND_NUDGES[Math.floor(Math.random() * FRIEND_NUDGES.length)] : '';
}

/**
 * Get empathetic intro based on context and sentiment (v6: 20+ variations)
 */
function getEmpathyIntro(ctx: NorahContext, sentiment?: SentimentLabel): string {
  const agentName = ctx?.agent?.nickname || ctx?.agent?.code || 'Agente';
  const clues = ctx?.stats?.clues || 0;
  
  // Episodic memory greeting (if available)
  const episodicSummary = summarizeWindow();
  if (episodicSummary && Math.random() < 0.3) {
    return `Ciao ${agentName}! ${episodicSummary}, giusto? Continuiamo.`;
  }

  // Sentiment-adaptive intros
  if (sentiment === 'frustrated') {
    const frustratedIntros = [
      `${agentName}, tranquillo. Respira.`,
      `Ok ${agentName}, facciamo reset.`,
      `${agentName}, calma. Ti aiuto io.`,
      `Ehi ${agentName}, niente panico.`,
      `${agentName}, un passo alla volta.`
    ];
    return frustratedIntros[Math.floor(Math.random() * frustratedIntros.length)];
  }
  
  if (sentiment === 'confused') {
    const confusedIntros = [
      `${agentName}, chiarisco subito.`,
      `Ok ${agentName}, spiego meglio.`,
      `${agentName}, facciamo ordine.`,
      `Capito ${agentName}, orientiamoci.`,
      `${agentName}, nessun problema.`
    ];
    return confusedIntros[Math.floor(Math.random() * confusedIntros.length)];
  }
  
  if (sentiment === 'excited') {
    const excitedIntros = [
      `${agentName}, grande energia! 🔥`,
      `Sì ${agentName}, andiamo!`,
      `${agentName}, perfetto! Vai così!`,
      `Ottimo ${agentName}, ti sento carico!`,
      `${agentName}, questa è la vibe giusta!`
    ];
    return excitedIntros[Math.floor(Math.random() * excitedIntros.length)];
  }

  // Neutral/default intros (expanded pool)
  const intros = [
    `Ciao ${agentName}!`,
    `${agentName}, ci sono.`,
    `${agentName}, eccomi qui.`,
    `Ok ${agentName}, vediamo.`,
    `Certo ${agentName}.`,
    `${agentName}, dimmi tutto.`,
    `Presente ${agentName}!`,
    `${agentName}, sono qui.`,
    `Ehi ${agentName}, come andiamo?`,
    `${agentName}, procediamo.`,
    `Bene ${agentName}, cosa serve?`,
    `${agentName}, elaboro.`,
    `Ok ${agentName}, ti ascolto.`,
    `${agentName}, vai pure.`,
    `Perfetto ${agentName}.`
  ];

  return intros[Math.floor(Math.random() * intros.length)];
}

/**
 * Get coach-style CTA based on context (v6: more varied, predictive)
 */
function getCoachCTA(ctx: NorahContext): string {
  const clues = ctx?.stats?.clues || 0;
  const buzzToday = ctx?.stats?.buzz_today || 0;
  
  // Try predictive action first
  const predictive = getPredictiveAction(ctx);
  if (predictive && Math.random() < 0.4) {
    return `\n\n💡 **${predictive.title}**\n${predictive.steps[0]}`;
  }

  // Phase-based CTAs
  if (buzzToday === 0) {
    const ctas = [
      '\n\n💡 **Primo step:** Apri BUZZ (tab in basso) e prendi 1 indizio.',
      '\n\n💡 **Inizia ora:** Vai su BUZZ, è veloce. 30 secondi e hai il primo dato.',
      '\n\n💡 **Facciamo subito:** BUZZ → 1 indizio → poi torna qui.'
    ];
    return ctas[Math.floor(Math.random() * ctas.length)];
  }

  if (clues < 3) {
    return '\n\n💡 **Continua:** Fai ancora 2 BUZZ oggi, accumula dati.';
  }

  if (clues >= 3 && clues < 8) {
    return '\n\n💡 **Ottimo ritmo:** Altri 2-3 indizi e puoi iniziare l\'analisi.';
  }

  if (clues >= 8) {
    const advancedCTAs = [
      '\n\n💡 **Prossimo livello:** Cerca pattern negli indizi o usa BUZZ Map.',
      '\n\n💡 **Hai abbastanza dati:** Incrocia gli indizi, trova convergenze.',
      '\n\n💡 **Ora analizza:** BUZZ Map ti mostra l\'area basata sui tuoi dati.'
    ];
    return advancedCTAs[Math.floor(Math.random() * advancedCTAs.length)];
  }

  return '\n\n💡 **Keep going:** Ogni indizio ti avvicina.';
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
// v5: Enhanced reply with DM, multi-intent, sentiment, follow-up
export function generateReply(
  intentResult: IntentResult,
  ctx: NorahContext,
  userInput: string
): string {
  try {
    const seed = `${ctx?.agent?.code || 'default'}_${Date.now()}_${userInput?.length || 0}`;
    const intent = intentResult.intent;
    
    console.log('[NORAH-v5] Generating reply:', { intent, seed });

    // v5: Phase detection via DM
    const phase = getPhase(ctx, userInput, [intent]);
    const sentiment = detectSentiment(userInput);
    const toneModifier = getToneModifier(sentiment);
    
    console.log('[NORAH-v5] DM State:', { phase, sentiment });
    
    // v5: Priority 1 - Follow-up query detection
    if (isFollowUp(userInput)) {
      console.log('[NORAH-v5] Follow-up detected');
      return generateFollowUpReply(ctx, phase, userInput);
    }

    // Guard-rail: spoiler
    if (intent === 'no_spoiler') {
      const options = norahKB?.guardrails?.no_spoiler || ['Non posso rivelare questa informazione.'];
      const reply = selectVariation(options, seed);
      return reply + '\n\n💡 **Posso aiutarti a verificare se i segnali convergono**, senza rivelare nulla di proibito.';
    }

    // v6: Multi-intent handling - risposte più ricche + CTA pratica
    if (intentResult.multiIntents && intentResult.multiIntents.length >= 2) {
      console.log('[NORAH-v5] Multi-intent response');
      let multiReply = `${toneModifier.prefix}${getEmpathyIntro(ctx)} Rispondo a tutto:\n\n`;
      
      intentResult.multiIntents.slice(0, 2).forEach((pi, idx) => {
        const faqKey = pi.intent.replace('about_', '');
        const faqEntry = norahKB?.faq?.[faqKey as keyof typeof norahKB.faq];
        if (faqEntry && Array.isArray(faqEntry.a) && faqEntry.a.length > 0) {
          // v6: Take first 2 sentences instead of 1 for clarity
          const sentences = faqEntry.a[0].split('.').filter((s: string) => s.trim().length > 0);
          const answer = sentences.slice(0, 2).join('. ') + '.';
          multiReply += `**${idx + 1}. ${pi.fragment}**\n${answer}\n\n`;
        }
      });
      
      const nba = nextBestAction(ctx, phase, sentiment);
      multiReply += `💡 **Ora fai questo**: ${nba.steps[0]}`;
      return multiReply + maybeAddFriendNudge();
    }

    // © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
    // v6: Enhanced retention + PRICING clarity - NO echo, tone adaptive
    const lowerInput = (userInput || '').toLowerCase();
    
    // v6: Priority 1 - BUZZ pricing detection (must be FIRST)
    const pricingSignals = ['si paga', 'è gratis', 'prezzo', 'costa', 'pagare', 'free', 'gratis', 'quanto costa'];
    const hasPricingQuery = pricingSignals.some(sig => lowerInput.includes(sig));
    
    if (hasPricingQuery) {
      const pricingResponses = [
        `${getEmpathyIntro(ctx)} BUZZ è completamente **gratuito**. Zero costi per raccogliere indizi. Vai su BUZZ ora e inizia!`,
        `${getEmpathyIntro(ctx)} Tranquillo, BUZZ **non costa nulla**! È gratis per tutti. Premi BUZZ e parti subito.`,
        `${getEmpathyIntro(ctx)} **BUZZ è gratis al 100%**. Nessun costo per gli indizi. Vai su BUZZ e inizia la caccia!`
      ];
      return selectVariation(pricingResponses, seed) + maybeAddFriendNudge();
    }
    
    // Detect confusion/lost signals - v4.2: expanded
    const confusionSignals = ['non ho capito niente', 'nn capito niente', 'nn capito', 'boh', 'non capisco', 'niente', 'aiuto non capisco'];
    const hasConfusion = confusionSignals.some(sig => lowerInput.includes(sig));
    
    if (hasConfusion) {
      const reassuranceResponses = [
        `${getEmpathyIntro(ctx)} Tranquillo! Ti spiego in un passo: fai BUZZ per ottenere 1 indizio. Solo questo. Poi torna qui e vediamo insieme cosa significa. Ci stai?`,
        `${getEmpathyIntro(ctx)} Ok, ripartiamo: BUZZ = ottieni 1 indizio. Fine. Fallo ora, poi mi dici cosa hai ricevuto. Semplice così.`,
        `${getEmpathyIntro(ctx)} Nessun panico! Passo 1: premi BUZZ. Ricevi 1 indizio. Stop. Poi analizziamo insieme. Vuoi provare?`
      ];
      return selectVariation(reassuranceResponses, seed) + maybeAddFriendNudge();
    }
    
    // Detect time constraints - v4.2: new
    const timeConstraints = ['non ho tempo', 'più tardi', 'domani', 'troppo lungo', 'veloce'];
    const hasTimeIssue = timeConstraints.some(sig => lowerInput.includes(sig));
    
    if (hasTimeIssue) {
      const quickResponses = [
        `${getEmpathyIntro(ctx)} Ok, 30 secondi: apri BUZZ, prendi 1 solo indizio, chiudi. Domani ne prendi altri. Ogni piccolo step conta!`,
        `${getEmpathyIntro(ctx)} Capisco. Fai solo questo oggi: 1 BUZZ, 1 indizio. Stop. Domani continui. Va bene?`,
        `${getEmpathyIntro(ctx)} Zero stress: oggi 1 BUZZ rapido, domani altri 2-3. Costruisci piano. Ci stai?`
      ];
      return selectVariation(quickResponses, seed) + maybeAddFriendNudge();
    }
    
    // PATCH v6.1: Personalized retention with phase + clues context
    const frustrationSignals = ['non mi piace', 'me ne vado', 'abbandono', 'inutile', 'difficile', 'troppo', 'basta'];
    const hasFrustration = frustrationSignals.some(sig => lowerInput.includes(sig));
    
    if (hasFrustration) {
      const agentName = ctx?.agent?.nickname || ctx?.agent?.code || 'Agente';
      const clues = ctx?.stats?.clues || 0;
      
      // Phase-aware retention response
      if (clues === 0) {
        return `${getEmpathyIntro(ctx, sentiment)} ${agentName}, capisco la frustrazione. Ti propongo 2 alternative: 1) Fai 1 BUZZ adesso (30 secondi) e vedi com'è, oppure 2) Riproviamo domani con calma. Cosa preferisci?` + maybeAddFriendNudge();
      } else if (clues < 5) {
        return `${getEmpathyIntro(ctx, sentiment)} ${agentName}, hai già ${clues} indizi. Sarebbe un peccato fermarsi ora. Alternative: 1) Fai solo 1 BUZZ oggi, oppure 2) Analizziamo insieme ciò che hai. 60 secondi. Ci stai?` + maybeAddFriendNudge();
      } else {
        return `${getEmpathyIntro(ctx, sentiment)} ${agentName}, hai ${clues} indizi - sei già a buon punto! Non mollare ora. Ti do 2 opzioni: 1) Fai 1 ultimo BUZZ, oppure 2) Analizziamo pattern con ciò che hai. Quale scegli?` + maybeAddFriendNudge();
      }
    }
    
    // v6: Unknown/Help fallback - Tone adaptive, NO echo, coach-friendly
    if (intent === 'unknown' || intent === 'help') {
      const agentName = ctx?.agent?.nickname || ctx?.agent?.code || 'Agente';
      const clues = ctx?.stats?.clues || 0;
      
      // Apply tone modifier based on sentiment
      let reply = `${toneModifier.prefix}${getEmpathyIntro(ctx)} `;
      
      // Check if user mentioned known keywords but intent was missed
      const knownKeywords = ['mission', 'm1ssion', 'buzz', 'finalshot', 'fs', 'mappa', 'piani', 'abbo', 'pattern', 'decode'];
      const foundKeyword = knownKeywords.find(kw => lowerInput.includes(kw));
      
      if (foundKeyword) {
        // Redirect to most likely intent based on keyword
        if (['mission', 'm1ssion'].some(k => lowerInput.includes(k))) {
          const missionOptions = norahKB?.faq?.mission?.a || ['M1SSION™ è un gioco di intelligence e ricerca del premio.'];
          reply += selectVariation(missionOptions, seed);
          reply += getCoachCTA(ctx);
          return reply + maybeAddFriendNudge();
        }
        if (['finalshot', 'fs'].some(k => lowerInput.includes(k))) {
          const fsOptions = norahKB?.faq?.finalshot?.a || ['Final Shot: tentativo finale per vincere (max 2 al giorno).'];
          reply += selectVariation(fsOptions, seed);
          reply += getCoachCTA(ctx);
          return reply + maybeAddFriendNudge();
        }
        if (['piani', 'abbo'].some(k => lowerInput.includes(k))) {
          const planOptions = norahKB?.faq?.subscriptions?.a || ['Vai su Abbonamenti per vedere i piani disponibili.'];
          reply += selectVariation(planOptions, seed);
          return reply + maybeAddFriendNudge();
        }
      }
      
      // v6: NO rigid commands, friendly suggestions instead
      const helpOptions = [
        `Posso aiutarti con: Mission (cos'è il gioco), BUZZ (indizi), Final Shot (colpo finale), piani (abbonamenti). Cosa ti serve?`,
        `Ti spiego: Mission, BUZZ, Final Shot, piani, regole. Di cosa parliamo?`,
        `Sono qui per: spiegare Mission, aiutarti con BUZZ, chiarire Final Shot, mostrare i piani. Dove iniziamo?`
      ];
      reply += selectVariation(helpOptions, seed);
      
      // Add contextual CTA based on agent state
      if (ctx?.agent?.code === 'AG-UNKNOWN') {
        reply += `\n\n⚠️ Profilo non sincronizzato. Prova a ricaricare la pagina.`;
      } else if (clues === 0) {
        reply += `\n\n💡 ${agentName}, ti consiglio: inizia con BUZZ per raccogliere i primi indizi.`;
      } else if (clues < 8) {
        reply += `\n\n💡 ${agentName}, hai ${clues} indizi. Prosegui con BUZZ o esplora BUZZ Map.`;
      } else {
        reply += `\n\n💡 ${agentName}, con ${clues} indizi puoi cercare pattern o valutare Final Shot.`;
      }
      
      return reply + maybeAddFriendNudge();
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
      let raw = selectVariation(faqEntry.a, seed);
      
      // PATCH v6.1: Anti-repetition - retry if recently used
      let attempts = 0;
      while (wasRecentlyUsed(intent, raw) && attempts < 3) {
        raw = selectVariation(faqEntry.a, seed + attempts);
        attempts++;
      }
      
      reply += interpolate(raw, ctx);
      
      // v4: Add Coach CTA
      reply += getCoachCTA(ctx);
      
      // v4: Add engagement hook
      reply += getEngagementHook(intent);
      
      // Apply modulators for natural variation
      reply = addModulators(reply, seed);
      
      // PATCH v6.1: Track response for anti-repetition
      trackIntentResponse(intent, raw);
      
      // PATCH v6.1: Log to telemetry
      logReplyToSupabase(intent, sentiment, phase).catch(console.error);
      
      // v4.2: Maybe add friend nudge (10% chance)
      reply += maybeAddFriendNudge();
      
      console.log('[NORAH-v6.1] Reply with persona/coach/engagement:', { intent, hasCoachCTA: true });
      
      return reply;
    }

    // v6: Fallback - Coach-friendly, NO rigid commands
    const agentName = ctx?.agent?.nickname || ctx?.agent?.code || 'Agente';
    const fallback = `${getEmpathyIntro(ctx, sentiment)} ${agentName}, posso aiutarti con: Mission, BUZZ, Final Shot, pattern, regole. Cosa ti serve?`;
    
    // PATCH v6.1: Log unknown intents for improvement
    logReplyToSupabase('unknown', sentiment, phase).catch(console.error);
    
    return fallback + getCoachCTA(ctx) + maybeAddFriendNudge();
  } catch (error) {
    console.error('[NORAH-v6.1] Reply generation error:', error);
    return 'Sistemi occupati, riprova tra un momento.';
  }
}

// PATCH v6.1: Log replies to Supabase for telemetry
async function logReplyToSupabase(intent: string, sentiment: string, phase: string) {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('norah_events').insert({
      user_id: user.id,
      event: 'reply_generated',
      intent,
      sentiment,
      phase
    });
  } catch (error) {
    console.error('[ReplyGenerator] Failed to log to telemetry:', error);
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
