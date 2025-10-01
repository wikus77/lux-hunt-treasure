// © 2025 Joseph MULÉ – M1SSION™ - AI Analyst Persona & Prompts

const OPENINGS = [
  "Analisi in corso...",
  "Elaboro i dati disponibili...",
  "Scansione degli indizi completata.",
  "Valutazione in corso...",
  "Processando le informazioni..."
];

const CLOSINGS = [
  "Prosegui l'indagine con cautela.",
  "Ogni pista va verificata sul campo.",
  "Mantieni la lucidità, agente.",
  "La verità emerge dai dettagli.",
  "Continua a raccogliere prove."
];

const EMOJIS = ['🔎', '🧭', '📍', '🎯', '🔍'];

export const getRandomOpening = () => OPENINGS[Math.floor(Math.random() * OPENINGS.length)];
export const getRandomClosing = () => CLOSINGS[Math.floor(Math.random() * CLOSINGS.length)];
export const getRandomEmoji = () => EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

export const ANALYST_PERSONA = `Sei un analista tecnico M1SSION, asciutto ma collaborativo.

REGOLE FERREE:
- MAI rivelare coordinate GPS, indirizzi esatti, o nomi di luoghi/premi.
- Fornisci solo PISTE: pattern, correlazioni, probabilità.
- Massimo 5 bullet point per risposta.
- Tono investigativo, freddo ma accomodante.
- Variare aperture e chiusure per evitare ripetizioni.
- Temperatura moderata: ragionamento equilibrato.

GUARDRAILS:
- Se l'utente chiede "dov'è" o "qual è il premio" → rispondi "Non posso rivelarlo, ma posso aiutarti ad analizzare le piste."
- Se 0 indizi → coaching motivazionale su come raccoglierne.
- Se indizi insufficienti → suggerisci di raccoglierne altri prima di trarre conclusioni.

CAPACITÀ:
1. Classifica: luogo vs premio, coerenza temporale
2. Pattern: cluster semantici, ripetizioni
3. Decodifica: suggerimenti su codici (mai soluzioni esatte)
4. Probabilità: stime % su ipotesi (sempre con disclaimer)
5. Mentore: motivazione narrativa senza spoiler`;

// Client-side decode utilities (solo suggerimenti)
export const caesarShift = (text: string, shift: number): string => {
  return text
    .split('')
    .map(char => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 + shift) % 26) + 65);
      } else if (code >= 97 && code <= 122) {
        return String.fromCharCode(((code - 97 + shift) % 26) + 97);
      }
      return char;
    })
    .join('');
};

export const tryBase64Decode = (text: string): string | null => {
  try {
    return atob(text);
  } catch {
    return null;
  }
};

export const anagramHints = (text: string): string[] => {
  if (text.length > 10) return ["Testo troppo lungo per anagrammi manuali"];
  
  const clean = text.toLowerCase().replace(/[^a-z]/g, '');
  const letters = clean.split('').sort().join('');
  
  return [
    `Lettere ordinate: ${letters}`,
    `Vocali: ${clean.match(/[aeiou]/g)?.length || 0}`,
    `Consonanti: ${clean.match(/[^aeiou]/g)?.length || 0}`,
    "Prova a cercare parole chiave con queste lettere"
  ];
};

export const analyzeNumericPattern = (text: string): string[] => {
  const numbers = text.match(/\d+/g);
  if (!numbers || numbers.length === 0) return ["Nessun pattern numerico rilevato"];
  
  const hints: string[] = [];
  
  numbers.forEach(num => {
    const digits = num.split('').map(Number);
    const sum = digits.reduce((a, b) => a + b, 0);
    
    hints.push(`${num}: somma cifre = ${sum} (mod 9 = ${sum % 9}, mod 11 = ${sum % 11})`);
    
    // Check if looks like coordinates
    if (num.length >= 6 && num.includes('.')) {
      hints.push(`${num} potrebbe essere una coordinata (verifica formato lat/long)`);
    }
  });
  
  return hints.slice(0, 3);
};

export const buildAnalystPrompt = (
  clues: Array<{ title: string; description: string; created_at: string }>,
  mode: 'analyze' | 'classify' | 'decode' | 'assess' | 'guide',
  userMessage: string,
  history: Array<{ role: 'user' | 'analyst'; content: string }>
): string => {
  const opening = getRandomOpening();
  const closing = getRandomClosing();
  const emoji = getRandomEmoji();
  
  let context = `${ANALYST_PERSONA}\n\n`;
  context += `MODO: ${mode.toUpperCase()}\n`;
  context += `INDIZI DISPONIBILI (${clues.length}):\n`;
  
  if (clues.length === 0) {
    context += "Nessun indizio raccolto. Coaching richiesto.\n\n";
  } else {
    clues.slice(0, 20).forEach((clue, i) => {
      context += `${i + 1}. "${clue.title}": ${clue.description.slice(0, 100)}...\n`;
    });
    context += `\n`;
  }
  
  if (history.length > 0) {
    context += `CONVERSAZIONE RECENTE:\n`;
    history.slice(-6).forEach(msg => {
      context += `${msg.role === 'user' ? 'Utente' : 'Analista'}: ${msg.content.slice(0, 80)}...\n`;
    });
    context += `\n`;
  }
  
  context += `RICHIESTA: ${userMessage}\n\n`;
  context += `RISPOSTA (apri con "${opening}", chiudi con "${closing}", usa max 5 bullet):\n`;
  
  return context;
};