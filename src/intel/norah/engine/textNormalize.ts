// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

/**
 * Text normalization and fuzzy matching utilities for NORAH AI
 */

// Italian stopwords (light set)
const STOPWORDS_IT = new Set([
  'il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'una', 'di', 'da', 'a', 'in', 'su', 'per',
  'con', 'tra', 'fra', 'e', 'ma', 'o', 'che', 'come', 'quando', 'dove', 'cosa', 'mi',
  'ti', 'si', 'ci', 'vi', 'ne', 'me', 'te', 'lui', 'lei', 'noi', 'voi', 'loro'
]);

const STOPWORDS_EN = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
  'may', 'might', 'can', 'to', 'of', 'in', 'on', 'at', 'for', 'with', 'from'
]);

// Diacritics removal map
const DIACRITICS_MAP: Record<string, string> = {
  'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a',
  'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e',
  'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i',
  'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o',
  'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u',
  'ñ': 'n', 'ç': 'c', 'ß': 'ss'
};

// Common synonyms and typos
const SYNONYMS: Record<string, string[]> = {
  'finalshot': ['final shot', 'fs', 'finalshoot', 'final shoot', 'finale shot'],
  'mission': ['m1ssion', 'misione', 'missione', 'misión'],
  'buzz': ['buz', 'bus', 'buss'],
  'buzzmap': ['buzz map', 'buz map', 'mappa buzz', 'map buzz', 'buz mappa'],
  'abbonamento': ['abbo', 'piano', 'pricing', 'subscription', 'abbonamenti', 'piani'],
  'indizio': ['clue', 'indizi', 'clues', 'indizi', 'hint'],
  'probabilità': ['prob', 'probability', 'chance', 'probabilita'],
  'pattern': ['patterns', 'schema', 'schemi'],
  'decodifica': ['decode', 'decod', 'decipher', 'decifra'],
  'aiuto': ['help', 'aiutami', 'aiutare', 'assistenza'],
  'progress': ['progresso', 'avanzamento', 'stato'],
  'mentor': ['mentore', 'guida', 'coach'],
  'leaderboard': ['classifica', 'ranking', 'leader'],
  'community': ['comunità', 'comunita'],
  'privacy': ['privata', 'dati', 'sicurezza']
};

/**
 * Remove diacritics from text
 */
function removeDiacritics(text: string): string {
  return text.split('').map(char => DIACRITICS_MAP[char] || char).join('');
}

/**
 * Light stemming for Italian (remove common suffixes)
 */
function lightStem(word: string): string {
  if (word.length < 4) return word;
  
  const suffixes = ['zione', 'zioni', 'mente', 'are', 'ere', 'ire', 'ato', 'ita', 'ito'];
  for (const suffix of suffixes) {
    if (word.endsWith(suffix)) {
      return word.slice(0, -suffix.length);
    }
  }
  return word;
}

/**
 * Normalize text for fuzzy matching
 */
export function normalize(text: string): string[] {
  if (!text || typeof text !== 'string') return [];
  
  // Lowercase and trim
  let normalized = text.toLowerCase().trim();
  
  // Remove diacritics
  normalized = removeDiacritics(normalized);
  
  // Remove punctuation and emojis (keep only alphanumeric and spaces)
  normalized = normalized.replace(/[^\\w\\s]/g, ' ');
  
  // Collapse multiple spaces
  normalized = normalized.replace(/\\s+/g, ' ').trim();
  
  // Tokenize
  const tokens = normalized.split(' ').filter(t => t.length > 0);
  
  // Remove stopwords
  const filtered = tokens.filter(t => 
    !STOPWORDS_IT.has(t) && !STOPWORDS_EN.has(t)
  );
  
  // Apply light stemming
  const stemmed = filtered.map(lightStem);
  
  return stemmed;
}

/**
 * Expand synonyms in token array
 */
export function expandSynonyms(tokens: string[]): string[] {
  const expanded = new Set<string>(tokens);
  
  for (const token of tokens) {
    // Check each synonym group
    for (const [canonical, variants] of Object.entries(SYNONYMS)) {
      if (variants.some(v => normalize(v).includes(token)) || canonical === token) {
        expanded.add(canonical);
        variants.forEach(v => normalize(v).forEach(t => expanded.add(t)));
      }
    }
  }
  
  return Array.from(expanded);
}

/**
 * Levenshtein distance (edit distance)
 */
export function levenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

/**
 * Levenshtein similarity ratio (0-1)
 */
export function levenshteinRatio(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1.0;
  
  const distance = levenshtein(a, b);
  return 1 - (distance / maxLen);
}

/**
 * Generate trigrams from text
 */
export function trigrams(text: string): Set<string> {
  const padded = `  ${text}  `;
  const grams = new Set<string>();
  
  for (let i = 0; i < padded.length - 2; i++) {
    grams.add(padded.slice(i, i + 3));
  }
  
  return grams;
}

/**
 * Jaccard similarity for trigrams (0-1)
 */
export function trigramSimilarity(a: string, b: string): number {
  const gramsA = trigrams(a);
  const gramsB = trigrams(b);
  
  const intersection = new Set([...gramsA].filter(x => gramsB.has(x)));
  const union = new Set([...gramsA, ...gramsB]);
  
  if (union.size === 0) return 0;
  return intersection.size / union.size;
}

/**
 * Combined fuzzy score (Levenshtein + Trigram)
 */
export function fuzzyScore(query: string, target: string): number {
  const leven = levenshteinRatio(query, target);
  const trigram = trigramSimilarity(query, target);
  
  // Weighted average (trigram more important for short strings)
  return query.length < 5 ? leven * 0.3 + trigram * 0.7 : leven * 0.5 + trigram * 0.5;
}
