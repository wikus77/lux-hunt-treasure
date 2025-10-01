// © 2025 Joseph MULÉ – M1SSION™
// Intelligence Analyst Engine - Deterministic responses with natural variation

import { caesarShift, tryBase64Decode, anagramHints, analyzeNumericPattern } from './aiAnalystPrompt';
import { ANALYST_TEMPLATES } from './analystTemplates';

// Re-export templates for backwards compatibility
export { ANALYST_TEMPLATES } from './analystTemplates';

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

// NEW ENGINE INTEGRATION
import { analystReply as newEngineReply } from './engine';

export const generateReply = async (context: AnalystContext): Promise<{ content: string }> => {
  const { mode, clues, userText, userId, timestamp } = context;
  
  // Use new engine with explicit mode mapping
  const modeMap: Record<AnalystMode, any> = {
    'analyze': 'patterns',
    'classify': 'classify',
    'decode': 'decode',
    'assess': 'probability',
    'guide': 'mentor'
  };
  
  try {
    const content = await newEngineReply(userText, modeMap[mode]);
    return { content };
  } catch (error) {
    console.error('New engine failed, falling back to legacy:', error);
    
    // Fallback to legacy implementation
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
  }
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
