// © 2025 Joseph MULÉ – M1SSION™ - Local AI Analyst Engine
// Deterministic engine with natural variation and guardrails

import { caesarShift, tryBase64Decode, anagramHints, analyzeNumericPattern } from './aiAnalystPrompt';

export type AnalystMode = 'analyze' | 'classify' | 'decode' | 'assess' | 'guide' | 'general';

interface Clue {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

interface EngineContext {
  mode: AnalystMode;
  clues: Clue[];
  userText: string;
  userId?: string;
  timestamp: number;
}

interface EngineResponse {
  content: string;
  metadata?: {
    templatesUsed?: number;
    confidence?: number;
  };
}

// ============= GUARDRAILS =============

const FORBIDDEN_PATTERNS = [
  /dov['']?è|dove\s+(si\s+)?trova/i,
  /qual\s+è\s+(il\s+)?premio/i,
  /coordinate|gps|latitudine|longitudine/i,
  /svelami|dimmi\s+(la\s+)?soluzione/i,
  /dammi\s+(la\s+)?risposta/i
];

const checkGuardrail = (text: string): boolean => {
  return FORBIDDEN_PATTERNS.some(pattern => pattern.test(text));
};

// ============= TEMPLATE LIBRARIES =============

const GUARDRAIL_RESPONSES = [
  "⚠️ Non posso rivelare la soluzione o coordinate esatte.\n\nPosso però aiutarti ad analizzare le piste disponibili e suggerirti pattern da investigare.",
  "🔒 Le coordinate e i premi sono protetti.\n\nIl mio ruolo è guidarti nell'analisi degli indizi, non fornire soluzioni dirette. Fammi una domanda diversa!",
  "❌ Rivelazione non autorizzata.\n\nPosso classificare indizi, cercare pattern, decodificare messaggi... ma non posso darti coordinate o premi. È la regola del gioco!"
];

const NO_CLUES_RESPONSES = [
  "📚 **Nessun Indizio Raccolto**\n\nPer iniziare l'analisi, raccogli indizi tramite:\n\n• 🎯 BUZZ: scansiona la mappa\n• 📅 Eventi settimanali M1SSION\n• 🎁 Missioni speciali\n• 📱 Codici QR sul territorio\n\nTorna quando avrai almeno 3-5 indizi!",
  "🔍 **Dataset Vuoto**\n\nAgente, non ho dati su cui lavorare.\n\nVai sul campo e raccogli indizi attraverso BUZZ, eventi o QR. Servono almeno 3-5 elementi per un'analisi significativa.",
  "📊 **Archivio Vuoto**\n\nSenza indizi non posso fare analisi.\n\nUsa le funzionalità M1SSION (BUZZ, Map, Eventi) per raccogliere dati. Torna quando avrai materiale da analizzare!"
];

const MISSION_INFO_RESPONSES = [
  "🎯 **M1SSION™ - Intelligence Game**\n\nM1SSION è un gioco di intelligence in tempo reale dove agenti competono per trovare un premio nascosto.\n\n**Come funziona:**\n• Raccogli indizi tramite BUZZ, Map e eventi\n• Analizza pattern e correlazioni\n• Usa strumenti di intelligence come me\n• Accedi al Final Shot quando hai abbastanza dati\n\nIl primo agente a trovare il premio vince!",
  "🕵️ **Cos'è M1SSION**\n\nUn treasure hunt avanzato con meccaniche di intelligence.\n\n**Strumenti disponibili:**\n• BUZZ: scansione territorio\n• Map: visualizzazione aree\n• AI Analyst: analisi indizi (io!)\n• Final Shot: tentativo finale\n\nRaccogli indizi, analizza, decifra e vinci il premio!",
  "🎮 **M1SSION Overview**\n\nGioco di investigazione competitivo.\n\n**Obiettivo:** Trova il premio nascosto prima degli altri agenti.\n\n**Strumenti:** BUZZ (scan), Map (geo), Intelligence (analisi), Final Shot (tentat ivo finale).\n\n**Strategia:** Raccogli indizi, cerca pattern, usa decodifiche, procedi con metodo!"
];

const PROBABILITY_RESPONSES_LOW = [
  "📊 **Valutazione Probabilità: BASSA**\n\nCon ${count} indizi, le possibilità di successo sono ancora limitate.\n\n**Raccomandazione:** Raccogli almeno 5-7 indizi prima di procedere al Final Shot.\n\nOgni indizio aumenta esponenzialmente le tue probabilità.",
  "⚠️ **Stima Probabilità: RIDOTTA**\n\nDataset insufficiente (${count} indizi).\n\n**Consiglio:** Continua a raccogliere dati. Con meno di 3 indizi, le probabilità di successo sono sotto il 20%.\n\nPazienza e metodo, agente!",
  "📉 **Assessment: PROBABILITÀ BASSA**\n\n${count} indizi non bastano per un tentativo informato.\n\n**Next steps:** Raccogli altri 3-5 indizi, poi torna per una valutazione più accurata."
];

const PROBABILITY_RESPONSES_MEDIUM = [
  "📈 **Valutazione Probabilità: MEDIA**\n\nCon ${count} indizi, hai una base discreta (35-55% successo stimato).\n\n**Consiglio:** Raccogli ancora 2-3 indizi chiave per aumentare le probabilità al 60-70%.\n\nSei sulla buona strada!",
  "🎯 **Stima Probabilità: MODERATA**\n\nDataset: ${count} indizi.\nProbabilità stimate: 40-60%\n\n**Suggerimento:** Verifica correlazioni tra gli indizi più recenti prima del Final Shot. Qualche dato in più farebbe la differenza.",
  "⚖️ **Assessment: PROBABILITÀ MEDIA-ALTA**\n\n${count} indizi è un buon punto di partenza.\n\nSe trovi correlazioni forti (luoghi ricorrenti, pattern temporali), puoi considerare un tentativo. Altrimenti raccogli ancora un po'."
];

const PROBABILITY_RESPONSES_HIGH = [
  "🎯 **Valutazione Probabilità: ALTA**\n\nCon ${count} indizi, hai un dataset robusto!\n\nProbabilità stimate: 65-85%\n\n**Status:** Pronto per Final Shot se i dati convergono su un'area specifica.\n\nVerifica cluster geografici e pattern temporali prima di procedere.",
  "✅ **Stima Probabilità: ELEVATA**\n\nDataset: ${count} indizi.\nConfidenza: 70-90%\n\n**Go signal:** Se gli indizi puntano verso un'area coerente, sei pronto per il Final Shot.\n\nControlla bene le correlazioni prima di sparare!",
  "🚀 **Assessment: PROBABILITÀ IN CRESCITA**\n\n${count} indizi = ottima base.\n\nSe trovi almeno 3 sovrapposizioni tematiche o geografiche, le tue chance sono molto alte (75%+).\n\nProcedi con metodo e vinci!"
];

// ============= ANALYSIS TEMPLATES =============

const ANALYZE_TEMPLATES = [
  (clues: Clue[]) => {
    const recent = clues.slice(0, 5);
    const keywords = recent.map(c => c.title.split(' ')[0]).filter(Boolean).join(', ');
    return `🔍 **Analisi Pattern (${clues.length} indizi)**\n\n• Keywords rilevanti: ${keywords}\n• Coerenza temporale: ultimi ${recent.length} indizi allineati\n• Clustering: rilevo correlazioni tra "${recent[0]?.title}" e successivi\n• Confidenza pista: 60-75%\n\n💡 **Suggerimento:** Verifica sovrapposizioni geografiche negli indizi più recenti.`;
  },
  (clues: Clue[]) => {
    const titles = clues.slice(0, 3).map(c => c.title).join(' + ');
    return `📊 **Scansione ${clues.length} Elementi**\n\n• Triade chiave: ${titles}\n• Pattern identificati: possibili riferimenti incrociati\n• Affidabilità dataset: Media-Alta\n• Probabilità correlazione: 55-70%\n\n🎯 **Next:** Cerca parole o luoghi ricorrenti tra i primi 5 indizi.`;
  },
  (clues: Clue[]) => {
    const avgLength = Math.round(clues.reduce((sum, c) => sum + c.description.length, 0) / clues.length);
    return `🧭 **Analisi Investigativa**\n\nDataset: ${clues.length} indizi (avg ${avgLength} char/indizio)\n\n• Densità informativa: ${avgLength > 100 ? 'Alta' : avgLength > 50 ? 'Media' : 'Bassa'}\n• Pattern semantici: in fase di identificazione\n• Cluster tematici: ${clues.length >= 5 ? '2-3 gruppi rilevati' : 'serve più materiale'}\n\n🔎 Concentrati sui dettagli: ogni parola conta!`;
  }
];

const CLASSIFY_TEMPLATES = [
  (locationCount: number, prizeCount: number, total: number) => {
    const others = total - locationCount - prizeCount;
    return `📊 **Classificazione ${total} Indizi**\n\n• 📍 Indizi di Luogo: ${locationCount} (${Math.round(locationCount/total*100)}%)\n• 🎁 Indizi di Premio: ${prizeCount} (${Math.round(prizeCount/total*100)}%)\n• ❓ Altri/Ambigui: ${others}\n\n🎯 **Focus:** Priorità su "${locationCount > prizeCount ? 'luoghi' : 'premi'}" per restringere campo d'azione.`;
  },
  (locationCount: number, prizeCount: number, total: number) => {
    const balance = Math.abs(locationCount - prizeCount) < 2 ? 'bilanciato' : locationCount > prizeCount ? 'sbilanciato verso luoghi' : 'sbilanciato verso premi';
    return `🗂️ **Tassonomia Dataset (${total} elementi)**\n\n**Distribuzione:**\n→ Geo/Luoghi: ${locationCount}\n→ Premi/Oggetti: ${prizeCount}\n→ Non classificati: ${total - locationCount - prizeCount}\n\n**Bilanciamento:** ${balance}\n\n💡 Suggerimento: ${locationCount < 2 ? 'Serve più geo' : prizeCount < 2 ? 'Serve più info premi' : 'Dataset equilibrato'}`;
  },
  (locationCount: number, prizeCount: number, total: number) => {
    return `🏷️ **Segmentazione Indizi**\n\nTotale: ${total}\nGeo: ${locationCount} | Premio: ${prizeCount} | Altro: ${total - locationCount - prizeCount}\n\n**Pattern:** ${locationCount > total/2 ? 'Forte componente geografica' : prizeCount > total/2 ? 'Focus su caratteristiche premio' : 'Mix equilibrato'}\n\n🧠 Analisi: ${locationCount >= 3 && prizeCount >= 2 ? 'Hai abbastanza dati per entrambi gli aspetti!' : 'Raccogli più indizi della categoria mancante'}`;
  }
];

const GUIDE_TEMPLATES = [
  (progress: number) => `🎯 **Mentore M1SSION**\n\nAgente, progresso al ${progress}%.\n\n• Ogni indizio ti avvicina alla verità\n• La perseveranza vince sempre\n• Non lasciare che i dubbi ti fermino\n• Il premio attende chi ha pazienza\n\n🚀 La missione continua. Avanti!`,
  (progress: number) => `💪 **Coaching Intelligence**\n\nLivello completamento: ${progress}%\n\n**Mindset vincente:**\n→ Focus sui dettagli\n→ Fiducia nel metodo\n→ Costanza nella ricerca\n→ Precisione nell'analisi\n\n🏆 Solo chi persiste arriva al premio. Continua così!`,
  (progress: number) => `🧭 **Guida Strategica**\n\nStatus: ${progress}% verso obiettivo\n\n• Il successo è fatto di piccoli passi\n• Ogni indizio è un tassello del puzzle\n• La pazienza è l'arma dell'investigatore\n• Il traguardo si avvicina\n\n✨ Mantieni il focus. Sei sulla strada giusta!`
];

const ASSESS_TEMPLATES = [
  (clues: Clue[], days: number) => `📈 **Valutazione CIA**\n\nDataset: ${clues.length} indizi / ${days} giorni\n\n**Probabilità Piste:**\n• 🟢 Alta (70-85%): indizi recenti coerenti\n• 🟡 Media (50-70%): sovrapposizioni parziali\n• 🔴 Bassa (20-50%): dati contraddittori\n\n⚠️ Disclaimer: stime su pattern, non certezze.\nVerifica sempre sul campo!`,
  (clues: Clue[], days: number) => `🎯 **Assessment Tecnico**\n\nCampione: ${clues.length} elementi\nFinestra temporale: ${days}d\n\n**Confidence Level:**\n→ Affidabilità alta: ${Math.round(clues.length * 0.6)} indizi\n→ Affidabilità media: ${Math.round(clues.length * 0.3)} indizi\n→ Affidabilità bassa: ${Math.round(clues.length * 0.1)} indizi\n\n🔬 Nota: valutazione basata su algoritmi pattern-matching.`,
  (clues: Clue[], days: number) => `📊 **Analisi Probabilistica**\n\nDati: ${clues.length} punti / periodo ${days} giorni\n\n**Stima affidabilità:**\n• Convergenza alta: ${clues.length >= 7 ? 'SÌ' : 'NO'}\n• Coerenza temporale: ${days <= 14 ? 'ALTA' : 'MEDIA'}\n• Pattern rilevabili: ${clues.length >= 5 ? 'MULTIPLI' : 'POCHI'}\n\n✅ Procedi se almeno 2/3 parametri sono positivi.`
];

// ============= SEED GENERATOR =============

const generateSeed = (userId: string | undefined, timestamp: number): number => {
  const base = userId ? userId.charCodeAt(0) : 42;
  return (base + timestamp) % 1000;
};

const selectTemplate = <T>(templates: T[], seed: number): T => {
  return templates[seed % templates.length];
};

// ============= MAIN ENGINE =============

export const generateReply = (context: EngineContext): EngineResponse => {
  const { mode, clues, userText, userId, timestamp } = context;
  const seed = generateSeed(userId, timestamp);
  
  // Guardrails
  if (checkGuardrail(userText)) {
    return {
      content: selectTemplate(GUARDRAIL_RESPONSES, seed),
      metadata: { templatesUsed: GUARDRAIL_RESPONSES.length }
    };
  }
  
  // M1SSION info query
  const lowerText = userText.toLowerCase();
  if (lowerText.includes('parlami di m1ssion') || lowerText.includes("cos'è m1ssion") || 
      lowerText.includes('come funziona')) {
    return {
      content: selectTemplate(MISSION_INFO_RESPONSES, seed),
      metadata: { templatesUsed: MISSION_INFO_RESPONSES.length }
    };
  }
  
  // Probability query
  if (lowerText.includes('probabilità') || lowerText.includes('chance') || 
      lowerText.includes('quante possibilità')) {
    const count = clues.length;
    let responses: string[];
    
    if (count <= 2) {
      responses = PROBABILITY_RESPONSES_LOW;
    } else if (count <= 6) {
      responses = PROBABILITY_RESPONSES_MEDIUM;
    } else {
      responses = PROBABILITY_RESPONSES_HIGH;
    }
    
    const template = selectTemplate(responses, seed);
    return {
      content: template.replace(/\$\{count\}/g, count.toString()),
      metadata: { templatesUsed: responses.length, confidence: count * 10 }
    };
  }
  
  // No clues
  if (clues.length === 0) {
    return {
      content: selectTemplate(NO_CLUES_RESPONSES, seed),
      metadata: { templatesUsed: NO_CLUES_RESPONSES.length }
    };
  }
  
  // Mode-specific responses
  switch (mode) {
    case 'analyze':
      const template = selectTemplate(ANALYZE_TEMPLATES, seed);
      return {
        content: template(clues),
        metadata: { templatesUsed: ANALYZE_TEMPLATES.length, confidence: 65 }
      };
    
    case 'classify':
      const locationClues = clues.filter(c => 
        /via|strada|piazza|coord|gps|lat|lon/i.test(c.description)
      ).length;
      const prizeClues = clues.filter(c => 
        /premio|color|material|oggetto|metallo/i.test(c.description)
      ).length;
      const classifyTemplate = selectTemplate(CLASSIFY_TEMPLATES, seed);
      return {
        content: classifyTemplate(locationClues, prizeClues, clues.length),
        metadata: { templatesUsed: CLASSIFY_TEMPLATES.length, confidence: 70 }
      };
    
    case 'decode':
      return handleDecode(userText, seed);
    
    case 'assess':
      const oldestDate = new Date(clues[clues.length - 1]?.created_at || Date.now());
      const newestDate = new Date(clues[0]?.created_at || Date.now());
      const daysDiff = Math.floor((newestDate.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24));
      const assessTemplate = selectTemplate(ASSESS_TEMPLATES, seed);
      return {
        content: assessTemplate(clues, Math.max(daysDiff, 1)),
        metadata: { templatesUsed: ASSESS_TEMPLATES.length, confidence: 60 }
      };
    
    case 'guide':
      const progress = Math.min(clues.length * 10, 100);
      const guideTemplate = selectTemplate(GUIDE_TEMPLATES, seed);
      return {
        content: guideTemplate(progress),
        metadata: { templatesUsed: GUIDE_TEMPLATES.length }
      };
    
    default:
      return {
        content: "🤖 Modalità non riconosciuta. Usa i chip rapidi o specifica: analyze, classify, decode, assess, guide.",
        metadata: {}
      };
  }
};

// ============= DECODE HANDLER =============

const handleDecode = (userText: string, seed: number): EngineResponse => {
  const textToAnalyze = userText.trim();
  
  if (textToAnalyze.length === 0 || /^(decode|decodifica)$/i.test(textToAnalyze)) {
    const helpTexts = [
      "🔐 **Decodifica Pattern**\n\nInvia un testo dopo 'decode'.\n\nEsempi:\n• decode KHOOR (Caesar)\n• decode SGVsbG8= (Base64)\n• decode ROMA (Anagrammi)\n• decode 41.9 12.5 (Coordinate)\n\nMax 10 char per anagrammi.",
      "🔓 **Analisi Cifrari**\n\nFormato: decode <testo>\n\nSupporto:\n→ Caesar ±1, ±3\n→ Base64\n→ Anagrammi (≤10 char)\n→ Pattern numerici\n\nProva ora!",
      "🧩 **Decodificatore M1SSION**\n\nUso: scrivi 'decode' + testo cifrato\n\nTooling:\n• Shift Caesar\n• Base64 decode\n• Anagram hints\n• Numeric patterns\n\nEsempio: decode XYZ123"
    ];
    return {
      content: helpTexts[seed % helpTexts.length],
      metadata: { templatesUsed: helpTexts.length }
    };
  }
  
  const decodeHints: string[] = [];
  decodeHints.push(`🔐 **Decodifica Input**\n\nTesto: "${textToAnalyze}"\n`);
  
  // Caesar
  decodeHints.push(`**Caesar Shifts:**`);
  decodeHints.push(`• +1: ${caesarShift(textToAnalyze, 1)}`);
  decodeHints.push(`• +3: ${caesarShift(textToAnalyze, 3)}`);
  decodeHints.push(`• -1: ${caesarShift(textToAnalyze, -1)}`);
  
  // Base64
  const b64 = tryBase64Decode(textToAnalyze);
  if (b64) {
    decodeHints.push(`\n**Base64:**\n• Decoded: ${b64}`);
  }
  
  // Anagrams (if short)
  if (textToAnalyze.length <= 10 && /^[a-zA-Z]+$/.test(textToAnalyze)) {
    const anagrams = anagramHints(textToAnalyze);
    decodeHints.push(`\n**Anagrammi:**`);
    anagrams.forEach(hint => decodeHints.push(`• ${hint}`));
  }
  
  // Numeric patterns
  if (/\d/.test(textToAnalyze)) {
    const numPatterns = analyzeNumericPattern(textToAnalyze);
    if (numPatterns[0] !== "Nessun pattern numerico rilevato") {
      decodeHints.push(`\n**Pattern Numerici:**`);
      numPatterns.forEach(hint => decodeHints.push(`• ${hint}`));
    }
  }
  
  decodeHints.push(`\n💡 **Nota:** Questi sono solo suggerimenti. La soluzione finale richiede verifica manuale!`);
  
  return {
    content: decodeHints.join('\n'),
    metadata: { templatesUsed: 3, confidence: 50 }
  };
};
