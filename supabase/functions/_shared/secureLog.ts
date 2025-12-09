// © 2025 M1SSION™ – Secure Logging for Edge Functions
// Masks sensitive data in logs

/**
 * Masks email for logging
 */
export const maskEmail = (email: string | null | undefined): string => {
  if (!email) return '[no-email]';
  const [local, domain] = email.split('@');
  if (!domain) return '[masked]';
  return `${local.slice(0, 2)}***@${domain.slice(0, 3)}***`;
};

/**
 * Masks UUID for logging (shows only last 8 chars)
 */
export const maskUserId = (userId: string | null | undefined): string => {
  if (!userId) return '[no-id]';
  return `...${userId.slice(-8)}`;
};

/**
 * Masks agent code for logging
 */
export const maskAgentCode = (code: string | null | undefined): string => {
  if (!code) return '[no-code]';
  if (code.length <= 4) return '****';
  return `${code.slice(0, 2)}**${code.slice(-2)}`;
};

/**
 * Secure trace log - masks sensitive data automatically
 */
export const secureTrace = (prefix: string, data: Record<string, any>): void => {
  const masked: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (key.toLowerCase().includes('email')) {
      masked[key] = maskEmail(value);
    } else if (key.toLowerCase().includes('user_id') || key === 'id' || key === 'userId') {
      masked[key] = maskUserId(value);
    } else if (key.toLowerCase().includes('agent_code') || key === 'agentCode') {
      masked[key] = maskAgentCode(value);
    } else if (key.toLowerCase().includes('token') || key.toLowerCase().includes('secret')) {
      masked[key] = '[REDACTED]';
    } else {
      masked[key] = value;
    }
  }
  
  console.log(`[${prefix}]`, JSON.stringify(masked));
};

export default { maskEmail, maskUserId, maskAgentCode, secureTrace };
