// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Secure Logging Utility - Automatically masks sensitive data

/**
 * Patterns for sensitive data that should be masked in logs
 */
const SENSITIVE_PATTERNS = {
  // Email: show first 2 chars + domain
  email: /([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi,
  // UUID: show first 8 chars
  uuid: /([a-f0-9]{8})-([a-f0-9]{4})-([a-f0-9]{4})-([a-f0-9]{4})-([a-f0-9]{12})/gi,
  // JWT: show first 20 chars
  jwt: /(eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]+)/gi,
  // API Keys: mask if looks like key
  apiKey: /(sk_[a-zA-Z0-9]{20,}|pk_[a-zA-Z0-9]{20,})/gi,
  // Generic tokens (long alphanumeric strings)
  token: /\b([a-zA-Z0-9_-]{40,})\b/g,
};

/**
 * Mask sensitive data in a string
 */
function maskSensitiveString(str: string): string {
  if (!str || typeof str !== 'string') return str;
  
  let masked = str;
  
  // Mask emails: show first 2 chars + ***@domain
  masked = masked.replace(SENSITIVE_PATTERNS.email, (_, local, domain) => {
    const maskedLocal = local.length > 2 ? local.substring(0, 2) + '***' : '***';
    return `${maskedLocal}@${domain}`;
  });
  
  // Mask UUIDs: show first 8 chars + ...
  masked = masked.replace(SENSITIVE_PATTERNS.uuid, '$1-****-****-****-************');
  
  // Mask JWTs: show first 20 chars + ...
  masked = masked.replace(SENSITIVE_PATTERNS.jwt, (match) => match.substring(0, 20) + '...[MASKED]');
  
  // Mask API keys
  masked = masked.replace(SENSITIVE_PATTERNS.apiKey, (match) => match.substring(0, 7) + '...[MASKED]');
  
  // Mask long tokens (40+ chars)
  masked = masked.replace(SENSITIVE_PATTERNS.token, (match) => {
    // Don't mask if it's already masked or a known safe pattern
    if (match.includes('[MASKED]') || match.includes('...')) return match;
    return match.substring(0, 12) + '...[MASKED]';
  });
  
  return masked;
}

/**
 * Recursively mask sensitive data in objects
 */
function maskSensitiveData(data: unknown): unknown {
  if (data === null || data === undefined) return data;
  
  if (typeof data === 'string') {
    return maskSensitiveString(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(maskSensitiveData);
  }
  
  if (typeof data === 'object') {
    const masked: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      // Completely mask these sensitive keys
      const lowerKey = key.toLowerCase();
      if (['password', 'secret', 'private_key', 'privatekey', 'apikey', 'api_key'].includes(lowerKey)) {
        masked[key] = '[REDACTED]';
      } else if (['token', 'jwt', 'access_token', 'refresh_token', 'bearer'].includes(lowerKey)) {
        masked[key] = typeof value === 'string' && value.length > 20 
          ? value.substring(0, 20) + '...[MASKED]' 
          : '[REDACTED]';
      } else if (['email', 'user_email', 'useremail'].includes(lowerKey)) {
        masked[key] = typeof value === 'string' ? maskSensitiveString(value) : value;
      } else {
        masked[key] = maskSensitiveData(value);
      }
    }
    return masked;
  }
  
  return data;
}

/**
 * Secure console.log replacement
 * Automatically masks sensitive data before logging
 */
export function secureLog(prefix: string, ...args: unknown[]): void {
  const maskedArgs = args.map(maskSensitiveData);
  console.log(prefix, ...maskedArgs);
}

/**
 * Secure console.error replacement
 */
export function secureError(prefix: string, ...args: unknown[]): void {
  const maskedArgs = args.map(maskSensitiveData);
  console.error(prefix, ...maskedArgs);
}

/**
 * Secure console.info replacement
 */
export function secureInfo(prefix: string, ...args: unknown[]): void {
  const maskedArgs = args.map(maskSensitiveData);
  console.info(prefix, ...maskedArgs);
}

/**
 * Create a logger instance with a prefix
 */
export function createSecureLogger(prefix: string) {
  return {
    log: (...args: unknown[]) => secureLog(`[${prefix}]`, ...args),
    error: (...args: unknown[]) => secureError(`[${prefix}] ❌`, ...args),
    info: (...args: unknown[]) => secureInfo(`[${prefix}] ℹ️`, ...args),
    warn: (...args: unknown[]) => secureLog(`[${prefix}] ⚠️`, ...args),
    success: (...args: unknown[]) => secureLog(`[${prefix}] ✅`, ...args),
  };
}

/**
 * Mask a single value for inline use
 */
export function maskValue(value: string, type: 'email' | 'uuid' | 'token' = 'token'): string {
  if (!value) return '[empty]';
  
  switch (type) {
    case 'email':
      return maskSensitiveString(value);
    case 'uuid':
      return value.length >= 8 ? value.substring(0, 8) + '...' : '[invalid]';
    case 'token':
    default:
      return value.length > 20 ? value.substring(0, 20) + '...' : '[short]';
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

