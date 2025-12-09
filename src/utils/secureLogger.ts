// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Secure Logger - Prevents sensitive data exposure in production

const isDev = import.meta.env.DEV;

/**
 * Masks sensitive data for logging
 */
export const maskEmail = (email: string): string => {
  if (!email || typeof email !== 'string') return '[no-email]';
  const [local, domain] = email.split('@');
  if (!domain) return '[invalid-email]';
  return `${local.slice(0, 2)}***@${domain}`;
};

export const maskUserId = (userId: string): string => {
  if (!userId || typeof userId !== 'string') return '[no-id]';
  return `...${userId.slice(-8)}`;
};

export const maskToken = (token: string): string => {
  if (!token || typeof token !== 'string') return '[no-token]';
  return `${token.slice(0, 8)}...`;
};

/**
 * Secure console.log - Only logs in development
 * In production, logs are completely suppressed
 */
export const secureLog = (...args: any[]): void => {
  if (isDev) {
    console.log(...args);
  }
};

export const secureWarn = (...args: any[]): void => {
  if (isDev) {
    console.warn(...args);
  }
};

export const secureError = (...args: any[]): void => {
  // Errors are always logged but without sensitive data
  if (isDev) {
    console.error(...args);
  } else {
    // In production, log only non-sensitive error messages
    const sanitizedArgs = args.map(arg => {
      if (typeof arg === 'string') {
        // Remove potential sensitive patterns
        return arg
          .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[email]')
          .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '[uuid]')
          .replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*/g, '[jwt]');
      }
      return arg;
    });
    console.error('[M1SSION]', ...sanitizedArgs);
  }
};

/**
 * Debug log - Only in development, with prefix
 */
export const debugLog = (prefix: string, ...args: any[]): void => {
  if (isDev) {
    console.log(`[${prefix}]`, ...args);
  }
};

/**
 * Trace log for sensitive operations - masked in production
 */
export const traceLog = (message: string, data?: Record<string, any>): void => {
  if (isDev) {
    console.log(message, data || '');
  }
};

export default {
  log: secureLog,
  warn: secureWarn,
  error: secureError,
  debug: debugLog,
  trace: traceLog,
  maskEmail,
  maskUserId,
  maskToken,
};


