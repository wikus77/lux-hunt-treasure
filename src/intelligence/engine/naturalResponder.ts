// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Natural Response Engine - Varied, human-like responses with agent context

import type { AgentContext } from '../context/aiContext';
import { FAQ_IT } from './faq.it';

export type Intent = 
  | 'describe_mission'
  | 'probability_check'
  | 'classify'
  | 'patterns'
  | 'decode'
  | 'mentor'
  | 'faq';

interface ResponseContext {
  prompt: string;
  intent: Intent;
  context: AgentContext;
  clues: any[];
  seed: number;
}

// Hedging phrases for natural variation
const HEDGES = [
  'Sembra', 'Direi', 'Potrebbe', 'Probabilmente', 'Pare',
  'Mi sembra', 'Credo', 'Ritengo', 'Secondo me', 'Ipotizzo'
];

// Discourse markers for natural flow
const DISCOURSE_MARKERS = [
  'Intanto', 'Nel frattempo', 'In pratica', 'Ora', 'Quindi',
  'Dunque', 'Allora', 'In sintesi', 'In breve', 'Ecco'
];

// Motivational closers
const CLOSERS = [
  'Ci siamo: un passo alla volta, e il quadro compare.',
  'Ottimo ritmo. Torna agli indizi di ieri: c\'è un collegamento sottile.',
  'Se hai dubbi, scegli la pista più coerente col tema ricorrente.',
  'Non forzo la risposta: ti tengo centrato sulla logica giusta.',
  'Buona caccia — il dettaglio fa la differenza.'
];

/**
 * Generate natural, varied response
 */
export function generateNaturalResponse(rc: ResponseContext): string {
  const { intent, context, clues, seed } = rc;

  // Route to appropriate handler
  switch (intent) {
    case 'describe_mission':
      return handleDescribeMission(context, seed);
    case 'probability_check':
      return handleProbabilityCheck(context, clues, seed);
    case 'classify':
      return handleClassify(clues, seed);
    case 'patterns':
      return handlePatterns(clues, seed);
    case 'decode':
      return handleDecode(rc.prompt, seed);
    case 'mentor':
      return handleMentor(context, clues, seed);
    case 'faq':
      return handleFAQ(rc.prompt, context, seed);
    default:
      return handleMentor(context, clues, seed);
  }
}

/**
 * Detect intent from user prompt
 */
export function detectIntent(prompt: string): Intent {
  const lower = prompt.toLowerCase();
  
  // FAQ matching
  for (const question of Object.keys(FAQ_IT)) {
    if (lower.includes(question.toLowerCase().slice(0, 10))) {
      return 'faq';
    }
  }
  
  // Intent patterns
  if (lower.includes('parlami di m1ssion') || lower.includes("cos'è m1ssion")) {
    return 'describe_mission';
  }
  if (lower.includes('probabilità') || lower.includes('chance') || lower.includes('vincere')) {
    return 'probability_check';
  }
  if (lower.includes('classifica') || lower.includes('organizza') || lower.includes('categor')) {
    return 'classify';
  }
  if (lower.includes('pattern') || lower.includes('collegament') || lower.includes('correlaz')) {
    return 'patterns';
  }
  if (lower.includes('decodif') || lower.includes('anagramma') || lower.includes('base64')) {
    return 'decode';
  }
  
  return 'mentor';
}

/**
 * Handle "Describe M1SSION" intent
 */
function handleDescribeMission(context: AgentContext, seed: number): string {
  const variants = [
    `M1SSION è una caccia investigativa moderna, {{agentCode}}. Raccogli indizi con BUZZ, analizzali qui nell'Intel, e quando il quadro è chiaro: Final Shot. Io ti aiuto a tenere la rotta, senza spoiler.`,
    `È un percorso tattico: scopri con BUZZ, ragioni nell'Intelligence, colpisci con Final Shot. Niente scorciatoie, solo metodo. Tu sei l'operativo, io sono il supporto analitico.`,
    `Gioco investigativo progressivo: indizi sparsi, pattern da trovare, convergenze da costruire. Il Final Shot è la conclusione — ma prima serve lavoro pulito.`
  ];
  
  let response = pickRandom(variants, seed);
  response = replacePlaceholders(response, context);
  return addVariety(response, seed);
}

/**
 * Handle probability check
 */
function handleProbabilityCheck(context: AgentContext, clues: any[], seed: number): string {
  const count = context.cluesCount;
  
  if (count < 3) {
    const variants = [
      `Con {{cluesCount}} indizi la base è ancora fragile. Raccogline altri 2-3, poi valutiamo con più solidità.`,
      `Probabilità? Prematura: servono almeno 3-5 indizi coerenti. Continua con BUZZ e torna qui.`,
      `Pochi dati = alta incertezza. Porta il contatore a 5 e ne riparliamo.`
    ];
    let response = pickRandom(variants, seed);
    return replacePlaceholders(response, context);
  }
  
  if (count < 8) {
    const variants = [
      `Con {{cluesCount}} indizi siamo in zona intermedia. Se convergono, le tue chance salgono. Cerca pattern ripetuti.`,
      `Base discreta: {{cluesCount}} frammenti. Ora conta la coerenza. Classifica e trova i collegamenti.`,
      `Probabilità in crescita: hai {{cluesCount}} indizi. Ora devi farli parlare insieme.`
    ];
    let response = pickRandom(variants, seed);
    return replacePlaceholders(response, context);
  }
  
  const variants = [
    `Con {{cluesCount}} indizi hai una mappa solida. Se tre linee convergono sullo stesso punto, le tue probabilità sono ottime.`,
    `Dataset ricco: {{cluesCount}} frammenti. La probabilità dipende dalla triangolazione. Cerca l'intersezione.`,
    `Hai materiale sufficiente. Ora serve precisione: identifica i 3-4 indizi più forti e costruisci attorno a quelli.`
  ];
  let response = pickRandom(variants, seed);
  return replacePlaceholders(response, context);
}

/**
 * Handle classify intent
 */
function handleClassify(clues: any[], seed: number): string {
  if (clues.length === 0) {
    return "Nessun indizio da classificare. Usa BUZZ per raccoglierne alcuni, poi torna qui.";
  }
  
  const variants = [
    `Posso separarli in categorie: luogo/premio, temporali/spaziali, diretti/simbolici. Dammi dettagli e procedo.`,
    `Classificazione: tagghi per tema dominante. Indica quali indizi vuoi ordinare e ti organizzo il quadro.`,
    `Li dividerò per tipo: geo, narrativo, numerico, simbolico. Servono i testi per partire.`
  ];
  
  return pickRandom(variants, seed);
}

/**
 * Handle patterns intent
 */
function handlePatterns(clues: any[], seed: number): string {
  if (clues.length < 3) {
    return "Serve un minimo di 3 indizi per trovare pattern significativi. Raccogline altri e riprova.";
  }
  
  const variants = [
    `Cerco ricorrenze: parole chiave ripetute, date/numeri simili, simboli comuni. Dammi i testi.`,
    `Pattern significa: quando 3+ indizi puntano alla stessa direzione. Li ho già? Verifico.`,
    `Analizzo convergenze: se due indizi indipendenti si richiamano, è un segnale forte.`
  ];
  
  return pickRandom(variants, seed);
}

/**
 * Handle decode intent
 */
function handleDecode(prompt: string, seed: number): string {
  const variants = [
    `Dammi il frammento da decodificare: provo Base64, Caesar, anagrammi e ASCII. Niente spoiler garantito.`,
    `Posso tentare decoder base: se è cifrato semplice, ti mostro la lettura. Incolla il testo.`,
    `Decodifica prudente: ti indico ipotesi plausibili, non certezze. Passamelo.`
  ];
  
  return pickRandom(variants, seed);
}

/**
 * Handle mentor/motivation intent
 */
function handleMentor(context: AgentContext, clues: any[], seed: number): string {
  if (context.cluesCount === 0) {
    const variants = [
      `Iniziamo dalle basi, {{agentCode}}: usa BUZZ per raccogliere i primi indizi. Poi torno operativo qui.`,
      `Primo step: colleziona 3-5 frammenti con BUZZ. Dopo analizziamo insieme e costruiamo la mappa.`,
      `Nessun indizio nel sistema. Vai su BUZZ, raccogli qualche segnale, e ripassa.`
    ];
    let response = pickRandom(variants, seed);
    return replacePlaceholders(response, context);
  }
  
  const variants = [
    `Buon lavoro finora, {{agentCode}}. Con {{cluesCount}} indizi sei in movimento. Cerca pattern e convergenze.`,
    `Continua così: {{cluesCount}} frammenti raccolti. Ora serve metodo: classifica, pattern, poi probabilità.`,
    `Disciplina costante: hai {{cluesCount}} indizi. Ogni nuovo BUZZ può fare la differenza.`
  ];
  let response = pickRandom(variants, seed);
  return replacePlaceholders(response, context);
}

/**
 * Handle FAQ lookup
 */
function handleFAQ(prompt: string, context: AgentContext, seed: number): string {
  const lower = prompt.toLowerCase();
  
  for (const [question, answers] of Object.entries(FAQ_IT)) {
    if (lower.includes(question.toLowerCase().slice(0, 10))) {
      let answer = pickRandom(answers, seed);
      return replacePlaceholders(answer, context);
    }
  }
  
  return handleMentor(context, [], seed);
}

/**
 * Pick random item based on seed
 */
function pickRandom<T>(array: T[], seed: number): T {
  return array[Math.abs(seed) % array.length];
}

/**
 * Replace placeholders with context values
 */
function replacePlaceholders(text: string, context: AgentContext): string {
  return text
    .replace(/\{\{agentCode\}\}/g, context.agentCode)
    .replace(/\{\{cluesCount\}\}/g, context.cluesCount.toString())
    .replace(/\{\{displayName\}\}/g, context.displayName);
}

/**
 * Add natural variety with hedges, markers, closers
 */
function addVariety(text: string, seed: number): string {
  let output = text;
  
  // 33% chance: add hedge
  if (seed % 3 === 0) {
    const hedge = pickRandom(HEDGES, seed);
    output = `${hedge}, ${output.charAt(0).toLowerCase()}${output.slice(1)}`;
  }
  
  // 50% chance: add discourse marker mid-text
  const sentences = output.split('. ');
  if (sentences.length > 2 && seed % 2 === 0) {
    const midPoint = Math.floor(sentences.length / 2);
    const marker = pickRandom(DISCOURSE_MARKERS, seed + 1);
    sentences[midPoint] = `${marker}, ${sentences[midPoint]}`;
    output = sentences.join('. ');
  }
  
  // Add closer
  const closer = pickRandom(CLOSERS, seed + 2);
  output = `${output}\n\n${closer}`;
  
  return output;
}
