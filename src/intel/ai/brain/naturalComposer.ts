// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Norah Natural Composer - Varied, contextual responses

import type { NorahIntent, NorahContext } from '@/intel/context/schema';

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Response templates by intent (multiple variants)
const TEMPLATES: Record<string, string[]> = {
  about_m1ssion: [
    "M1SSION è una caccia al tesoro urbana dove raccogli indizi ogni giorno tramite BUZZ. Il premio finale? Lo scopri solo risolvendo il puzzle. {agentCode}, il gioco è aperto — ogni settimana nuovi indizi, una sola risposta giusta.",
    "M1SSION ti mette alla prova: indizi quotidiani via BUZZ, pattern da riconoscere, e alla fine un colpo preciso — il Final Shot. {displayName}, sei qui per cacciare il premio nascosto in città, non per chiedere la soluzione.",
    "In pratica, M1SSION funziona così: ogni giorno puoi fare BUZZ per ottenere indizi. Accumuli pezzi del puzzle. Quando sei pronto, usi il Final Shot per dire dove si trova il premio. Ma attenzione: hai pochi tentativi. {agentCode}, benvenuto nella caccia."
  ],
  
  rules: [
    "Le regole base: fai BUZZ ogni giorno per indizi, analizzali, trova correlazioni. Quando sei sicuro del luogo, usi Final Shot (max 2 tentativi al giorno). Vince chi indovina per primo le coordinate esatte.",
    "Semplice: indizi → analisi → Final Shot. Puoi fare BUZZ una volta al giorno (gratis), poi a pagamento. Il Final Shot richiede coordinate precise. {agentCode}, niente improvvisazioni — serve metodo.",
    "M1SSION premia la costanza: raccogli indizi con BUZZ, cerca pattern, usa strumenti come Buzz Map (se hai tier superiore). Final Shot è il momento della verità. Hai 2 colpi al giorno per settimana. Usa bene ogni tentativo."
  ],

  buzz_help: [
    "BUZZ è il tuo strumento principale: ogni giorno puoi fare un BUZZ gratuito. Ti dà un indizio casuale ma rilevante. {agentCode}, hai già fatto {buzzToday} buzz oggi. {buzzCTA}",
    "Il BUZZ genera indizi dal database M1SSION. Ogni indizio è un pezzo del puzzle — testo, immagine, riferimento geografico. Più ne hai, più chiaro diventa il quadro. Hai {cluesCount} indizi finora.",
    "Usa BUZZ con costanza. Ogni indizio aggiunge informazione. {agentCode}, con {cluesCount} indizi puoi già iniziare a cercare pattern. {buzzCTA}"
  ],

  final_shot: [
    "Final Shot è l'atto finale: inserisci coordinate precise del luogo dove credi sia il premio. Se sbagli, hai un secondo tentativo (max 2 al giorno). Vince il primo che indovina. Non posso dirti di più — il bello sta nel trovarlo da solo.",
    "Il Final Shot richiede precisione millimetrica. Hai coordinate? Vai al pannello Final Shot. Ma ricorda: max 2 tentativi giornalieri. {agentCode}, usa questa funzione solo quando sei sicuro.",
    "Preparati bene prima del Final Shot. Analizza tutti gli indizi, cerca convergenze geografiche. Quando sei pronto, accedi al pannello dedicato. {displayName}, non sprecare colpi — ogni tentativo conta."
  ],

  pattern: [
    "Con {cluesCount} indizi, cerco pattern... {patternAnalysis} Suggerimento: confronta date, luoghi citati, nomi ricorrenti. Il premio si nasconde nei dettagli.",
    "Analisi pattern su {cluesCount} indizi: {patternAnalysis} {agentCode}, ogni indizio è vero, ma solo il quadro completo rivela la meta. Continua a raccogliere e connettere.",
    "Pattern detection: {patternAnalysis} {displayName}, il metodo funziona solo se hai abbastanza pezzi. {buzzCTA}"
  ],

  probability: [
    "Probabilità di successo? Dipende da quanto sei metodico. Con {cluesCount} indizi: {probabilityEstimate}. {agentCode}, la fortuna aiuta chi analizza bene.",
    "Le tue chance crescono con gli indizi. Ora hai {cluesCount} pezzi: {probabilityEstimate}. Ogni BUZZ migliora le probabilità. {buzzCTA}",
    "{probabilityEstimate} basato su {cluesCount} indizi. {displayName}, serve costanza: più dati = più chiarezza. Vai a fare BUZZ se vuoi aumentare le possibilità."
  ],

  profile: [
    "Tu sei {agentCode}, agente M1SSION attivo. {planInfo} Hai raccolto {cluesCount} indizi finora. {progressMessage}",
    "{displayName} ({agentCode}), benvenuto. Piano attuale: {planInfo}. Indizi totali: {cluesCount}. {progressMessage}",
    "Codice agente: {agentCode}. Piano: {planInfo}. Indizi: {cluesCount}. {displayName}, continua la caccia — ogni giorno porta nuove informazioni."
  ],

  progress: [
    "Stato attuale: {cluesCount} indizi raccolti, {buzzToday} buzz oggi. {progressMessage} {agentCode}, mantieni il ritmo.",
    "Hai {cluesCount} indizi. {progressMessage} BUZZ oggi: {buzzToday}. {displayName}, la chiave è la costanza — ogni giorno conta.",
    "Progressi: {cluesCount} totali, {buzzToday} buzz oggi. {progressMessage} Ogni indizio è un passo verso il premio. {buzzCTA}"
  ],

  plan: [
    "Piano attuale: {planInfo}. {planBenefits} {agentCode}, upgrade disponibili per più BUZZ e strumenti avanzati.",
    "Tier: {planInfo}. {planBenefits} Vuoi sbloccare Buzz Map o più tentativi? Considera un upgrade.",
    "{displayName}, hai {planInfo}. {planBenefits} Piano superiore = più strumenti, più indizi, più possibilità."
  ],

  help: [
    "Posso aiutarti con: spiegazione M1SSION, regole, come funziona BUZZ, Final Shot, analisi pattern, stato progressi. Chiedi pure, {agentCode}.",
    "Comandi utili: 'parlami di M1SSION', 'regole', 'che agente sono', 'probabilità', 'pattern'. {displayName}, sono qui per guidarti nella caccia.",
    "Cosa serve? Spiegazione regole? Analisi indizi? Stato avanzamento? Dimmi e ti aiuto. {agentCode}, nessuna informazione riservata — solo supporto tattico."
  ],

  smalltalk: [
    "Ciao {displayName}! Pronto a cacciare? Hai {cluesCount} indizi da analizzare. {buzzCTA}",
    "Ehi {agentCode}, bentornato. {progressMessage} Cosa analizziamo oggi?",
    "Ciao! Sono Norah, la tua intelligence. {cluesCount} indizi raccolti finora. Serve aiuto con qualcosa?"
  ],

  spoiler_guard: [
    "Non posso dirti dove si trova il premio — sarebbe troppo facile! Il bello di M1SSION è trovarlo da soli. Usa BUZZ per indizi, analizza pattern, e quando sei sicuro usa Final Shot. {agentCode}, la caccia è aperta.",
    "{displayName}, le coordinate esatte non posso dartele. Raccogli indizi con BUZZ, cerca correlazioni, applica metodo. Il premio si trova solo risolvendo il puzzle.",
    "Nice try, {agentCode}! Ma no spoiler. M1SSION è un gioco di intelligenza: indizi → analisi → Final Shot. Usa gli strumenti che hai. Il premio è là fuori, trova la strada."
  ],

  default: [
    "Non ho capito bene. Chiedi 'aiuto' per vedere cosa posso fare. {agentCode}, sono qui per supporto tattico, non conversazioni generiche.",
    "Hmm, non riconosco il comando. Prova 'regole', 'probabilità', 'pattern', o 'aiuto'. {displayName}, dimmi cosa serve.",
    "Scusa {agentCode}, non ho questa info. Chiedi 'aiuto' per l'elenco comandi. Sono focalizzata su M1SSION intel."
  ]
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Hedges and discourse markers for natural variation
const HEDGES = ['Direi', 'Sembra', 'In pratica', 'Diciamo', 'Probabilmente'];
const TRANSITIONS = ['Intanto', 'Nel frattempo', 'Quindi', 'Ora', 'Dunque'];
const TONE_STYLES = ['technical', 'friendly', 'direct'];

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
export function composeReply(intent: NorahIntent, ctx: NorahContext): string {
  const templates = TEMPLATES[intent.intent] || TEMPLATES.default;
  
  // Select template based on seed (deterministic variety)
  const seed = generateSeed(ctx.agentCode, ctx.updatedAt);
  const templateIndex = Math.abs(seed) % templates.length;
  let template = templates[templateIndex];

  // Build slots with guards
  const slots = buildSlots(intent, ctx);

  // Replace slots in template (with null safety)
  template = replaceSlots(template, slots);

  // Add natural variations
  template = addNaturalVariations(template, seed);

  // Ensure reasonable length (max 6 sentences)
  const sentences = template.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const limited = sentences.slice(0, 6).join('. ') + '.';

  return limited;
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
function buildSlots(intent: NorahIntent, ctx: NorahContext): Record<string, string> {
  const slots: Record<string, string> = {
    agentCode: ctx.agentCode,
    displayName: ctx.displayName,
    cluesCount: String(ctx.stats.cluesTotal),
    buzzToday: String(ctx.stats.buzzToday),
    planInfo: getPlanDescription(ctx.plan?.tier),
    planBenefits: getPlanBenefits(ctx.plan?.tier),
    progressMessage: getProgressMessage(ctx),
    patternAnalysis: getPatternAnalysis(ctx),
    probabilityEstimate: getProbabilityEstimate(ctx),
    buzzCTA: getBuzzCTA(ctx)
  };

  return slots;
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
function replaceSlots(template: string, slots: Record<string, string>): string {
  // Guard against undefined template
  if (typeof template !== 'string') {
    console.warn('[NaturalComposer] Invalid template:', template);
    return 'Norah ready. How can I assist?';
  }

  let result = template;
  
  for (const [key, value] of Object.entries(slots)) {
    const placeholder = `{${key}}`;
    // Guard against undefined values
    const safeValue = value ?? '';
    result = result.replace(new RegExp(placeholder, 'g'), safeValue);
  }

  return result;
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
function addNaturalVariations(text: string, seed: number): string {
  let result = text;

  // Add hedge occasionally (33% chance)
  if (seed % 3 === 0) {
    const hedge = HEDGES[Math.abs(seed) % HEDGES.length];
    result = result.replace(/^([A-Z])/, `${hedge}, $1`);
  }

  // Add transition mid-text (50% chance)
  const sentences = result.split('. ');
  if (sentences.length > 2 && seed % 2 === 0) {
    const midPoint = Math.floor(sentences.length / 2);
    const transition = TRANSITIONS[Math.abs(seed + 1) % TRANSITIONS.length];
    sentences[midPoint] = `${transition}, ${sentences[midPoint]}`;
    result = sentences.join('. ');
  }

  return result;
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Helper functions
function generateSeed(agentCode: string, timestamp: number): number {
  const agentHash = agentCode.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const timeBucket = Math.floor(timestamp / 30000); // 30s buckets
  return agentHash + timeBucket;
}

function getPlanDescription(tier?: string): string {
  if (!tier || tier === 'free') return 'Piano Base (1 BUZZ/giorno gratuito)';
  if (tier === 'silver') return 'Piano Silver (accesso anticipato)';
  if (tier === 'gold') return 'Piano Gold (BUZZ extra + tools)';
  if (tier === 'black') return 'Piano Black (tutto sbloccato)';
  if (tier === 'titanium') return 'Piano Titanium (accesso esclusivo)';
  return 'Piano Base';
}

function getPlanBenefits(tier?: string): string {
  if (!tier || tier === 'free') return 'Upgrade per BUZZ extra e Buzz Map.';
  if (tier === 'silver') return 'Hai accesso anticipato alle missioni.';
  if (tier === 'gold') return 'BUZZ illimitati + Buzz Map attivo.';
  return 'Tutti gli strumenti sbloccati.';
}

function getProgressMessage(ctx: NorahContext): string {
  const count = ctx.stats.cluesTotal;
  if (count === 0) return 'Inizia con un BUZZ per ottenere il primo indizio.';
  if (count < 3) return 'Pochi indizi ancora — continua con BUZZ.';
  if (count < 7) return 'Buon inizio. Cerca pattern tra gli indizi.';
  return 'Hai abbastanza indizi per una prima analisi seria.';
}

function getPatternAnalysis(ctx: NorahContext): string {
  const count = ctx.stats.cluesTotal;
  if (count < 3) return 'Servono almeno 3-4 indizi per analisi pattern significative.';
  if (count < 7) return 'Alcuni pattern emergono. Cerca luoghi ricorrenti o nomi comuni.';
  return 'Pattern rilevati: confronta date, riferimenti geografici, parole-chiave. Il quadro si fa più chiaro.';
}

function getProbabilityEstimate(ctx: NorahContext): string {
  const count = ctx.stats.cluesTotal;
  if (count === 0) return 'Zero indizi = zero possibilità';
  if (count < 3) return 'Probabilità bassa: ti mancano dati';
  if (count < 7) return 'Probabilità media: hai una base, ma serve più info';
  return 'Probabilità buona: con metodo e analisi puoi trovare il posto';
}

function getBuzzCTA(ctx: NorahContext): string {
  const today = ctx.stats.buzzToday;
  if (today === 0) return 'Fai un BUZZ ora per iniziare la giornata.';
  if (today < 2) return 'Puoi fare ancora BUZZ oggi (a pagamento).';
  return 'BUZZ oggi esauriti — torna domani per il gratuito.';
}
