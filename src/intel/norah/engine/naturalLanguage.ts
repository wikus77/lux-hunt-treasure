// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// NORAH v6.9 - Natural Language Generator (Anti-Robot)

/**
 * v6.9: Convert choice array to natural prose (eliminate numbered lists)
 */
export function choicesToNaturalText(choices: string[]): string {
  if (choices.length === 0) return '';
  if (choices.length === 1) return choices[0];
  
  // Natural connectors instead of numbered lists
  const connectors = [
    ['Puoi', 'oppure'],
    ['Ti propongo', 'o se preferisci'],
    ['Facciamo', 'o meglio'],
    ['Prova', 'altrimenti'],
    ['Scegli se', 'o se vuoi']
  ];
  
  const [first, second] = connectors[Math.floor(Math.random() * connectors.length)];
  
  if (choices.length === 2) {
    return `${first} ${choices[0].toLowerCase()}, ${second} ${choices[1].toLowerCase()}.`;
  }
  
  // 3+ choices: use list with natural flow
  const lastChoice = choices[choices.length - 1];
  const otherChoices = choices.slice(0, -1);
  return `${first} ${otherChoices.map(c => c.toLowerCase()).join(', ')}, ${second} ${lastChoice.toLowerCase()}.`;
}

/**
 * v6.9: Inject micro-variations to avoid repetition
 */
export function varyPhrase(base: string): string {
  const variations: Record<string, string[]> = {
    'Facciamo': ['Proviamo', 'Andiamo con', 'Ti propongo', 'Scegliamo'],
    'Vediamo': ['Guardiamo', 'Analizziamo', 'Controlliamo', 'Verifichiamo'],
    'Capito': ['Chiaro', 'Ok', 'Ricevuto', 'Perfetto'],
    'Ottimo': ['Bene', 'Perfetto', 'Fantastico', 'Grande'],
    'Come': ['In che modo', 'In quale modo', 'Quale strada per'],
    'Cosa': ['Quale', 'Che cosa', 'Che tipo di'],
  };
  
  let result = base;
  for (const [key, alts] of Object.entries(variations)) {
    if (result.includes(key)) {
      const alt = alts[Math.floor(Math.random() * alts.length)];
      result = result.replace(key, alt);
      break; // Only one variation per phrase
    }
  }
  
  return result;
}

/**
 * v6.9: Detect if reply echoes user input (enhanced)
 */
export function detectEcho(reply: string, userInput: string): boolean {
  const userWords = userInput.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const replyLower = reply.toLowerCase();
  
  if (userWords.length < 3) return false;
  
  // Check for 3+ contiguous words
  for (let i = 0; i <= userWords.length - 3; i++) {
    const trigram = userWords.slice(i, i + 3).join(' ');
    if (replyLower.includes(trigram)) {
      return true;
    }
  }
  
  // Check significant word overlap (exclude common words)
  const commonWords = new Set([
    'buzz', 'map', 'final', 'shot', 'indizio', 'come', 'cosa', 
    'dove', 'quando', 'che', 'per', 'non', 'sono', 'hai', 'vuoi'
  ]);
  
  let matches = 0;
  for (const word of userWords) {
    if (!commonWords.has(word) && replyLower.includes(word)) {
      matches++;
    }
  }
  
  return matches > userWords.length * 0.4;
}

/**
 * v6.9: Remove echo by rephrasing
 */
export function removeEcho(reply: string, userInput: string): string {
  const userWords = userInput.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  let result = reply;
  
  // Replace user's exact phrases with synonyms
  for (const word of userWords) {
    if (word.length > 5 && result.toLowerCase().includes(word)) {
      result = varyPhrase(result);
      break;
    }
  }
  
  return result;
}
