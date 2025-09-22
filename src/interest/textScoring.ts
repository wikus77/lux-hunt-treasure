/**
 * © 2025 Joseph MULÉ – M1SSION™ Text Scoring Utilities
 * Language-aware content scoring for Interest Engine
 */

export interface ScoringResult {
  score: number;
  matched: string[];
}

/**
 * Tokenize text for language-aware matching
 */
export function tokenize(text: string): string[] {
  if (!text) return [];
  
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ') // Keep only letters, numbers, spaces
    .split(/\s+/)
    .filter(token => token.length > 2); // Filter short tokens
}

/**
 * Language-aware keyword matching with locale-specific handling
 */
export function languageAwareMatch(
  text: string, 
  locale: 'en'|'fr'|'es'|'de'|'nl', 
  keywords: string[]
): ScoringResult {
  if (!text || !keywords?.length) {
    return { score: 0, matched: [] };
  }

  const textTokens = tokenize(text);
  const matched: string[] = [];
  let totalMatches = 0;

  for (const keyword of keywords) {
    const keywordTokens = tokenize(keyword);
    
    // Exact phrase match (higher weight)
    if (text.toLowerCase().includes(keyword.toLowerCase())) {
      matched.push(keyword);
      totalMatches += 2; // Phrase match gets double weight
      continue;
    }

    // Token-based matching
    const keywordMatchCount = keywordTokens.filter(keyToken =>
      textTokens.some(textToken => 
        textToken.includes(keyToken) || keyToken.includes(textToken)
      )
    ).length;

    if (keywordMatchCount > 0) {
      const matchRatio = keywordMatchCount / keywordTokens.length;
      if (matchRatio >= 0.5) { // At least 50% of keyword tokens match
        matched.push(keyword);
        totalMatches += matchRatio;
      }
    }
  }

  // Language-specific boost
  const languageBoost = getLanguageBoost(locale, text);
  const baseScore = Math.min(totalMatches / keywords.length, 1.0);
  const finalScore = Math.min(baseScore * languageBoost, 1.0);

  return {
    score: Math.round(finalScore * 100) / 100, // Round to 2 decimals
    matched
  };
}

/**
 * Apply language-specific scoring boost
 */
function getLanguageBoost(locale: string, text: string): number {
  const boosts: Record<string, string[]> = {
    'en': ['luxury', 'premium', 'exclusive', 'limited', 'mission'],
    'fr': ['luxe', 'premium', 'exclusif', 'limité', 'mission'],
    'es': ['lujo', 'premium', 'exclusivo', 'limitado', 'misión'],
    'de': ['luxus', 'premium', 'exklusiv', 'limitiert', 'mission'],
    'nl': ['luxe', 'premium', 'exclusief', 'beperkt', 'missie']
  };

  const localeBoosts = boosts[locale] || [];
  const hasBoostWords = localeBoosts.some(word => 
    text.toLowerCase().includes(word.toLowerCase())
  );

  return hasBoostWords ? 1.2 : 1.0;
}

/**
 * Score a content item based on title, summary, tags, and keywords
 */
export function scoreItem(
  title: string,
  summary: string,
  tags: string[],
  locale: 'en'|'fr'|'es'|'de'|'nl',
  keywords: string[],
  weight: number = 1
): ScoringResult {
  const titleResult = languageAwareMatch(title, locale, keywords);
  const summaryResult = languageAwareMatch(summary, locale, keywords);
  const tagsText = tags.join(' ');
  const tagsResult = languageAwareMatch(tagsText, locale, keywords);

  // Weighted scoring: title 40%, summary 30%, tags 30%
  const combinedScore = (
    titleResult.score * 0.4 +
    summaryResult.score * 0.3 +
    tagsResult.score * 0.3
  ) * weight;

  const allMatched = [
    ...titleResult.matched,
    ...summaryResult.matched,
    ...tagsResult.matched
  ];

  // Remove duplicates
  const uniqueMatched = [...new Set(allMatched)];

  return {
    score: Math.min(Math.round(combinedScore * 100) / 100, 1.0),
    matched: uniqueMatched
  };
}

/**
 * Test scoring function for diagnostics
 */
export function testScore(text: string, locale: 'en'|'fr'|'es'|'de'|'nl' = 'en'): ScoringResult {
  const testKeywords = {
    'en': ['luxury', 'premium', 'mission', 'reward', 'car'],
    'fr': ['luxe', 'premium', 'mission', 'récompense', 'voiture'],
    'es': ['lujo', 'premium', 'misión', 'recompensa', 'coche'],
    'de': ['luxus', 'premium', 'mission', 'belohnung', 'auto'],
    'nl': ['luxe', 'premium', 'missie', 'beloning', 'auto']
  };

  return languageAwareMatch(text, locale, testKeywords[locale]);
}

// Global diagnostics (only if debug enabled)
if (typeof window !== 'undefined' && (window.location?.search?.includes('M1_DIAG=1') || window.location?.search?.includes('M1_DIAG=true'))) {
  (window as any).__M1_FEED_DIAG__ = {
    testScore,
    sampleSourceIds: () => [
      'luxurycar_en_1', 'luxury_fr_1', 'premio_es_1', 
      'luxurycar_de_1', 'luxury_nl_1', 'prize_en_1'
    ],
    version: 'curated-v1'
  };
  
  console.log('🔍 M1SSION™ Feed Diagnostics enabled - use window.__M1_FEED_DIAG__');
}