// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// NORAH Reply Generator v6.3 - Coach+Friend PRO: Empathetic, Concrete, Varied

import type { NorahIntent, IntentResult } from './intentRouter';
import { routeIntent } from './intentRouter'; // FIX v6.5
import type { NorahContext } from './contextBuilder';
import norahKB from '../kb/norahKB.it.json';
import { getPhase, nextBestAction, getPhaseContext, type NorahPhase } from './dialogueManager';
import { detectSentiment, getToneModifier, type SentimentLabel } from './sentiment';
import { isFollowUp, generateFollowUpReply } from './followUp';
import { type ParsedIntent } from './multiIntent';
import { maybeJoke } from './humorEngine';
import { computeNBA } from './nextBestAction';
import { summarizeWindow, fetchLastEpisode } from '../state/messageStore';
import { logEvent, logJokeUsed, logRetentionTrigger } from '../utils/telemetry';
import { generateQuizChallenge, getRandomQuiz, validateAnswer } from '../coach/miniQuiz';
import { generateDrillChallenge, getRandomDrill, validateDrillAnswer } from '../coach/patternDrill';
import { generateFAQ60 } from '../coach/faq60';

// v6.3: Recent template IDs (anti-repetition circular buffer)
let recentTemplateIds: string[] = [];
const MAX_RECENT_TEMPLATES = 3;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// v6.8: Expanded empathy hooks (30+ variants)
const EMPATHY_HOOKS = [
  'Ok {name}, ci penso io.',
  'Ci sono: lo facciamo semplice e utile.',
  'Ottima mossa, agente {code}.',
  'Respiro profondo: un passo e siamo avanti.',
  'Capito. Ti porto io nella direzione giusta.',
  'Va bene saltare i giri inutili. Ecco cosa conviene fare.',
  'Ho letto tra le righe: vuoi chiarezza rapida.',
  'Zero fronzoli: ti alleno io.',
  'Tranquillo, sei nel posto giusto.',
  'Capito: facciamolo semplice e concreto.',
  'Capito, {name}!',
  'Perfetto!',
  'Ci sono!',
  'Vediamo insieme.',
  'Ok, analizziamo.',
  'Bene!',
  'D\'accordo.',
  'Capisco, {name}.',
  'Roger, agente {code}.',
  'Interessante.',
  'Procediamo.',
  'Chiaro, {name}.',
  'Ok agente {code}!',
  'Bene, vediamo.',
  'Ricevuto!',
  '{name}, perfetto.',
  'Ok {code}, ci siamo.',
  'Bene così!',
  'Roger!',
  'Ehi {name}, facciamolo insieme.',
  'Chiaro. Un attimo.'
];

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// v6.8: Expanded closers (16+ variants, sentiment-aware)
const CLOSERS = [
  'Sei più avanti di quanto pensi. Andiamo.',
  'Ottimo ritmo: un tassello alla volta.',
  'Ti copro le spalle: scelgo io la prossima mossa se vuoi.',
  'Quando sei pronto, facciamo un altro passo.',
  'Hai già {clues} indizi: capitalizziamoli.',
  'Se vuoi sprint, ho una mossa da 30s.',
  'Perfetto. Tocco leggero, risultati veri.',
  'Lo stai rendendo interessante.',
  'Ci siamo: un passo alla volta, e il quadro compare.',
  'Ottimo ritmo. Torna agli indizi di ieri: c\'è un collegamento sottile.',
  'Se hai dubbi, scegli la pista più coerente col tema ricorrente.',
  'Non forzo la risposta: ti tengo centrato sulla logica giusta.',
  'Buona caccia — il dettaglio fa la differenza.',
  'Procediamo con calma: il metodo batte la fretta.',
  'Ogni frammento conta. Continua così.',
  'Il puzzle si compone pezzo dopo pezzo.'
];

/**
 * v6.3: Check if reply echoes user input (Anti-echo 2.0 - stricter)
 * Detects 3+ contiguous words or >35% overlap
 */
function hasEcho(reply: string, userInput: string): boolean {
  const userWords = userInput.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const replyLower = reply.toLowerCase();
  
  if (userWords.length < 3) return false;
  
  // Check for 3+ contiguous words from input appearing in reply
  for (let i = 0; i <= userWords.length - 3; i++) {
    const trigram = userWords.slice(i, i + 3).join(' ');
    if (replyLower.includes(trigram)) {
      console.log('[Anti-echo] Detected 3-word echo:', trigram);
      return true;
    }
  }
  
  // Count matching significant words (exclude common words)
  const commonWords = new Set(['buzz', 'map', 'final', 'shot', 'indizio', 'come', 'cosa', 'dove', 'quando', 'che', 'per']);
  let matches = 0;
  for (const word of userWords) {
    if (!commonWords.has(word) && replyLower.includes(word)) {
      matches++;
    }
  }
  
  // Echo if >35% of significant user words appear in reply
  return matches > userWords.length * 0.35;
}

/**
 * v6.3: Render choice list with anti-repetition
 */
export function renderChoiceList(choices: string[]): string {
  return choices.map((c, i) => `${i + 1}. ${c}`).join('\n');
}

/**
 * v6.3: Get empathic hook with anti-repetition
 */
function getEmpathyHook(ctx: NorahContext): string {
  const agentName = ctx?.agent?.nickname || 'Agente';
  const agentCode = ctx?.agent?.code || 'AG-XXXX';
  
  // Pick random hook that's not in recent 3
  const available = EMPATHY_HOOKS.filter(h => !recentTemplateIds.includes(h));
  const hook = available.length > 0 
    ? available[Math.floor(Math.random() * available.length)]
    : EMPATHY_HOOKS[Math.floor(Math.random() * EMPATHY_HOOKS.length)];
  
  // Track usage
  recentTemplateIds.push(hook);
  if (recentTemplateIds.length > MAX_RECENT_TEMPLATES) {
    recentTemplateIds.shift();
  }
  
  return hook
    .replace('{name}', agentName)
    .replace('{code}', agentCode);
}

/**
 * v6.3: Get closer with anti-repetition
 */
function getCloser(): string {
  const available = CLOSERS.filter(c => !recentTemplateIds.includes(c));
  const closer = available.length > 0
    ? available[Math.floor(Math.random() * available.length)]
    : CLOSERS[Math.floor(Math.random() * CLOSERS.length)];
  
  // Track usage
  recentTemplateIds.push(closer);
  if (recentTemplateIds.length > MAX_RECENT_TEMPLATES) {
    recentTemplateIds.shift();
  }
  
  return closer;
}

/**
 * v6.3: Generate BUZZ explanation (concrete example)
 */
function generateBuzzExplanation(ctx: NorahContext): string {
  const hook = getEmpathyHook(ctx);
  const closer = getCloser();
  
  const body = `BUZZ ti dà indizi veri sul posto giusto: ogni BUZZ = 1 indizio leggibile in 10s.
Con 6–8 indizi inizi a vedere un pattern; con 9–12 prepari il Final Shot.
Scegli tu il ritmo: una volta al giorno è perfetto.`;

  const choices = [
    'Apriamo BUZZ e prendiamo il primo indizio di oggi.',
    'Oppure ti spiego come leggere correttamente un indizio.'
  ];
  
  return `${hook}\n\n${body}\n\nCosa facciamo adesso?\n${renderChoiceList(choices)}\n\n${closer}`;
}

/**
 * v6.3: Generate Mission explanation (concrete example)
 */
function generateMissionExplanation(ctx: NorahContext): string {
  const hook = getEmpathyHook(ctx);
  const closer = getCloser();
  
  const body = `M1SSION è una caccia al premio reale: raccogli indizi, trovi pattern, tiri il Final Shot sul punto esatto.
Vince chi deduce meglio, non chi spende di più.`;

  const choices = [
    'Prendiamo un indizio adesso (ti guido io).',
    'Oppure ti spiego Final Shot in 2 frasi + una prova safe.'
  ];
  
  return `${hook}\n\n${body}\n\nScelte rapide:\n${renderChoiceList(choices)}\n\n${closer}`;
}

/**
 * v6.8: Generate "How to start" explanation
 */
function generateHowToStart(ctx: NorahContext): string {
  const hook = getEmpathyHook(ctx);
  const closer = getCloser();
  
  const body = `Ci sono, partiamo in modo leggero.
Step 1 (30s): apri BUZZ e prendi 1 indizio.
Step 2 (60s): torni qui e te lo traduco in azioni.`;

  const choices = [
    'Vuoi farlo ora?',
    'Preferisci una panoramica rapida di M1SSION?'
  ];
  
  return `${hook}\n\n${body}\n\n${renderChoiceList(choices)}\n\n${closer}`;
}

/**
 * v6.8: Generate "No BUZZ" alternative response
 */
function generateNoBuzzResponse(ctx: NorahContext): string {
  const hook = getEmpathyHook(ctx);
  const closer = getCloser();
  
  const body = `Ok, niente BUZZ ora. Ti propongo tre alternative per allenarti senza raccogliere indizi:`;
  
  const choices = [
    '**Mini-Quiz 30s**: ti alleno su un indizio tipico (zero spoiler)',
    '**Pattern Drill**: riconosci quale indizio restringe di più',
    '**FAQ 60s**: 4 domande essenziali su M1SSION'
  ];
  
  return `${hook}\n\n${body}\n\n${renderChoiceList(choices)}\n\n${closer}`;
}

/**
 * v6.8: Generate "BUZZ vs Map" comparison
 */
function generateBuzzVsMapComparison(ctx: NorahContext): string {
  const hook = getEmpathyHook(ctx);
  const closer = getCloser();
  
  const body = `**BUZZ** = raccogli indizi veri (1/giorno gratis).\n**BUZZ Map** = visualizza indizi su mappa + raggio di confidenza.\n\nIl flusso: BUZZ → raccogli 5+ indizi → BUZZ Map → vedi dove convergono → Final Shot.`;
  
  const choices = [
    'Faccio un BUZZ ora',
    'Vedo BUZZ Map (serve ≥3 indizi)',
    'Spiega Final Shot'
  ];
  
  return `${hook}\n\n${body}\n\nScelte rapide:\n${renderChoiceList(choices)}\n\n${closer}`;
}

/**
 * v6.8: Generate quick rules summary
 */
function generateRulesShort(ctx: NorahContext): string {
  const hook = getEmpathyHook(ctx);
  const closer = getCloser();
  
  const body = `**Regole in 3 righe**:\n1. Raccogli indizi con BUZZ (gratuito).\n2. Trova pattern e restringe l'area.\n3. Tira Final Shot sul punto esatto (max 2/giorno).`;
  
  const choices = [
    'Inizia con 1 BUZZ',
    'Spiega Final Shot safe',
    'FAQ completa'
  ];
  
  return `${hook}\n\n${body}\n\n${renderChoiceList(choices)}\n\n${closer}`;
}

/**
 * v6.8: Generate saluto (greeting) response
 */
function generateSalutoResponse(ctx: NorahContext): string {
  const hook = getEmpathyHook(ctx);
  const closer = getCloser();
  
  const clues = ctx?.stats?.clues || 0;
  
  const body = clues > 0
    ? `Hai già ${clues} indizi raccolti. Facciamo una mossa utile adesso?`
    : `Facciamo una mossa semplice e utile per iniziare.`;
  
  const choices = [
    'Apri BUZZ (1 indizio in 60s)',
    'Panoramica M1SSION',
    'Alternative senza BUZZ'
  ];
  
  return `${hook}\n\n${body}\n\n${renderChoiceList(choices)}\n\n${closer}`;
}

/**
 * v6.3: Retention response (personalized)
 */
function generateRetentionResponse(ctx: NorahContext, phase: NorahPhase): string {
  const hook = getEmpathyHook(ctx);
  const clues = ctx?.stats?.clues || 0;
  
  logRetentionTrigger('frustrated_exit', clues);
  
  const body = clues > 0
    ? `Capisco la sensazione, succede quando manca il primo indizio.
Hai già ${clues} indizi: sei più avanti di quanto pensi.
Facciamo così: 60 secondi insieme → 1 BUZZ adesso e lo leggiamo subito.
Se non ti è utile, chiudiamo qui. Ti va?`
    : `Capisco la frustrazione. Nessun problema.
Prima di andare, posso mostrarti 1 BUZZ in 60 secondi? Zero impegno, solo per vedere se ti è utile.
Se non funziona, chiudiamo qui. Deal?`;
  
  return `${hook}\n\n${body}`;
}

/**
 * v6.3: Clarify response (warm, with 2 pills)
 */
function generateClarifyResponse(ctx: NorahContext, suggestedIntent: string): string {
  const hook = getEmpathyHook(ctx);
  
  const suggestions: Record<string, [string, string]> = {
    about_buzz: ['Come funziona BUZZ?', 'Quanto costa BUZZ?'],
    about_mission: ['Cos\'è M1SSION?', 'Come si vince?'],
    about_finalshot: ['Cos\'è Final Shot?', 'Come funziona Final Shot?'],
    plans: ['Quali piani ci sono?', 'Piani gratuiti?']
  };
  
  const [opt1, opt2] = suggestions[suggestedIntent] || ['Spiega BUZZ', 'Spiega M1SSION'];
  
  return `${hook}\n\nNon sono sicura di aver capito. Intendi:\n1. ${opt1}\n2. ${opt2}\n\nScegli tu o riformula.`;
}

/**
 * v6.3: Unknown/Help fallback (empathetic with micro-options)
 */
function generateUnknownResponse(ctx: NorahContext, userInput: string): string {
  const hook = getEmpathyHook(ctx);
  const closer = getCloser();
  
  const body = `Non ho capito perfettamente, ma ci arrivo.`;
  
  const choices = [
    'Vuoi sapere come funziona BUZZ?',
    'Oppure preferisci una guida rapida per iniziare?'
  ];
  
  return `${hook}\n\n${body}\n\n${renderChoiceList(choices)}\n\n${closer}`;
}

/**
 * v6.3: Pricing query response (always direct)
 */
function generatePricingResponse(ctx: NorahContext): string {
  const hook = getEmpathyHook(ctx);
  
  return `${hook}\n\nBUZZ è **gratuito**. Zero costi, zero sorprese.\nPronto a provare? → Apri BUZZ ora.`;
}

/**
 * v6.3: Multi-intent handler (2 card + CTA unica)
 */
function handleMultiIntent(
  multiIntents: ParsedIntent[],
  ctx: NorahContext,
  userInput: string
): string {
  const hook = getEmpathyHook(ctx);
  const closer = getCloser();
  
  if (multiIntents.length === 0) {
    return generateUnknownResponse(ctx, userInput);
  }
  
  // © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™ – FIX v6.5
  // Handle top 2 intents
  const cards: string[] = [];
  for (let i = 0; i < Math.min(2, multiIntents.length); i++) {
    const intentData = multiIntents[i];
    const kb = norahKB[intentData.intent as keyof typeof norahKB];
    if (kb && 'a' in kb) {
      const text = kb.a[0] || 'Info non disponibile';
      cards.push(`**${String(intentData.intent)}**\n${text}`);
    }
  }
  
  const cta = '\n\nVuoi approfondire uno di questi? Oppure facciamo 1 BUZZ rapido?';
  
  return `${hook}\n\n${cards.join('\n\n')}${cta}\n\n${closer}`;
}

/**
 * Main reply generator v6.5
 */
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™ – FIX v6.5
export function composeReply(
  intentResult: IntentResult,
  userInput: string,
  ctx: NorahContext
): string {
  const phase = getPhase(ctx, userInput, [intentResult.intent]);
  const sentiment = detectSentiment(userInput);
  
  // Log telemetry
  logEvent({
    event: 'reply_generated',
    intent: intentResult.intent,
    sentiment,
    phase,
    meta: { confidence: intentResult.confidence }
  });
  
  // Follow-up detection
  if (isFollowUp(userInput)) {
    return generateFollowUpReply(ctx, phase, userInput);
  }
  
  // Pricing query (direct response)
  if (isPricingQuery(userInput)) {
    return generatePricingResponse(ctx);
  }
  
  // v6.8: Mini-Quiz / Pattern Drill / FAQ requests
  if (/mini.?quiz|quiz/i.test(userInput)) {
    return generateQuizChallenge();
  }
  
  if (/pattern.?drill|drill/i.test(userInput)) {
    return generateDrillChallenge();
  }
  
  if (/faq|domande/i.test(userInput)) {
    return generateFAQ60();
  }
  
  // Retention trigger (frustrated exit)
  if (sentiment === 'frustrated' && /me\s+ne\s+vado|basta|difficile/i.test(userInput)) {
    return generateRetentionResponse(ctx, phase);
  }
  
  // v6.3: Clarify zone handling
  if (intentResult.intent === 'clarify_needed' as NorahIntent) {
    const suggested = intentResult.slots?.suggested_intent || 'about_buzz';
    return generateClarifyResponse(ctx, suggested);
  }
  
  // Multi-intent handling
  if (intentResult.multiIntents && intentResult.multiIntents.length > 1) {
    return handleMultiIntent(intentResult.multiIntents, ctx, userInput);
  }
  
  // Intent-specific responses (v6.8: expanded with new intents)
  let baseReply = '';
  
  switch (intentResult.intent) {
    case 'about_buzz':
      baseReply = generateBuzzExplanation(ctx);
      break;
      
    case 'about_mission':
      baseReply = generateMissionExplanation(ctx);
      break;
      
    case 'help':
    case 'help_start':
      baseReply = generateHowToStart(ctx);
      break;
      
    case 'saluto':
    case 'smalltalk':
      baseReply = generateSalutoResponse(ctx);
      break;
      
    case 'no_buzz':
      baseReply = generateNoBuzzResponse(ctx);
      break;
      
    case 'diff_buzz_vs_map':
      baseReply = generateBuzzVsMapComparison(ctx);
      break;
      
    case 'rules_short':
      baseReply = generateRulesShort(ctx);
      break;
      
    case 'unknown':
      baseReply = generateUnknownResponse(ctx, userInput);
      break;
      
    default:
      // Fallback to KB
      const kb = norahKB[intentResult.intent as keyof typeof norahKB];
      if (kb && 'a' in kb) {
        const hook = getEmpathyHook(ctx);
        const closer = getCloser();
        const body = kb.a[0] || 'Info non disponibile.';
        baseReply = `${hook}\n\n${body}\n\n${closer}`;
      } else {
        baseReply = generateUnknownResponse(ctx, userInput);
      }
  }
  
  // Anti-echo check
  if (hasEcho(baseReply, userInput)) {
    console.log('[Reply] Echo detected, paraphrasing...');
    const hook = getEmpathyHook(ctx);
    const closer = getCloser();
    baseReply = `${hook}\n\nCapito la domanda. ${baseReply.split('\n\n')[1] || baseReply}\n\n${closer}`;
  }
  
  // v6.3: Maybe add humor (throttled, 12-18%)
  const joke = maybeJoke(sentiment, ctx, intentResult.intent);
  if (joke.used) {
    logJokeUsed(sentiment, joke.text);
    baseReply = `${joke.text}\n\n${baseReply}`;
  }
  
  return baseReply;
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

/**
 * v6.7: Unified generateReply signature (1 arg only)
 */
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™ – FIX v6.7
export async function generateReply(
  userInput: string
): Promise<string> {
  const ctx = await import('./contextBuilder').then(m => m.buildNorahContext());
  const intentResult = routeIntent(userInput);
  
  return composeReply(intentResult, userInput, ctx);
}

export function generateMentorAdvice(ctx: NorahContext): string {
  return generateHowToStart(ctx);
}

export function detectPatterns(ctx: NorahContext): string {
  return 'Pattern detection - use composeReply';
}

export function estimateProbability(ctx: NorahContext): string {
  return 'Probability estimation - use composeReply';
}
