// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Input Sanitization Utilities for SQL/API Safety

/**
 * Sanitize search input for Supabase queries
 * Removes potentially dangerous characters while preserving search functionality
 * 
 * @param input - Raw search input from user
 * @returns Sanitized string safe for database queries
 */
export const sanitizeSearchInput = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Trim whitespace
  let sanitized = input.trim();
  
  // Limit length to prevent abuse
  if (sanitized.length > 100) {
    sanitized = sanitized.substring(0, 100);
  }
  
  // Remove or escape potentially dangerous SQL characters
  // These could be used for SQL injection in raw queries
  sanitized = sanitized
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove SQL comment syntax
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    // Remove semicolons (statement terminators)
    .replace(/;/g, '')
    // Escape single quotes (double them for SQL safety)
    .replace(/'/g, "''")
    // Remove backslashes (escape characters)
    .replace(/\\/g, '')
    // Remove other potentially dangerous characters
    .replace(/[\x00-\x1F\x7F]/g, ''); // Control characters
  
  return sanitized;
};

/**
 * Sanitize input for ILIKE pattern matching
 * Escapes special LIKE pattern characters
 * 
 * @param input - Raw search input
 * @returns Sanitized string safe for ILIKE patterns
 */
export const sanitizeForIlike = (input: string): string => {
  let sanitized = sanitizeSearchInput(input);
  
  // Escape LIKE special characters
  sanitized = sanitized
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_');
  
  return sanitized;
};

/**
 * Sanitize user ID input
 * Validates UUID format
 * 
 * @param userId - Raw user ID input
 * @returns Sanitized UUID or empty string if invalid
 */
export const sanitizeUserId = (userId: string): string => {
  if (!userId || typeof userId !== 'string') {
    return '';
  }
  
  const sanitized = userId.trim().toLowerCase();
  
  // Validate UUID format (v4)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
  
  return uuidRegex.test(sanitized) ? sanitized : '';
};

/**
 * Sanitize numeric input
 * 
 * @param input - Raw numeric input
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Sanitized number or default
 */
export const sanitizeNumericInput = (
  input: string | number, 
  min: number = 0, 
  max: number = Number.MAX_SAFE_INTEGER,
  defaultValue: number = 0
): number => {
  const num = typeof input === 'string' ? parseFloat(input) : input;
  
  if (isNaN(num) || !isFinite(num)) {
    return defaultValue;
  }
  
  return Math.max(min, Math.min(max, num));
};

export default {
  sanitizeSearchInput,
  sanitizeForIlike,
  sanitizeUserId,
  sanitizeNumericInput,
};

