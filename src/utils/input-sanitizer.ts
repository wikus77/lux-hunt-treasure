// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Input Sanitization & XSS Protection Utilities

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export const sanitizeHtml = (input: string): string => {
  if (!input) return '';
  
  // Remove HTML tags and dangerous characters
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/&lt;script/gi, '')
    .replace(/&lt;\/script&gt;/gi, '')
    .trim();
};

/**
 * Sanitize email input
 */
export const sanitizeEmail = (email: string): string => {
  if (!email) return '';
  
  return email
    .toLowerCase()
    .trim()
    .replace(/[^\w@.-]/g, '');
};

/**
 * Sanitize text input (names, titles, etc.)
 */
export const sanitizeText = (text: string): string => {
  if (!text) return '';
  
  return text
    .trim()
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .substring(0, 255); // Limit length
};

/**
 * Validate and sanitize password
 */
export const sanitizePassword = (password: string): string => {
  if (!password) return '';
  
  // Don't modify password content, just check length
  return password.length > 100 ? password.substring(0, 100) : password;
};

/**
 * Rate limiting check for client-side
 */
export const checkClientRateLimit = (key: string, maxAttempts: number = 3, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const attempts = JSON.parse(localStorage.getItem(`rate_limit_${key}`) || '[]') as number[];
  
  // Clean old attempts
  const validAttempts = attempts.filter(time => now - time < windowMs);
  
  // Check if under limit
  if (validAttempts.length >= maxAttempts) {
    return false;
  }
  
  // Add current attempt
  validAttempts.push(now);
  localStorage.setItem(`rate_limit_${key}`, JSON.stringify(validAttempts));
  
  return true;
};

/**
 * Get client IP address (best effort)
 */
export const getClientIP = (): string => {
  // This is client-side, so we can't get real IP
  // Return a fingerprint instead
  return `${navigator.userAgent.slice(0, 50)}_${screen.width}x${screen.height}`;
};