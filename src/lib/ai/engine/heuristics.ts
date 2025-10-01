// © 2025 Joseph MULÉ – M1SSION™
// Intelligence Heuristics - Lightweight offline analysis

import type { IntelContext } from './context';
import type { Intent } from './router';

export interface Analysis {
  clusters: string[][];
  keywords: string[];
  decoded: string[];
  recency: number[];
  confidence: number;
}

// Common Italian stop words
const STOP_WORDS = new Set([
  'il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una',
  'di', 'da', 'a', 'in', 'con', 'su', 'per', 'tra', 'fra',
  'e', 'o', 'che', 'del', 'dei', 'della', 'delle', 'al', 'ai'
]);

/**
 * Simple TF-IDF for keyword extraction
 */
function extractKeywords(texts: string[]): string[] {
  const wordFreq = new Map<string, number>();
  const docCount = new Map<string, number>();

  texts.forEach(text => {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !STOP_WORDS.has(w));

    const uniqueWords = new Set(words);
    
    words.forEach(word => {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    });

    uniqueWords.forEach(word => {
      docCount.set(word, (docCount.get(word) || 0) + 1);
    });
  });

  // Calculate TF-IDF scores
  const scores = new Map<string, number>();
  wordFreq.forEach((tf, word) => {
    const df = docCount.get(word) || 1;
    const idf = Math.log(texts.length / df);
    scores.set(word, tf * idf);
  });

  // Return top keywords
  return Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word);
}

/**
 * Cosine similarity clustering (simple 2-cluster)
 */
function clusterBySimilarity(texts: string[]): string[][] {
  if (texts.length < 2) return [texts];

  const keywords = extractKeywords(texts);
  const vectors = texts.map(text => {
    const words = text.toLowerCase().split(/\s+/);
    return keywords.map(kw => words.filter(w => w.includes(kw)).length);
  });

  // Simple k-means (k=2)
  const cluster1: string[] = [];
  const cluster2: string[] = [];

  vectors.forEach((vec, i) => {
    const sum = vec.reduce((a, b) => a + b, 0);
    if (sum > vectors[0].reduce((a, b) => a + b, 0) / 2) {
      cluster1.push(texts[i]);
    } else {
      cluster2.push(texts[i]);
    }
  });

  return [cluster1, cluster2].filter(c => c.length > 0);
}

/**
 * Base64 decoder
 */
function tryBase64(text: string): string | null {
  try {
    const cleaned = text.replace(/[^A-Za-z0-9+/=]/g, '');
    if (cleaned.length < 4 || cleaned.length % 4 !== 0) return null;
    
    const decoded = atob(cleaned);
    // Check if result is printable ASCII
    if (/^[\x20-\x7E]+$/.test(decoded)) {
      return decoded;
    }
  } catch {
    // Not valid Base64
  }
  return null;
}

/**
 * Caesar cipher (±3)
 */
function caesarShift(text: string, shift: number): string {
  return text.replace(/[a-z]/gi, (char) => {
    const base = char <= 'Z' ? 65 : 97;
    return String.fromCharCode(((char.charCodeAt(0) - base + shift + 26) % 26) + base);
  });
}

/**
 * Basic decoders
 */
function tryDecode(text: string): string[] {
  const results: string[] = [];

  // Base64
  const b64 = tryBase64(text);
  if (b64) results.push(`Base64: ${b64}`);

  // Caesar +3
  const caesar3 = caesarShift(text, 3);
  if (caesar3 !== text) results.push(`Caesar+3: ${caesar3}`);

  // Reverse
  const reversed = text.split('').reverse().join('');
  results.push(`Reverse: ${reversed}`);

  // ASCII codes (if numeric pattern)
  if (/^\d+(\s+\d+)*$/.test(text)) {
    try {
      const ascii = text.split(/\s+/).map(n => String.fromCharCode(parseInt(n))).join('');
      if (/^[\x20-\x7E]+$/.test(ascii)) {
        results.push(`ASCII: ${ascii}`);
      }
    } catch {
      // Not valid ASCII
    }
  }

  return results;
}

/**
 * Analyze clues based on intent
 */
export async function analyze(intent: Intent, ctx: IntelContext): Promise<Analysis> {
  const texts = ctx.userClues.map(c => `${c.title} ${c.text}`);
  
  const keywords = extractKeywords(texts);
  const clusters = intent === 'classify' || intent === 'patterns' 
    ? clusterBySimilarity(texts)
    : [texts];

  // Recency scores (newer = higher)
  const now = Date.now();
  const recency = ctx.userClues.map(c => {
    const age = now - new Date(c.created_at).getTime();
    const days = age / (1000 * 60 * 60 * 24);
    return Math.max(0, 1 - (days / 30)); // Decay over 30 days
  });

  // Decode attempts
  let decoded: string[] = [];
  if (intent === 'decode') {
    ctx.userClues.forEach(clue => {
      const attempts = tryDecode(clue.text);
      decoded.push(...attempts);
    });
  }

  // Confidence based on clue count and recency
  const avgRecency = recency.reduce((a, b) => a + b, 0) / (recency.length || 1);
  const confidence = Math.min(1, (ctx.userClues.length / 10) * avgRecency);

  return {
    clusters,
    keywords,
    decoded: decoded.slice(0, 5), // Max 5 decode attempts
    recency,
    confidence
  };
}
