/**
 * AION - Lightweight language detection for IT/EN/FR
 * Heuristics: stopwords, char patterns, common words
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

export type AionLang = 'it' | 'en' | 'fr';

const FR_CHARS = /[éèêëàâäùûüîïôöçœ]/i;
const EN_WORDS = /\b(the|and|are|is|what|how|where|when|who|why|you|your|this|that|with|have|has|can|could|would|will|help|please)\b/i;
const IT_WORDS = /\b(che|come|cosa|perché|perche|dove|quando|chi|vuoi|aiuto|come funziona|cos'è|quanto|quanti|dove si trova)\b/i;
const FR_WORDS = /\b(le|la|les|et|de|du|des|que|qui|est|sont|vous|comment|quoi|où|quand|aide|comment ça marche)\b/i;

/**
 * Detect language from user message text (IT/EN/FR).
 * Returns null if uncertain.
 */
export function detectLang(text: string): AionLang | null {
  const t = text.trim().toLowerCase();
  if (!t || t.length < 3) return null;

  let scoreIt = 0;
  let scoreEn = 0;
  let scoreFr = 0;

  // French-specific chars (strong signal)
  if (FR_CHARS.test(t)) scoreFr += 3;

  // Word patterns
  if (IT_WORDS.test(t)) scoreIt += 2;
  if (EN_WORDS.test(t)) scoreEn += 2;
  if (FR_WORDS.test(t)) scoreFr += 2;

  // Common IT words (single char "che" etc)
  if (/\bche\b/i.test(t)) scoreIt += 1;
  if (/\bcome\b/i.test(t) && !/\bcome (on|here|back)\b/i.test(t)) scoreIt += 1;
  if (/\bcos['a]\s/i.test(t) || /\bcosa\b/i.test(t)) scoreIt += 1;
  if (/\bperch[eé]\b/i.test(t)) scoreIt += 1;
  if (/\bdove\b/i.test(t)) scoreIt += 1;
  if (/\bquanto\b|\bquanti\b|\bquante\b/i.test(t)) scoreIt += 1;

  // Common EN
  if (/\bwhat\b/i.test(t)) scoreEn += 1;
  if (/\bhow\b/i.test(t)) scoreEn += 1;
  if (/\bwhere\b/i.test(t)) scoreEn += 1;
  if (/\byou\b/i.test(t)) scoreEn += 1;
  if (/\bthe\b/i.test(t)) scoreEn += 1;

  // Common FR
  if (/\bqui\b/i.test(t) && !/qui (sono|sei)\b/i.test(t)) scoreFr += 1;
  if (/\bcomment\b/i.test(t)) scoreFr += 1;
  if (/\bquoi\b/i.test(t)) scoreFr += 1;
  if (/\boù\b|\bou\b/i.test(t)) scoreFr += 1;
  if (/\best[- ]ce\b/i.test(t)) scoreFr += 1;

  const max = Math.max(scoreIt, scoreEn, scoreFr);
  if (max < 1) return null;
  if (scoreIt === max && scoreIt > scoreEn && scoreIt > scoreFr) return 'it';
  if (scoreEn === max && scoreEn > scoreIt && scoreEn > scoreFr) return 'en';
  if (scoreFr === max && scoreFr > scoreIt && scoreFr > scoreEn) return 'fr';
  return null;
}
