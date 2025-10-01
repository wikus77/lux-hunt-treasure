// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// NORAH Spell Checker - Damerau-Levenshtein + M1SSION domain dictionary

// M1SSION domain-specific dictionary
const M1SSION_DICT: Set<string> = new Set([
  'norah', 'mission', 'm1ssion', 'm1', 'mssn',
  'finalshot', 'final', 'shot', 'fs',
  'buzz', 'buzzmap', 'buz', 'mappa',
  'indizi', 'indizio', 'clue', 'clues',
  'pattern', 'patterns', 'schema',
  'probabilita', 'probability', 'prob',
  'aiuto', 'help', 'inizio', 'iniziare', 'inizia',
  'piani', 'piano', 'abbonamento', 'abbo', 'subscription',
  'regole', 'rules', 'istruzioni',
  'classifica', 'leaderboard', 'ranking',
  'mentor', 'mentore', 'guida', 'coach',
  'progress', 'progresso', 'avanzamento',
  'decode', 'decodifica', 'decifra',
  'coordinate', 'luogo', 'posto', 'premio'
]);

// Damerau-Levenshtein distance (supports transposition)
function damerauLevenshtein(a: string, b: string): number {
  const lenA = a.length;
  const lenB = b.length;
  const maxDist = lenA + lenB;
  const H: number[][] = Array(lenA + 2).fill(null).map(() => Array(lenB + 2).fill(0));
  
  H[0][0] = maxDist;
  for (let i = 0; i <= lenA; i++) { H[i + 1][0] = maxDist; H[i + 1][1] = i; }
  for (let j = 0; j <= lenB; j++) { H[0][j + 1] = maxDist; H[1][j + 1] = j; }
  
  const da: Record<string, number> = {};
  const sigma = new Set([...a, ...b]);
  sigma.forEach(ch => da[ch] = 0);
  
  for (let i = 1; i <= lenA; i++) {
    let db = 0;
    for (let j = 1; j <= lenB; j++) {
      const k = da[b[j - 1]] || 0;
      const l = db;
      let cost = 1;
      if (a[i - 1] === b[j - 1]) {
        cost = 0;
        db = j;
      }
      H[i + 1][j + 1] = Math.min(
        H[i][j] + cost,           // substitution
        H[i + 1][j] + 1,          // insertion
        H[i][j + 1] + 1,          // deletion
        H[k][l] + (i - k - 1) + 1 + (j - l - 1) // transposition
      );
    }
    da[a[i - 1]] = i;
  }
  
  return H[lenA + 1][lenB + 1];
}

// Spell correction - find closest match in dictionary
export function correctSpelling(word: string): string {
  const lower = word.toLowerCase();
  
  // Exact match
  if (M1SSION_DICT.has(lower)) return lower;
  
  // Find closest match with threshold
  let bestMatch = word;
  let minDist = Infinity;
  const threshold = Math.max(2, Math.floor(lower.length * 0.4)); // 40% edit distance
  
  for (const dictWord of M1SSION_DICT) {
    const dist = damerauLevenshtein(lower, dictWord);
    if (dist < minDist && dist <= threshold) {
      minDist = dist;
      bestMatch = dictWord;
    }
  }
  
  return bestMatch;
}

// Correct phrase (word by word)
export function correctPhrase(text: string): string {
  const words = text.toLowerCase().trim().split(/\s+/);
  const corrected = words.map(w => correctSpelling(w));
  return corrected.join(' ');
}
