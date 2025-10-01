// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Analyst Engine V2 - Humanized, contextual, anti-spoiler

import { FAQ_IT } from '@/intelligence/engine/faq.it';
import type { AgentContextData } from '../context/agentContext';
import type { ClueItem } from '../context/realtimeClues';

export type Intent = 
  | 'describe_mission'
  | 'probability_check'
  | 'classify'
  | 'patterns'
  | 'decode'
  | 'mentor'
  | 'faq'
  | 'identity'
  | 'unknown';

// Natural language components
const OPENERS = [
  'Ok',
  'Ricevuto',
  'Perfetto',
  'Capito',
  'Bene',
  'Chiaro',
  'Vediamo'
];

const HEDGES = [
  'probabilmente',
  'è plausibile che',
  'sembra che',
  'potrebbe essere',
  'in genere',
  'di solito'
];

const TRANSITIONS = [
  'Ora',
  'Quindi',
  'Allora',
  'Intanto',
  'A questo punto',
  'Dunque'
];

const CLOSERS = [
  'Vuoi che ordini gli ultimi indizi?',
  'Proviamo una decodifica veloce?',
  'Ti serve altro?',
  'Continuiamo?',
  "Qualcos'altro?"
];

// Intent detection
export function routeIntent(input: string): Intent {
  const lower = input.toLowerCase();
  
  if (/\b(missione?|m1ssion|cos[' ]è|spiegami)\b/i.test(lower)) {
    return 'describe_mission';
  }
  if (/\b(chi sono|agente|codice|identifico|profilo)\b/i.test(lower)) {
    return 'identity';
  }
  if (/\b(probabilit[aà]|chance|possibilit[aà]|vincere)\b/i.test(lower)) {
    return 'probability_check';
  }
  if (/\b(classifica|organizza|ordina|categori[ez])\b/i.test(lower)) {
    return 'classify';
  }
  if (/\b(pattern|ricorren[zti]|ripet[eo]|sequenz)\b/i.test(lower)) {
    return 'patterns';
  }
  if (/\b(decod|decifrare?|interpretare?|base64|caesar)\b/i.test(lower)) {
    return 'decode';
  }
  if (/\b(mentore?|strategia|consigli?|aiut)\b/i.test(lower)) {
    return 'mentor';
  }
  
  // Check FAQ match
  for (const question of Object.keys(FAQ_IT)) {
    if (lower.includes(question.toLowerCase().slice(0, 10))) {
      return 'faq';
    }
  }
  
  return 'unknown';
}

// Anti-spoiler guardrails
function hasSpoilerRisk(input: string): boolean {
  const forbidden = [
    /\bsoluzione\b/i,
    /\bcoordinate finali?\b/i,
    /\brisposta esatta\b/i,
    /\bpremi?o\b/i,
    /\bdove.{0,10}(trovare|è|si trova)/i
  ];
  
  return forbidden.some(pattern => pattern.test(input));
}

// Humanizer
function pickRandom<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Null-safe string helper
function safeStr(v: unknown, fallback = ''): string {
  return (typeof v === 'string' ? v : fallback);
}

function nonEmpty(v: string | undefined, fallback: string): string {
  const s = safeStr(v, '').trim();
  return s.length ? s : fallback;
}

function composeNaturalReply(base: string | undefined, seed: number, context: AgentContextData): string {
  // © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
  // Null safety guardrails
  const template = nonEmpty(base, 'Ricevuto. Prova a essere più specifico: posso classificare indizi, cercare pattern, decodificare frammenti o stimare probabilità.');
  const agent = nonEmpty(context.agentCode, 'Agente');
  
  const opener = pickRandom(OPENERS, seed);
  const closer = pickRandom(CLOSERS, seed + 1);
  
  // Add hedge occasionally
  const hedge = seed % 3 === 0 ? `${pickRandom(HEDGES, seed + 2)}, ` : '';
  
  // Interpolate {{agentCode}} and {{cluesCount}} with safe replace
  let reply = template;
  try {
    reply = reply
      .replace(/\{\{agentCode\}\}/g, agent)
      .replace(/\{\{cluesCount\}\}/g, String(context.cluesCount || 0));
  } catch (err) {
    console.error('[composeNaturalReply] Replace error:', err);
    reply = template;
  }
  
  return `${opener}, ${agent}. ${hedge}${reply} ${closer}`;
}

// Classification
function classifyClues(clues: ClueItem[]): string {
  if (clues.length === 0) {
    return 'Non ho indizi da classificare. Usa BUZZ per iniziare a raccogliere segnali.';
  }
  
  const categories: Record<string, string[]> = {
    luoghi: [],
    storia: [],
    tech: [],
    meta: []
  };
  
  clues.forEach(clue => {
    const desc = (clue.title + ' ' + clue.description).toLowerCase();
    if (/\b(via|piazza|città|luogo|strada|coordinate)\b/.test(desc)) {
      categories.luoghi.push(clue.title);
    } else if (/\b(storica?|passato|secolo|epoca|antica?)\b/.test(desc)) {
      categories.storia.push(clue.title);
    } else if (/\b(codice|tecnica?|digital|crypto|algoritmo)\b/.test(desc)) {
      categories.tech.push(clue.title);
    } else {
      categories.meta.push(clue.title);
    }
  });
  
  const parts: string[] = [];
  if (categories.luoghi.length) parts.push(`Luoghi: ${categories.luoghi.slice(0, 3).join(', ')}`);
  if (categories.storia.length) parts.push(`Storia: ${categories.storia.slice(0, 3).join(', ')}`);
  if (categories.tech.length) parts.push(`Tech: ${categories.tech.slice(0, 3).join(', ')}`);
  
  return parts.length 
    ? `Ho classificato ${clues.length} indizi: ${parts.join('; ')}.`
    : 'Indizi presenti ma non ancora categorizzabili. Serve più contesto.';
}

// Pattern detection
function findPatterns(clues: ClueItem[]): string {
  if (clues.length < 3) {
    return 'Servono almeno 3 indizi per cercare pattern significativi.';
  }
  
  const keywords: Record<string, number> = {};
  
  clues.forEach(clue => {
    const words = (clue.title + ' ' + clue.description)
      .toLowerCase()
      .split(/\W+/)
      .filter(w => w.length > 4);
    
    words.forEach(word => {
      keywords[word] = (keywords[word] || 0) + 1;
    });
  });
  
  const recurring = Object.entries(keywords)
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  
  if (recurring.length === 0) {
    return 'Nessun pattern evidente. Gli indizi sono ancora sparsi.';
  }
  
  const patternList = recurring.map(([word, count]) => `"${word}" (${count}×)`).join(', ');
  return `Pattern rilevati: ${patternList}. Queste ricorrenze potrebbero indicare una pista comune.`;
}

// Basic decoding
function attemptDecode(text: string): string {
  // Caesar shift ±3
  const caesar = (str: string, shift: number): string => {
    return str.replace(/[a-zA-Z]/g, char => {
      const base = char <= 'Z' ? 65 : 97;
      return String.fromCharCode(((char.charCodeAt(0) - base + shift + 26) % 26) + base);
    });
  };
  
  const decoded: string[] = [];
  
  // Try Caesar +3
  const caesar3 = caesar(text, 3);
  if (caesar3 !== text) decoded.push(`Caesar+3: "${caesar3}"`);
  
  // Try Base64
  try {
    const b64 = atob(text);
    if (b64.length > 0) decoded.push(`Base64: "${b64}"`);
  } catch {
    // Not base64
  }
  
  if (decoded.length === 0) {
    return 'Non riesco a decodificare automaticamente. Se è un cifrario complesso, serve analisi manuale.';
  }
  
  return `Tentativi: ${decoded.join('; ')}. Nessuna coordinata finale rivelata.`;
}

// Probability assessment
function assessProbability(clues: ClueItem[]): string {
  if (clues.length < 3) {
    return 'Con meno di 3 indizi, la probabilità è bassa. Serve più materiale.';
  }
  
  if (clues.length < 5) {
    return 'Con 3-4 indizi, siamo su una base media. Cerca coerenza prima di agire.';
  }
  
  return 'Con 5+ indizi, la probabilità sale se convergono. Verifica la coerenza: se tre segnali puntano nella stessa direzione, è alta.';
}

// Mentor mode
function provideMentor(context: AgentContextData): string {
  if (context.cluesCount === 0) {
    return 'Inizia con BUZZ per raccogliere i primi segnali. Poi torna qui per analizzarli insieme.';
  }
  
  if (context.cluesCount < 3) {
    return 'Hai iniziato bene. Continua a raccogliere: 3-5 indizi solidi ti danno una direzione chiara.';
  }
  
  return 'Sei su una buona traiettoria. Ora cerca pattern, classifica, e valuta coerenza. La strategia batte sempre la fretta.';
}

// Main generate function
export function generateAnalystReply(
  prompt: string,
  context: AgentContextData,
  clues: ClueItem[],
  seed: number
): string {
  // Anti-spoiler check
  if (hasSpoilerRisk(prompt)) {
    return composeNaturalReply(
      'Non posso fornire soluzioni o coordinate finali. Ti aiuto con analisi, pattern e strategie.',
      seed,
      context
    );
  }
  
  const intent = routeIntent(prompt);
  
  let baseReply: string;
  
  switch (intent) {
    case 'describe_mission':
      // © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
      const missionFAQ = FAQ_IT["Cos'è M1SSION?"];
      baseReply = missionFAQ && missionFAQ.length > 0 
        ? pickRandom(missionFAQ, seed)
        : "M1SSION è un'esperienza di caccia al tesoro intelligente che combina realtà e digital.";
      break;
      
    case 'identity':
      // © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
      if (context.agentCode === 'AG-GUEST') {
        baseReply = 'Non ho il tuo codice agente, ma possiamo procedere comunque.';
      } else {
        const identityFAQ = FAQ_IT["Che agente sono io?"];
        baseReply = identityFAQ && identityFAQ.length > 0
          ? pickRandom(identityFAQ, seed)
          : `Sei l'agente ${context.agentCode}, parte della rete M1SSION.`;
      }
      break;
      
    case 'probability_check':
      baseReply = assessProbability(clues);
      break;
      
    case 'classify':
      baseReply = classifyClues(clues);
      break;
      
    case 'patterns':
      baseReply = findPatterns(clues);
      break;
      
    case 'decode':
      const textMatch = prompt.match(/['"](.+?)['"]/);
      baseReply = textMatch 
        ? attemptDecode(textMatch[1])
        : 'Dammi il testo tra virgolette per provare a decodificarlo.';
      break;
      
    case 'mentor':
      baseReply = provideMentor(context);
      break;
      
    case 'faq':
      // © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
      // Find closest FAQ match with null safety
      const faqKey = Object.keys(FAQ_IT).find(q => 
        prompt.toLowerCase().includes(q.toLowerCase().slice(0, 10))
      );
      if (faqKey && FAQ_IT[faqKey] && FAQ_IT[faqKey].length > 0) {
        baseReply = pickRandom(FAQ_IT[faqKey], seed);
      } else {
        baseReply = 'Posso aiutarti con: analisi indizi, pattern, decodifiche, strategie. Cosa ti serve?';
      }
      break;
      
    default:
      baseReply = 'Posso aiutarti con: classificazione, pattern, decodifiche, probabilità, strategia. Cosa ti interessa?';
  }
  
  return composeNaturalReply(baseReply, seed, context);
}
