// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// NORAH Humor Engine v6 - Contextual humor with throttle

import type { SentimentLabel } from './sentiment';
import type { NorahContext } from './contextBuilder';

// Humor throttle: max 1 joke every 5 messages
let lastJokeTimestamp = 0;
let messagesSinceJoke = 0;

// v6.2: Expanded to 60+ jokes (10 per sentiment + 10 neutral)
const HUMOR_POOL = {
  frustrated: [
    "Tranquillo, anche Einstein si bloccava sui puzzle. E guarda com'è finita 😉",
    "Hey, respirare profondo aiuta. Poi riprendiamo con calma, ok?",
    "Sai cosa? Prendiamola con filosofia. Un passo alla volta, ce la facciamo.",
    "Ok, timeout! Facciamo reset: tu + io + un piano semplice. Ripartiamo?",
    "Tutti i grandi agenti hanno momenti di crisi. Poi trovano la chiave. Tu sei vicino.",
    "Ehi, nessuno nasce imparato. Nemmeno James Bond sapeva tutto subito 🕵️",
    "Frustrato? È il segnale che stai sfidando te stesso. Bene così!",
    "Respira. Ora io ti do la rotta più semplice. Tu seguila. Deal?",
    "Ok, modalità zen: dimentichiamo tutto e ripartiamo da zero.",
    "Anche i GPS a volte sbagliano strada. Poi ricalcolano e trovano. Tu idem."
  ],
  confused: [
    "Lo so, all'inizio sembra complicato. Ma è più semplice di quanto sembri, giuro!",
    "Ok, facciamo così: io spiego con parole umane, tu mi dici se è chiaro. Deal?",
    "Capito che confusione! Tranquillo, ti guido passo passo finché non clicca tutto.",
    "Ehi, nessun problema. Anche i migliori agenti hanno bisogno di una bussola a volte 🧭",
    "Confuso? Normalissimo! M1SSION è tosto, ma tu hai me come coach. Ce la facciamo.",
    "Quella faccia confusa la vedo da qui 😄. Tranquillo: spiegone breve in arrivo.",
    "Non ti preoccupare: spiego tutto in italiano, zero tecnicismi. Promesso.",
    "Ok, reset mentale: dimentica tutto. Ora ripartiamo da capo con calma.",
    "Confusione = segno che stai imparando. È fisiologico. Ora chiarisco.",
    "Tranquillo, l'ho visto succedere a centinaia di agenti. Ora sistemiamo."
  ],
  rushed: [
    "Ok, modalità turbo attivata! Ti do l'azione più veloce possibile 🚀",
    "Capito, hai fretta. Niente fronzoli: vai dritto al punto, ecco cosa fare:",
    "Zero tempo? Perfetto. Piano sprint: 1 minuto, 1 azione. Pronto?",
    "Ok ok, rapidissimo: fai BUZZ, prendi indizio, esci. Fatto. Domani continui.",
    "Vai di corsa? Ci sta. Ecco il micro-step più veloce che ho.",
    "30 secondi: apri BUZZ, tap, chiudi. Fatto. Domani altro giro.",
    "Tempo zero? Ok: 1 azione sola, il resto dopo. Vai!",
    "Fretta? Perfetto. Modalità sprint: ecco il minimo sindacale.",
    "Capito la fretta. Ti do solo l'essenziale: fai questo e basta.",
    "Ok, veloce: tap BUZZ, ricevi indizio, fine. Domani continui."
  ],
  neutral: [
    "Sai una cosa? Stai facendo bene. Sul serio, keep going 💪",
    "Tutto ok da questa parte. Tu dimmi cosa serve e io elaboro.",
    "Bene bene! Procediamo con metodo. Che facciamo adesso?",
    "Ottimo momento per fare il passo successivo. Sei pronto?",
    "Perfetto, sei in modalità operativa. Andiamo avanti?",
    "Tutto regolare. Dimmi pure cosa serve, sono qui per questo.",
    "Bene così! Ora vediamo il prossimo step logico.",
    "Ottimo ritmo. Continua così e arrivi lontano.",
    "Perfetto, sei ben posizionato. Avanti tutta!",
    "Bene! Ora facciamo il prossimo passo insieme."
  ],
  excited: [
    "Ecco l'energia giusta! Quando sei così carico, le cose succedono 🔥",
    "Adoro questa vibe! Sei in modalità 'winner', lo sento. Andiamo!",
    "Sì! Questa è la carica che serve. Sfruttiamola subito!",
    "Grande! Con questo entusiasmo arrivi lontano. Dai, che facciamo ora?",
    "Perfetto! Energia alta = risultati alti. Continuiamo così!",
    "Questa è la grinta giusta! Sei in modalità beast mode 💪",
    "Sì! Mi piace questa energia! Ora usiamola bene.",
    "Grande carica! Con questa vibe risolvi tutto al volo.",
    "Ottimo spirito! Sei già a metà strada verso la vittoria.",
    "Perfetto! Questa è l'attitudine vincente. Avanti!"
  ]
};

// Safe humor: never on serious intents
const BLOCKED_INTENTS = new Set([
  'no_spoiler',
  'no_coordinates', 
  'rules_violation',
  'report_abuse',
  'data_privacy'
]);

/**
 * v6.5: Maybe inject a contextual joke with telemetry (max 18% of responses)
 * @returns {text, used} object for telemetry
 */
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™ – FIX v6.5 unified signature
export function maybeJoke(
  sentiment: SentimentLabel,
  ctx: NorahContext,
  intent: string
): { text: string; used: boolean } {
  // Check throttle: at least 5 messages since last joke
  messagesSinceJoke++;
  if (messagesSinceJoke < 5) {
    return { text: '', used: false };
  }

  // Block humor on serious intents
  if (intent && BLOCKED_INTENTS.has(intent)) {
    return { text: '', used: false };
  }

  // Block humor if user is rushed (no time for jokes)
  if (sentiment === 'rushed') {
    return { text: '', used: false };
  }

  // 15% probability (1 in ~7 eligible messages)
  const roll = Math.random();
  if (roll > 0.15) {
    return { text: '', used: false };
  }

  // Select appropriate joke for sentiment
  const pool = HUMOR_POOL[sentiment] || HUMOR_POOL.neutral;
  const joke = pool[Math.floor(Math.random() * pool.length)];

  // Reset throttle
  messagesSinceJoke = 0;
  lastJokeTimestamp = Date.now();

  return { text: joke, used: true };
}

/**
 * Reset humor state (for testing or session restart)
 */
export function resetHumorThrottle() {
  messagesSinceJoke = 0;
  lastJokeTimestamp = 0;
}
