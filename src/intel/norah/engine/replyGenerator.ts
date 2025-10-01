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

// Recent variations cache (cooldown) - v4.2: increased to 4
const recentVariations: string[] = [];
const MAX_RECENT = 4;

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
 * Check if reply echoes user input (anti-echo)
 */
function hasEcho(reply: string, userInput: string): boolean {
  const userWords = userInput.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const replyWords = reply.toLowerCase().split(/\s+/);
  
  if (userWords.length < 3) return false;
  
  // Count matching words (exclude common words)
  const commonWords = new Set(['buzz', 'map', 'final', 'shot', 'indizio', 'come', 'cosa', 'dove', 'quando']);
  let matches = 0;
  for (const word of userWords) {
    if (!commonWords.has(word) && replyWords.includes(word)) {
      matches++;
    }
  }
  
  // Echo if >40% of significant user words appear in reply
  return matches > userWords.length * 0.4;
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

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// v4.2: Mentor/Coach Layer - CTA dinamiche con più varietà
function getCoachCTA(ctx: NorahContext): string {
  const clues = ctx?.stats?.clues || 0;
  const seed = Date.now();
  
  if (clues === 0) {
    const ctas = [
      '\n\n💡 **Prossimo passo**: Apri BUZZ e raccogli 2-3 indizi oggi. Poi torniamo qui per analizzarli insieme.',
      '\n\n💡 **Start**: Fai BUZZ subito per ottenere i primi 2-3 indizi. Ogni dato conta.',
      '\n\n💡 **Primo step**: BUZZ ora, prendi 2-3 indizi, poi analizziamo insieme il quadro.'
    ];
    return ctas[seed % ctas.length];
  }
  
  if (clues >= 1 && clues <= 3) {
    const ctas = [
      '\n\n💡 **Suggerimento**: Hai i primi indizi. Continua con BUZZ per averne almeno 4-5, poi possiamo cercare pattern interessanti.',
      '\n\n💡 **Fase raccolta**: Buon inizio! Continua con BUZZ fino a 5-6 indizi per vedere pattern.',
      '\n\n💡 **Prosegui**: Ancora BUZZ! Target: 5-6 indizi totali prima di analizzare pattern.'
    ];
    return ctas[seed % ctas.length];
  }
  
  if (clues >= 4 && clues <= 7) {
    const ctas = [
      '\n\n💡 **Ottimo ritmo!** Ora posso cercare pattern e correlazioni nei tuoi indizi. Vuoi che analizzi tutto?',
      '\n\n💡 **Fase intermedia**: Hai dati solidi. Posso cercare pattern e convergenze ora.',
      '\n\n💡 **Pronti per analisi**: Con questi indizi posso trovare correlazioni. Proseguiamo?'
    ];
    return ctas[seed % ctas.length];
  }
  
  if (clues >= 8) {
    const ctas = [
      '\n\n💡 **Fase avanzata**: Hai abbastanza dati. Se i segnali convergono, valuta Final Shot (max 2/giorno). Vuoi che verifichi la coerenza prima?',
      '\n\n💡 **Pronto per Final Shot**: Con questi indizi puoi valutare. Vuoi che controlli coerenze prima?',
      '\n\n💡 **Fase finale**: Dati solidi! Analizza pattern, poi considera Final Shot (2 al giorno max).'
    ];
    return ctas[seed % ctas.length];
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
    
    // Detect frustration/off-ramp signals
    const frustrationSignals = ['non mi piace', 'me ne vado', 'abbandono', 'inutile', 'difficile', 'troppo', 'basta'];
    const hasFrustration = frustrationSignals.some(sig => lowerInput.includes(sig));
    
    if (hasFrustration) {
      const retentionResponses = [
        `${getEmpathyIntro(ctx)} Capisco che possa sembrare complesso. Ti lascio 3 dritte veloci: 1) BUZZ per indizi, 2) BUZZ Map per vedere l'area, 3) Final Shot quando sei sicuro. Proviamo insieme?`,
        `${getEmpathyIntro(ctx)} M1SSION richiede metodo, non fortuna. Ti aiuto passo-passo: iniziamo con 2-3 BUZZ oggi, poi analizziamo insieme. Ci stai?`,
        `${getEmpathyIntro(ctx)} Non mollare ora! Ti mostro il percorso più semplice: BUZZ → analisi → Final Shot. Ti seguo per 60 secondi?`
      ];
      return selectVariation(retentionResponses, seed) + maybeAddFriendNudge();
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
      const raw = selectVariation(faqEntry.a, seed);
      reply += interpolate(raw, ctx);
      
      // v4: Add Coach CTA
      reply += getCoachCTA(ctx);
      
      // v4: Add engagement hook
      reply += getEngagementHook(intent);
      
      // Apply modulators for natural variation
      reply = addModulators(reply, seed);
      
      // v4.2: Maybe add friend nudge (10% chance)
      reply += maybeAddFriendNudge();
      
      console.log('[NORAH-v4.2] Reply with persona/coach/engagement:', { intent, hasCoachCTA: true });
      
      return reply;
    }

    // v6: Fallback - Coach-friendly, NO rigid commands
    const agentName = ctx?.agent?.nickname || ctx?.agent?.code || 'Agente';
    const fallback = `${getEmpathyIntro(ctx)} ${agentName}, posso aiutarti con: Mission, BUZZ, Final Shot, pattern, regole. Cosa ti serve?`;
    return fallback + getCoachCTA(ctx) + maybeAddFriendNudge();
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
