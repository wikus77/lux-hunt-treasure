// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// NORAH Multi-Intent Parser v5 - Handles compound queries

import { routeIntent, type NorahIntent } from './intentRouter';
import { normalize } from './textNormalize';

export interface ParsedIntent {
  intent: NorahIntent;
  confidence: number;
  fragment: string;
}

/**
 * Detect if input contains multiple intents
 */
export function isMultiIntent(input: string): boolean {
  if (!input || typeof input !== 'string') return false;

  // Check for common separators
  const separators = [' e ', ' e poi ', ', ', '; ', ' & ', ' più ', ' anche '];
  const hasSeparator = separators.some(sep => input.toLowerCase().includes(sep));

  // Also check for "spiega X e Y" patterns
  const multiIntentPatterns = [
    /spiega .+ e .+/i,
    /cos[ae] (sono|è) .+ e .+/i,
    /dimmi .+ e .+/i,
    /(.+) e (.+) in breve/i
  ];

  const hasPattern = multiIntentPatterns.some(pattern => pattern.test(input));

  return hasSeparator || hasPattern;
}

/**
 * Intent priority for multi-intent sorting
 */
const INTENT_PRIORITY: Record<string, number> = {
  'about_m1ssion': 10,
  'about_buzz': 9,
  'about_buzz_map': 8,
  'about_finalshot': 7,
  'about_subscriptions': 6,
  'help': 5,
  'mentor': 4,
  'progress': 3,
  'pattern': 2,
  'unknown': 0
};

/**
 * Split input into intent fragments and route each
 */
export function detectMultiIntents(input: string): ParsedIntent[] {
  if (!input || typeof input !== 'string') {
    return [];
  }

  const lower = input.toLowerCase().trim();

  // Split on common separators (added "/" support)
  const fragments = lower
    .split(/\s+e\s+|\s+e\s+poi\s+|,\s+|;\s+|\s+&\s+|\s+più\s+|\s+anche\s+|\/|\s+o\s+/i)
    .map(f => f.trim())
    .filter(f => f.length > 0);

  // If no split occurred, check for "spiega X e Y" pattern
  if (fragments.length === 1) {
    const match = lower.match(/spiega\s+(.+?)\s+e\s+(.+?)(?:\s+in\s+breve)?$/i);
    if (match && match[1] && match[2]) {
      fragments.push(match[1].trim(), match[2].trim());
    }
  }

  console.log('[MultiIntent] Fragments:', fragments);

  // Route each fragment
  const parsed: ParsedIntent[] = [];

  for (const fragment of fragments) {
    if (fragment.length < 3) continue; // Skip very short fragments

    const result = routeIntent(fragment);
    
    // Only include if confidence is reasonable
    if (result.confidence >= 0.4 && result.intent !== 'unknown') {
      parsed.push({
        intent: result.intent,
        confidence: result.confidence,
        fragment
      });
    }
  }

  // Deduplicate intents (keep highest confidence)
  const unique = new Map<NorahIntent, ParsedIntent>();
  for (const item of parsed) {
    const existing = unique.get(item.intent);
    if (!existing || item.confidence > existing.confidence) {
      unique.set(item.intent, item);
    }
  }

  // Sort by priority, then confidence
  const finalIntents = Array.from(unique.values())
    .sort((a, b) => {
      const priorityDiff = (INTENT_PRIORITY[b.intent] || 0) - (INTENT_PRIORITY[a.intent] || 0);
      if (priorityDiff !== 0) return priorityDiff;
      return b.confidence - a.confidence;
    })
    .slice(0, 3); // Max 3 intents

  console.log('[MultiIntent] Detected intents:', finalIntents);

  return finalIntents;
}
