/**
 * © 2025 Joseph MULÉ – M1SSION™ Pro Scoring Engine
 * Advanced content scoring with recency, category, language and keyword boosts
 * 
 * NOTE: DO NOT TOUCH PUSH CHAIN - This is for feed scoring only
 */

import type { ScoringResult } from './textScoring';
import { languageAwareMatch } from './textScoring';

export interface ProScoringConfig {
  enableRecencyDecay: boolean;
  enableCategoryBoost: boolean;
  enableLanguageBoost: boolean;
  enableKeywordBoost: boolean;
  minScore: number;
  maxAgeHours: number;
}

export interface ContentItem {
  title: string;
  summary?: string;
  tags?: string[];
  publishedAt: Date | string;
  locale: 'en'|'fr'|'es'|'de'|'nl';
  category?: string;
  url?: string;
}

export interface ProScoringResult extends ScoringResult {
  baseScore: number;
  recencyFactor: number;
  categoryBoost: number;
  languageBoost: number;
  keywordBoost: number;
  ageHours: number;
}

// Category weights for scoring boost
const CATEGORY_WEIGHTS: Record<string, number> = {
  'auto': 1.15,        // Luxury cars get highest boost
  'luxury': 1.15,      // Luxury lifestyle
  'watches': 1.10,     // Watches and timepieces
  'yacht': 1.08,       // Yachts and marine luxury
  'jet': 1.05,         // Private jets
  'prize': 1.05,       // Contests and prizes
  'mission': 1.05,     // Missions and challenges
  'lifestyle': 1.0,    // General lifestyle
  'default': 1.0       // Default category
};

// Premium keywords that give additional boost
const PREMIUM_KEYWORDS: Record<string, string[]> = {
  'en': [
    'mission', 'premio', 'prize', 'reward', 'contest', 'giveaway',
    'ferrari', 'bugatti', 'mclaren', 'lamborghini', 'porsche', 'rolls royce',
    'rolex', 'patek philippe', 'audemars piguet', 'vacheron constantin',
    'hypercar', 'supercar', 'limited edition', 'bespoke', 'exclusive',
    'superyacht', 'private jet', 'luxury villa'
  ],
  'fr': [
    'mission', 'prix', 'concours', 'récompense', 'tirage',
    'ferrari', 'bugatti', 'mclaren', 'lamborghini', 'porsche', 'rolls royce',
    'rolex', 'patek philippe', 'audemars piguet', 'vacheron constantin',
    'hypercar', 'supercar', 'édition limitée', 'sur mesure', 'exclusif',
    'superyacht', 'jet privé', 'villa de luxe'
  ],
  'es': [
    'misión', 'premio', 'concurso', 'recompensa', 'sorteo',
    'ferrari', 'bugatti', 'mclaren', 'lamborghini', 'porsche', 'rolls royce',
    'rolex', 'patek philippe', 'audemars piguet', 'vacheron constantin',
    'hypercar', 'superdeportivo', 'edición limitada', 'a medida', 'exclusivo',
    'superyate', 'jet privado', 'villa de lujo'
  ],
  'de': [
    'mission', 'preis', 'gewinnspiel', 'belohnung', 'verlosung',
    'ferrari', 'bugatti', 'mclaren', 'lamborghini', 'porsche', 'rolls royce',
    'rolex', 'patek philippe', 'audemars piguet', 'vacheron constantin',
    'hypercar', 'supersportwagen', 'limitierte auflage', 'maßgeschneidert', 'exklusiv',
    'superyacht', 'privatjet', 'luxusvilla'
  ],
  'nl': [
    'missie', 'prijs', 'wedstrijd', 'beloning', 'winactie',
    'ferrari', 'bugatti', 'mclaren', 'lamborghini', 'porsche', 'rolls royce',
    'rolex', 'patek philippe', 'audemars piguet', 'vacheron constantin',
    'hypercar', 'supercar', 'gelimiteerde editie', 'op maat', 'exclusief',
    'superjacht', 'privéjet', 'luxevilla'
  ]
};

/**
 * Calculate recency decay factor using exponential decay
 */
function calculateRecencyFactor(publishedAt: Date | string, decayHalfLife: number = 72): number {
  const now = new Date();
  const pubDate = typeof publishedAt === 'string' ? new Date(publishedAt) : publishedAt;
  const ageHours = (now.getTime() - pubDate.getTime()) / (1000 * 60 * 60);
  
  // Exponential decay: score *= exp(-ageHours / halfLife)
  return Math.exp(-ageHours / decayHalfLife);
}

/**
 * Get category boost based on content tags and category
 */
function getCategoryBoost(item: ContentItem): number {
  const tags = item.tags || [];
  const category = item.category?.toLowerCase() || '';
  
  // Check for specific category matches
  for (const [key, weight] of Object.entries(CATEGORY_WEIGHTS)) {
    if (key === 'default') continue;
    
    if (category.includes(key) || tags.some(tag => tag.toLowerCase().includes(key))) {
      return weight;
    }
  }
  
  return CATEGORY_WEIGHTS.default;
}

/**
 * Get language boost if content locale matches user preference
 */
function getLanguageBoost(contentLocale: string, userLocale?: string): number {
  if (!userLocale || contentLocale === userLocale) {
    return 1.05; // Small boost for matching language
  }
  return 1.0;
}

/**
 * Get keyword boost for premium terms
 */
function getKeywordBoost(item: ContentItem): number {
  const locale = item.locale;
  const premiumKeywords = PREMIUM_KEYWORDS[locale] || [];
  const contentText = `${item.title} ${item.summary || ''} ${(item.tags || []).join(' ')}`.toLowerCase();
  
  let boostCount = 0;
  for (const keyword of premiumKeywords) {
    if (contentText.includes(keyword.toLowerCase())) {
      boostCount++;
    }
  }
  
  // Each premium keyword adds 3% boost, capped at 15%
  return 1.0 + Math.min(boostCount * 0.03, 0.15);
}

/**
 * Advanced content scoring with multiple factors
 */
export function scoreContentPro(
  item: ContentItem,
  keywords: string[],
  config: ProScoringConfig,
  userLocale?: string
): ProScoringResult {
  // Get base score using existing algorithm
  const baseResult = languageAwareMatch(
    `${item.title} ${item.summary || ''} ${(item.tags || []).join(' ')}`,
    item.locale,
    keywords
  );
  
  let finalScore = baseResult.score;
  const pubDate = typeof item.publishedAt === 'string' ? new Date(item.publishedAt) : item.publishedAt;
  const ageHours = (new Date().getTime() - pubDate.getTime()) / (1000 * 60 * 60);
  
  // Apply age filter first
  if (config.maxAgeHours > 0 && ageHours > config.maxAgeHours) {
    return {
      ...baseResult,
      baseScore: baseResult.score,
      recencyFactor: 0,
      categoryBoost: 1,
      languageBoost: 1,
      keywordBoost: 1,
      ageHours,
      score: 0 // Filtered out due to age
    };
  }
  
  // Calculate enhancement factors
  const recencyFactor = config.enableRecencyDecay ? calculateRecencyFactor(item.publishedAt) : 1.0;
  const categoryBoost = config.enableCategoryBoost ? getCategoryBoost(item) : 1.0;
  const languageBoost = config.enableLanguageBoost ? getLanguageBoost(item.locale, userLocale) : 1.0;
  const keywordBoost = config.enableKeywordBoost ? getKeywordBoost(item) : 1.0;
  
  // Apply all boosts
  if (config.enableRecencyDecay) finalScore *= recencyFactor;
  if (config.enableCategoryBoost) finalScore *= categoryBoost;
  if (config.enableLanguageBoost) finalScore *= languageBoost;
  if (config.enableKeywordBoost) finalScore *= keywordBoost;
  
  // Clamp to [0, 1]
  finalScore = Math.max(0, Math.min(1, finalScore));
  
  return {
    ...baseResult,
    score: Math.round(finalScore * 100) / 100,
    baseScore: baseResult.score,
    recencyFactor,
    categoryBoost,
    languageBoost,
    keywordBoost,
    ageHours
  };
}

/**
 * Default configuration for pro scoring
 */
export const DEFAULT_PRO_CONFIG: ProScoringConfig = {
  enableRecencyDecay: true,
  enableCategoryBoost: true,
  enableLanguageBoost: true,
  enableKeywordBoost: true,
  minScore: 0.72,
  maxAgeHours: 72
};

/**
 * Filter items by quality thresholds
 */
export function filterByQuality(
  items: Array<{ score: number; publishedAt: Date | string; url?: string }>,
  config: ProScoringConfig
): Array<{ score: number; publishedAt: Date | string; url?: string; filterReason?: string }> {
  return items.map(item => {
    const ageHours = (new Date().getTime() - new Date(item.publishedAt).getTime()) / (1000 * 60 * 60);
    
    if (ageHours > config.maxAgeHours) {
      return { ...item, score: 0, filterReason: 'too_old' };
    }
    
    if (item.score < config.minScore) {
      return { ...item, score: 0, filterReason: 'low_score' };
    }
    
    return item;
  });
}

/**
 * Normalize URL for deduplication
 */
export function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Remove common tracking parameters
    const paramsToRemove = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'];
    paramsToRemove.forEach(param => urlObj.searchParams.delete(param));
    
    // Remove fragment (anchor)
    urlObj.hash = '';
    
    // Normalize trailing slash
    if (urlObj.pathname.endsWith('/') && urlObj.pathname.length > 1) {
      urlObj.pathname = urlObj.pathname.slice(0, -1);
    }
    
    return urlObj.toString().toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

/**
 * Rate limiter for content processing
 */
export class ContentRateLimiter {
  private counters = new Map<string, { count: number; resetTime: number }>();
  
  canProcess(locale: string, category: string, maxPerHour: number = 3): boolean {
    const key = `${locale}:${category}`;
    const now = Date.now();
    const hourMs = 60 * 60 * 1000;
    
    let counter = this.counters.get(key);
    if (!counter || now > counter.resetTime) {
      counter = { count: 0, resetTime: now + hourMs };
      this.counters.set(key, counter);
    }
    
    if (counter.count >= maxPerHour) {
      return false;
    }
    
    counter.count++;
    return true;
  }
  
  reset(): void {
    this.counters.clear();
  }
}

// Global diagnostics (only if debug enabled) - DO NOT TOUCH PUSH CHAIN
if (typeof window !== 'undefined' && (window.location?.search?.includes('FEED_DIAG=1') || window.location?.search?.includes('FEED_DIAG=true'))) {
  (window as any).__M1_FEED_DIAG__ = {
    ...(window as any).__M1_FEED_DIAG__,
    scoreContentPro,
    filterByQuality,
    normalizeUrl,
    ContentRateLimiter,
    CATEGORY_WEIGHTS,
    PREMIUM_KEYWORDS,
    version: 'pro-scoring-v1',
    stats: {
      lastRun: null,
      itemsProcessed: 0,
      averageScore: 0,
      discardReasons: {
        tooOld: 0,
        lowScore: 0,
        duplicate: 0,
        rateLimited: 0
      }
    }
  };
  
  console.log('🎯 M1SSION™ Pro Feed Scoring Diagnostics enabled - use window.__M1_FEED_DIAG__');
}