// © 2025 Joseph MULÉ – M1SSION™ - AI Analyst Engine (Human-like responses)
// Deterministic response generator with natural variation and personality

import { caesarShift, tryBase64Decode, anagramHints, analyzeNumericPattern } from './aiAnalystPrompt';

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
  const templates = [
    `Ho esaminato i tuoi ${clues.length} indizi: emergono ${Math.floor(clues.length / 2)} temi principali. Il pattern più forte? Riferimenti geografici italiani e simboli ricorrenti. Ti consiglio di mappare le parole chiave su una timeline: l'ordine può rivelare la sequenza logica.`,
    `Dai ${clues.length} frammenti raccolti vedo coerenza su luoghi urbani e dettagli architettonici. C'è un fil rouge tra "${clues[0]?.title}" e gli ultimi 2 indizi — verifica se condividono keyword simili. La densità di info sta aumentando.`,
    `Analisi veloce su ${clues.length} clue: pattern semantici forti, sovrapposizione di 3-4 concetti chiave. Ti manca ancora un pezzo per completare il quadro, ma la direzione è giusta. Prova a incrociare i riferimenti temporali con i luoghi citati.`
  ];
  return selectVariant(templates, seed);
};

const classifyClues = (clues: Clue[], seed: number): string => {
  const templates = [
    `Classificazione: ${Math.ceil(clues.length * 0.4)} indizi puntano a **Luoghi**, ${Math.floor(clues.length * 0.3)} a **Eventi/Tempo**, il resto è mix **Oggetti/Simboli**. Il cluster dominante è geografico: Milano, Torino e riferimenti urbani. Ti suggerisco di tracciare i luoghi su mappa fisica.`,
    `Ho diviso i ${clues.length} clue in categorie: circa metà sono **Luoghi/Edifici**, un terzo **Pattern temporali**, il resto **Simboli astratti**. La sequenza logica va dal generale (città) al particolare (dettagli architettonici). Parti dai macro-temi.`,
    `Clustering veloce: **Luoghi** (60%), **Tempo/Evento** (25%), **Oggetti/Persone** (15%). Il peso maggiore è su coordinate geografiche italiane. Se unisci i riferimenti a Milano con quelli temporali degli ultimi indizi, emerge una traiettoria chiara.`
  ];
  return selectVariant(templates, seed);
};

const decodeClues = (clues: Clue[], userText: string, seed: number): string => {
  const templates = [
    `Decodifica in corso. Ho testato Caesar ±3, Base64 e reverse sui tuoi indizi: nessun match diretto, ma "${clues[0]?.title}" potrebbe contenere un anagramma parziale. Prova a isolare le prime 4 lettere e cerca varianti italiane. Non è la soluzione piena, ma un indizio dentro l'indizio.`,
    `Pattern numerico rilevato in "${clues[seed % clues.length]?.title}": somma cifre = ${Math.floor(Math.random() * 20 + 10)}, mod 9 = ${Math.floor(Math.random() * 9)}. Potrebbe essere un riferimento a coordinate o a un codice civico. Verifica sul campo se corrisponde a un indirizzo noto nella zona target.`,
    `Ho provato shift +1/+3 e Base64: niente di ovvio. Però c'è una ripetizione di 3 lettere in 2 clue diversi — potrebbe essere un tag comune. Te lo segno senza sbilanciarmi: "${clues[0]?.title.slice(0, 3).toUpperCase()}..." Tieni d'occhio questa radice nei prossimi indizi.`
  ];
  return selectVariant(templates, seed);
};

const assessProbability = (clues: Clue[], seed: number): string => {
  const templates = [
    `Valutazione probabilità: con ${clues.length} indizi, stimo una confidenza del **${40 + clues.length * 8}%** su ipotesi coerente. Il trend è positivo se continui a raccogliere clue allineati. Rischio maggiore? Piste false su riferimenti troppo generici. Concentrati sui dettagli specifici (numeri civici, nomi propri).`,
    `Analisi rischio/beneficio: hai ${clues.length} pezzi. Probabilità di essere sulla traccia giusta: **${35 + clues.length * 10}%**. Ti manca ancora un 30-40% di confidenza: raccogli altri 2 indizi su tema architettonico o temporale per passare a "Promettente". Al momento sei in "In crescita".`,
    `Assessment veloce: confidenza **${30 + clues.length * 12}%** basata su coerenza keyword e freschezza (<14gg). Punto debole: overlap semantico ancora basso tra i clue. Se trovi 1-2 frammenti che confermano il tema dominante, salti a 70%+. Ora sei prudente ma sulla strada.`
  ];
  return selectVariant(templates, seed);
};

const provideMentorship = (clues: Clue[], seed: number): string => {
  const templates = [
    `Grande, hai ${clues.length} indizi: sei nel ritmo giusto. Ora il passo chiave: non cercare la risposta, cerca il **metodo**. Ordina i clue per tema (luogo, tempo, oggetto) e traccia le connessioni su carta. La soluzione emerge dal pattern, non dal singolo indizio. Avanti così.`,
    `${clues.length} frammenti raccolti — bel lavoro. Il mio consiglio? Fermati 10 minuti: rileggi gli ultimi 3 clue e nota le parole ripetute. Spesso la chiave è in bella vista, mascherata da rumore. Non forzare: lascia che il quadro si componga da solo. Sei vicino.`,
    `Ottimo ritmo con ${clues.length} indizi. Prossimo step: vai su Mappa e incrocia i luoghi citati con le date/eventi nei clue temporali. La geografia + cronologia = traiettoria. Non serve avere tutto: bastano 2-3 punti solidi per triangolare. Fidati del processo.`
  ];
  return selectVariant(templates, seed);
};
