// © 2025 Joseph MULÉ – M1SSION™
// Intelligence Analyst Engine - Deterministic responses with natural variation

import { caesarShift, tryBase64Decode, anagramHints, analyzeNumericPattern } from './aiAnalystPrompt';

// ============ 250 ANALYST TEMPLATES ============
export const ANALYST_TEMPLATES: Record<string, string[]> = {
  classify: [
    "Questi indizi sembrano convergere su un tema comune.",
    "Potrei dividerli in due categorie principali: luogo e premio.",
    "Alcuni indizi parlano di costruzioni, altri di simboli.",
    "Qui noto riferimenti sia a elementi moderni che storici.",
    "Sembrano frammenti collegati da un filo logico sottile.",
    "Suggerisco di separarli in base al tempo: passato e presente.",
    "Un paio di questi indizi parlano chiaramente di movimento.",
    "Classificherei questo gruppo come 'visivo' e l'altro come 'concettuale'.",
    "Ci sono allusioni a colori e forme, vale la pena raggrupparle.",
    "Alcuni elementi puntano verso un contesto naturale, altri artificiale.",
    "Indizi geografici da un lato, indizi simbolici dall'altro.",
    "Separerei quelli che parlano di luce da quelli che parlano di materia.",
    "Questo insieme mi sembra raccontare una progressione temporale.",
    "Un indizio ha natura numerica, lo metterei a parte.",
    "Direi che due di questi parlano di prestigio, gli altri di località.",
    "Li dividerei in indizi certi e indizi ambigui.",
    "Questi sono di tipo diretto, mentre gli altri sono più metaforici.",
    "Qui c'è una categoria legata alla tecnologia.",
    "Separerei ciò che evoca forza da ciò che evoca bellezza.",
    "Mi sembra che alcuni parlino di un viaggio.",
    "Questi due parlano di tempo, non di spazio.",
    "C'è una linea di pensiero che lega tre di loro, il resto è dispersivo.",
    "Indizi descrittivi vs indizi cifrati: buona separazione.",
    "Un paio citano oggetti concreti, altri sensazioni.",
    "Due parlano di Italia, gli altri no.",
    "Classificazione tematica: arte, scienza, territorio.",
    "Separerei quelli con numeri da quelli senza.",
    "Un indizio pare un titolo, gli altri sono descrizioni.",
    "Uno solo è fuorviante: lo segnerei come 'anomalo'.",
    "Indizi generici e indizi raffinati: netta differenza.",
    "Questi due hanno in comune una figura geometrica.",
    "Qui c'è chiaro un contrasto: luce vs ombra.",
    "Separerei 'premio' da 'luogo' in questo blocco.",
    "Classificazione secondo livello di dettaglio: basso/medio/alto.",
    "Alcuni hanno tono poetico, altri tecnico.",
    "Questi tre parlano di grandezza, gli altri di precisione.",
    "Un paio evocano velocità.",
    "Ci sono indizi sensoriali e indizi logici.",
    "Separerei i simbolici dai diretti.",
    "Due hanno un linguaggio molto simile, segno che vanno insieme.",
    "Uno sembra uno slogan, gli altri no.",
    "Indizi urbanistici da una parte, naturali dall'altra.",
    "Questi tre parlano chiaramente di energia.",
    "Ci sono parole chiave ripetute, le raggrupperei.",
    "Separerei i dettagli visivi dai dettagli storici.",
    "Uno pare ironico, differente dagli altri.",
    "Tre parlano di eleganza, gli altri di forza.",
    "Li vedo divisi per tipologia: cifrati e narrativi.",
    "Classificherei un paio come 'trappole'.",
    "Direi che qui abbiamo un mix di premi e località."
  ],
  patterns: [
    "Intravedo un filo rosso che unisce almeno tre indizi.",
    "Questi due condividono una stessa parola chiave.",
    "Vedo una ripetizione di concetti legati alla luce.",
    "C'è un pattern numerico nascosto qui.",
    "Due indizi hanno la stessa struttura grammaticale.",
    "Sembrano variazioni sullo stesso tema.",
    "Noto una progressione temporale: inizio, sviluppo, fine.",
    "Più indizi parlano di altezza.",
    "Qui ricorre un colore specifico.",
    "Tre citano elementi metallici.",
    "Due parlano di rumore, gli altri di silenzio.",
    "Noto un'alternanza costante: positivo/negativo.",
    "C'è un parallelismo tra il primo e l'ultimo.",
    "Tre fanno riferimento a velocità.",
    "Un pattern di direzione: nord, sud, movimento.",
    "Qui tornano riferimenti al lusso.",
    "Più di uno menziona acqua in forme diverse.",
    "Gli indizi sembrano formare una sequenza.",
    "Alcuni evocano dualità: interno/esterno.",
    "Ci sono due sinonimi che non credo casuali.",
    "Un ritmo ternario emerge qui.",
    "Molti sembrano giocare con la simmetria.",
    "Questo ricorda uno schema codificato.",
    "Due hanno struttura domanda-risposta.",
    "Un pattern fonetico appare evidente.",
    "Pare ci sia una rima nascosta.",
    "Ci sono simboli ricorrenti: cerchio, quadrato.",
    "Una logica binaria si ripete.",
    "Noto ridondanza intenzionale.",
    "Gli indizi formano una spirale concettuale.",
    "Due appaiono come eco l'uno dell'altro.",
    "Un ciclo: inizio e ritorno sullo stesso punto.",
    "Gli indizi richiamano stagioni.",
    "Sembrano tre varianti dello stesso messaggio.",
    "Una simmetria perfetta: 2 e 4 sono equivalenti.",
    "Noto parallelismi narrativi.",
    "Ritrovo la stessa parola spezzata in due indizi.",
    "Gli indizi si rispondono tra loro.",
    "Formano un mosaico coerente.",
    "Sembrano tessere di puzzle.",
    "Un pattern musicale: ritmo implicito.",
    "Vedo legami tra suoni ripetuti.",
    "Gli indizi hanno struttura speculare.",
    "Due paiono anagrammi l'uno dell'altro.",
    "Un gioco di opposizioni si ripete.",
    "Pattern nascosto: prima lettera di ogni indizio.",
    "Una logica circolare emerge.",
    "Sembrano messaggi in codice collegati.",
    "Il tema della luce ritorna tre volte.",
    "Un filo conduttore: innovazione."
  ],
  decode: [
    "Proverei un semplice cifrario di Cesare.",
    "Potrebbe trattarsi di un anagramma.",
    "Forse i numeri sono ASCII.",
    "Questo ricorda un codice Base64.",
    "Il pattern sembra binario.",
    "Puoi provare a invertirne le lettere.",
    "Mi ricorda un codice Morse.",
    "Forse ogni numero è un mese.",
    "Un codice semplice: sostituzione.",
    "Penso a coordinate nascoste.",
    "Magari è un acronimo.",
    "Potrebbe essere un rebus.",
    "Forse vanno letti al contrario.",
    "Sembrano coordinate criptate.",
    "Un classico: ROT13.",
    "Può essere un codice telefonico.",
    "Ci vedo lettere romane.",
    "Potrebbe celare un nome noto.",
    "Forse è un palindromo.",
    "Ricorda un puzzle crittografico.",
    "Potresti dividerlo in coppie.",
    "Forse sono sillabe invertite.",
    "Magari è un acrostico.",
    "Questo pare un codice alfanumerico.",
    "Può essere una sostituzione monoalfabetica.",
    "Indizio numerico = cifrario banale.",
    "Prova con dizionario anagrammi.",
    "Magari nasconde parole in più lingue.",
    "Potrebbe essere una frase spezzata.",
    "Forse devi sommare i numeri.",
    "Sembrano coordinate con offset.",
    "Potrebbe essere codice QR.",
    "Forse parole tronche.",
    "Un linguaggio simbolico.",
    "Pare un rebus figurato.",
    "Può essere un codice di trasporto.",
    "Sembra una chiave numerica.",
    "Forse cifrario polibio.",
    "Codice gematria?",
    "Può essere fonetico.",
    "Pare crittografia basica.",
    "Pensa a traslitterazione.",
    "Un rebus fonetico.",
    "Può essere con sostituzione vocali.",
    "Forse una sequenza Fibonacci.",
    "Magari vanno sommati i caratteri.",
    "Pare stringa codificata.",
    "Codice musicale?",
    "Coordinate travestite da numeri."
  ],
  probability: [
    "Direi che la probabilità è incerta ma crescente.",
    "Al momento sei a uno stadio iniziale.",
    "Le chance migliorano con più indizi.",
    "Direi che il rischio di errore è alto.",
    "La probabilità non è quantificabile con precisione.",
    "In questa fase il margine d'errore è elevato.",
    "Ogni indizio aumenta leggermente le tue chance.",
    "La tua posizione è ancora fragile.",
    "Direi che hai poche certezze.",
    "Siamo in un territorio incerto.",
    "Più indizi = più probabilità.",
    "La fiducia cresce lentamente.",
    "Ti trovi al 30% del cammino.",
    "Ci sono variabili fuori controllo.",
    "Le probabilità migliorano di poco.",
    "Direi che resti sotto il 50%.",
    "La tua traiettoria è promettente.",
    "Il rischio è ancora notevole.",
    "Sei sulla strada giusta, ma incompleta.",
    "Ogni connessione aumenta la tua forza.",
    "La probabilità resta bassa.",
    "Hai raggiunto un punto intermedio.",
    "La stima è positiva, ma prudente.",
    "Sei in zona di rischio medio.",
    "Ogni errore pesa molto ora.",
    "La probabilità cresce con logica cumulativa.",
    "Le tue chance dipendono dai prossimi passi.",
    "Valuto rischio medio-alto.",
    "Direi incertezza dominante.",
    "La fiducia sale, ma lentamente.",
    "Resti in zona neutra.",
    "Le probabilità sono migliorate rispetto a prima.",
    "Un passo avanti, ma non ancora decisivo.",
    "Ancora presto per stimare seriamente.",
    "Direi che il cammino resta lungo.",
    "La probabilità si alza col tempo.",
    "Hai basi fragili ma promettenti.",
    "La tua posizione si è rafforzata.",
    "Ora la stima è più ottimista.",
    "Hai costruito credibilità investigativa.",
    "Il rischio resta alto.",
    "Una chance su tre.",
    "Probabilità attorno al 40%.",
    "Ti avvicini alla soglia critica.",
    "Ancora incertezza diffusa.",
    "Direi che sei sulla giusta traiettoria.",
    "La probabilità cresce, resta vigile.",
    "Hai migliorato le tue possibilità.",
    "Valutazione prudente: medio-bassa.",
    "Sei in crescita costante."
  ],
  mentor: [
    "Non mollare, sei sulla strada giusta.",
    "Ogni indizio è un passo verso la verità.",
    "La pazienza è la tua arma segreta.",
    "Non avere fretta: ogni dettaglio conta.",
    "Il gioco premia chi sa osservare.",
    "Continua a cercare, anche nei dettagli minimi.",
    "La tua dedizione ti porterà lontano.",
    "Non sottovalutare mai un piccolo segno.",
    "Ogni indizio ha un valore nascosto.",
    "Il percorso è tanto importante quanto la meta.",
    "Non lasciarti ingannare dai falsi segnali.",
    "Sii freddo come un analista.",
    "Ma anche curioso come un esploratore.",
    "Non smettere di collegare i punti.",
    "Ricorda: l'apparenza inganna.",
    "Ogni errore è un passo di apprendimento.",
    "Mantieni la mente aperta.",
    "Il tuo intuito è parte della strategia.",
    "Non ti arrendere ai primi ostacoli.",
    "Ogni dettaglio può essere chiave.",
    "Sii metodico, ma anche creativo.",
    "Le risposte arrivano a chi sa attendere.",
    "La tua tenacia farà la differenza.",
    "Non lasciarti distrarre.",
    "Segui la logica, ma ascolta anche l'istinto.",
    "Cerca l'armonia nei dettagli.",
    "Non abbandonare la pista.",
    "Tieni alta la concentrazione.",
    "Ogni giorno può portare un indizio nuovo.",
    "La calma è la tua forza.",
    "Sii pronto a cambiare prospettiva.",
    "Il viaggio vale più della destinazione.",
    "La caccia è parte della vittoria.",
    "Non dimenticare di osservare tutto.",
    "Sii costante, ma anche elastico.",
    "Il mistero si risolve un passo alla volta.",
    "Ogni indizio è un tassello del mosaico.",
    "Non lasciare nulla al caso.",
    "Sii vigile e attento.",
    "Ricorda: il tempo è un alleato.",
    "La determinazione è la chiave.",
    "Non dubitare del tuo percorso.",
    "La forza è nella pazienza.",
    "Segui la traccia con fiducia.",
    "Ogni segnale è prezioso.",
    "Non smettere di interrogare i dettagli.",
    "Mantieni la mente affilata.",
    "La vittoria è per chi persevera.",
    "Il mistero si svela a chi insiste.",
    "Tu puoi farcela."
  ]
};

export type AnalystMode = 'analyze' | 'classify' | 'decode' | 'assess' | 'guide';

interface Clue {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

interface AnalystContext {
  mode: AnalystMode;
  clues: Clue[];
  userText: string;
  userId?: string;
  timestamp: number;
}

// Natural language helpers
const HEDGES = ['sembra', 'direi', 'potrebbe', 'probabilmente', 'pare'];
const TRANSITIONS = ['intanto', 'nel frattempo', 'in pratica', 'ora', 'quindi'];
const CLOSINGS = [
  'Ci siamo: un passo alla volta, e il quadro compare.',
  'Ottimo ritmo. Torna ai clue di ieri: c\'è un collegamento sottile.',
  'Se hai dubbi, scegli la pista più coerente col tema ricorrente.',
  'Non forzo la risposta: ti tengo centrato sulla logica giusta.',
  'Buona caccia — il dettaglio fa la differenza.',
  'Procediamo con calma: il metodo batte la fretta.'
];

const MISSION_INFO = [
  `M1SSION è una caccia al tesoro reale: raccogli indizi, collega i puntini e mira al colpo finale. 
   Ogni BUZZ sblocca frammenti di storia: io posso aiutarti ad analizzarli, mai a svelarli. 
   Parti dai clue recenti e tieni d'occhio la mappa: il ritmo è parte del gioco.`,
  
  `In breve: M1SSION è un percorso di scoperta. Indizi sparsi, segnali da intercettare, 
   decisioni tattiche. Io resto al tuo fianco per ordinare le informazioni e darti traiettorie, 
   senza spoiler. Quando sei pronto, Final Shot ti aspetta.`,
  
  `Pensa a M1SSION come a un'indagine seriale: ogni indizio apre una pista. 
   Il mio ruolo? Farti ragionare meglio: classifico, trovo pattern, decodifico l'essenziale. 
   Niente soluzioni pronte — solo vantaggi leali. Buona caccia.`
];

// Seed-based selection
const selectVariant = <T>(array: T[], seed: number): T => {
  return array[seed % array.length];
};

const hashSeed = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
};

// Guard rails
const checkSpoilerRequest = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  const spoilerKeywords = [
    'dov\'è', 'dove si trova', 'coordinate', 'dimmi dove',
    'svelami', 'dammi la risposta', 'qual è il luogo',
    'indirizzo esatto', 'svela', 'risolvimi', 'location',
    'dammi le coordinate', 'qual è l\'indirizzo'
  ];
  
  return spoilerKeywords.some(keyword => lowerText.includes(keyword));
};

// Humanize output
const humanize = (text: string, seed: number): string => {
  const hedge = selectVariant(HEDGES, seed);
  const transition = selectVariant(TRANSITIONS, seed + 1);
  const closing = selectVariant(CLOSINGS, seed + 2);
  
  // Add natural pauses and transitions
  let output = text.replace(/\. /g, () => Math.random() > 0.7 ? '. — ' : '. ');
  
  // Add hedge to first sentence occasionally
  if (seed % 3 === 0) {
    output = output.replace(/^([A-Z][^.]+)/, `${hedge.charAt(0).toUpperCase() + hedge.slice(1)}, $1`);
  }
  
  // Add transition mid-text
  if (output.split('. ').length > 2 && seed % 2 === 0) {
    const sentences = output.split('. ');
    const midPoint = Math.floor(sentences.length / 2);
    sentences[midPoint] = `${transition.charAt(0).toUpperCase() + transition.slice(1)}, ${sentences[midPoint]}`;
    output = sentences.join('. ');
  }
  
  return `${output}\n\n${closing}`;
};

export const generateReply = (context: AnalystContext): { content: string } => {
  const { mode, clues, userText, userId, timestamp } = context;
  const seed = hashSeed((userId || 'anon') + timestamp.toString());
  
  // Special intents
  const lowerText = userText.toLowerCase();
  
  // "Parlami di M1SSION"
  if (lowerText.includes('parlami di m1ssion') || lowerText.includes('cos\'è m1ssion')) {
    return { content: selectVariant(MISSION_INFO, seed) };
  }
  
  // "Quante probabilità di vincere ho?"
  if (lowerText.includes('probabilità di vincere') || lowerText.includes('chance di vincere')) {
    const probability = clues.length === 0 ? 'Bassa' 
      : clues.length < 3 ? 'In crescita' 
      : clues.length < 6 ? 'Promettente' 
      : 'Solida';
    
    const advice = clues.length < 3 
      ? 'Raccogli altri 2-3 indizi chiave per aumentare la confidenza.'
      : 'Hai una base buona: ora cerca i collegamenti tra i temi ricorrenti.';
    
    return {
      content: humanize(
        `Con ${clues.length} indizi, la tua probabilità è **${probability}**. ${advice}`,
        seed
      )
    };
  }
  
  // Guard against spoiler requests
  if (checkSpoilerRequest(userText)) {
    const guardRails = [
      'Non posso rivelare luogo o coordinate, ma posso stringere le ipotesi: raccogli ancora 1-2 indizi su pattern ricorrenti e rianalizziamo. Ti va?',
      'Il mio compito è guidarti, non svelarti la soluzione. Però posso dirti che c\'è un tema dominante nei tuoi ultimi clue — vuoi che te lo evidenzi?',
      'Niente spoiler: è parte del gioco. Ma se mi dici quale area ti sembra più coerente, posso confermare se sei sulla strada giusta.'
    ];
    return { content: selectVariant(guardRails, seed) };
  }
  
  // No clues scenario
  if (clues.length === 0) {
    const noCluesMessages = [
      'Al momento non hai indizi nel database. Recuperane almeno 3-5 per permettermi un\'analisi significativa — usa BUZZ per sbloccare nuovi frammenti.',
      'Nessun indizio disponibile: ti serve materiale per lavorare. Vai su BUZZ, raccogli qualche clue fresco, e torniamo qui per analizzarli insieme.',
      'Zero indizi = zero analisi. Sblocca 3-4 frammenti con BUZZ o Map, poi torno operativo. Nel frattempo, tieni pronta la mente critica.'
    ];
    return { content: selectVariant(noCluesMessages, seed) };
  }

  // Mode-specific responses with humanization
  let response: string;
  
  switch (mode) {
    case 'classify':
      response = classifyClues(clues, seed);
      break;
    case 'decode':
      response = decodeClues(clues, userText, seed);
      break;
    case 'assess':
      response = assessProbability(clues, seed);
      break;
    case 'guide':
      response = provideMentorship(clues, seed);
      break;
    case 'analyze':
    default:
      response = analyzeClues(clues, seed);
  }
  
  return { content: humanize(response, seed) };
};

// Analysis functions with templates
const analyzeClues = (clues: Clue[], seed: number): string => {
  const templateVariants = ANALYST_TEMPLATES.patterns;
  if (clues.length === 0) return "Non ci sono abbastanza indizi per un'analisi significativa.";
  
  // Use seed to pick variant from 250 templates
  const templateResponse = selectVariant(templateVariants, seed);
  
  // Add contextual info
  const clueCount = clues.length;
  const recentClue = clues[Math.min(seed % clues.length, clues.length - 1)];
  
  return `${templateResponse} Ho esaminato i tuoi ${clueCount} indizi: il pattern più interessante coinvolge "${recentClue?.title}".`;
};

const classifyClues = (clues: Clue[], seed: number): string => {
  const templateVariants = ANALYST_TEMPLATES.classify;
  if (clues.length === 0) return "Non ci sono abbastanza indizi per una classificazione.";
  
  // Use seed to pick variant from 250 templates
  return selectVariant(templateVariants, seed);
};

const decodeClues = (clues: Clue[], userText: string, seed: number): string => {
  const templateVariants = ANALYST_TEMPLATES.decode;
  if (clues.length === 0) return "Non ci sono indizi da decodificare al momento.";
  
  // Use seed to pick variant from 250 templates
  return selectVariant(templateVariants, seed);
};

const assessProbability = (clues: Clue[], seed: number): string => {
  const templateVariants = ANALYST_TEMPLATES.probability;
  
  // Use seed to pick variant from 250 templates
  const baseResponse = selectVariant(templateVariants, seed);
  
  // Add specific probability assessment
  const confidence = Math.min(90, 30 + clues.length * 10);
  return `${baseResponse} Con ${clues.length} indizi, valuto la tua confidenza al ${confidence}%.`;
};

const provideMentorship = (clues: Clue[], seed: number): string => {
  const templateVariants = ANALYST_TEMPLATES.mentor;
  
  // Use seed to pick variant from 250 templates
  return selectVariant(templateVariants, seed);
};
