/**
 * © 2025 Joseph MULÉ – M1SSION™ – Norah AI 2.0
 * UUID Normalization & Validation Utility
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Normalizes and validates a UUID string by:
 * 1. Trimming whitespace
 * 2. Stripping surrounding single/double quotes
 * 3. Validating UUID format
 * 
 * @param input - Raw UUID string (may contain quotes/whitespace)
 * @returns Clean UUID if valid, empty string otherwise
 * 
 * @example
 * normalizeUuid('"032ab1f8-99d1-4aaf-9e15-47815bbbab6a"') 
 * // → '032ab1f8-99d1-4aaf-9e15-47815bbbab6a'
 * 
 * normalizeUuid("'032ab1f8-99d1-4aaf-9e15-47815bbbab6a'") 
 * // → '032ab1f8-99d1-4aaf-9e15-47815bbbab6a'
 * 
 * normalizeUuid('invalid-uuid') 
 * // → ''
 */
export function normalizeUuid(input: string | undefined | null): string {
  if (!input) return '';
  
  // Step 1: Trim whitespace
  let cleaned = input.trim();
  
  // Step 2: Strip surrounding double quotes
  cleaned = cleaned.replace(/^"+|"+$/g, '');
  
  // Step 3: Strip surrounding single quotes  
  cleaned = cleaned.replace(/^'+|'+$/g, '');
  
  // Step 4: Final trim (in case quotes had spaces inside)
  cleaned = cleaned.trim();
  
  // Step 5: Validate UUID format
  if (!UUID_REGEX.test(cleaned)) {
    console.warn('[normalizeUuid] Invalid UUID format:', { input, cleaned });
    return '';
  }
  
  return cleaned;
}

/**
 * Generates a new UUID and returns it normalized
 * (Fail-safe wrapper around crypto.randomUUID)
 */
export function generateNormalizedUuid(): string {
  const raw = crypto.randomUUID();
  return normalizeUuid(raw);
}
