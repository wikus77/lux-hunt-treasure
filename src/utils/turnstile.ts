
/**
 * Legacy Turnstile utility functions - COMPLETELY DISABLED
 * All CAPTCHA functionality has been permanently removed
 */

/**
 * Always return true for bypass - no CAPTCHA needed
 */
export const shouldBypassCaptcha = (path: string): boolean => {
  return true; // Always bypass - CAPTCHA completely disabled
};

/**
 * Always return true for developer bypass
 */
export const shouldBypassCaptchaForUser = (email: string): boolean => {
  return true; // Always bypass - CAPTCHA completely disabled
};

/**
 * No-op initialization - CAPTCHA completely disabled
 */
export const initializeTurnstile = (userEmail?: string): Promise<void> => {
  return Promise.resolve(); // No-op - CAPTCHA disabled
};

/**
 * Return bypass token - CAPTCHA completely disabled
 */
export const getTurnstileToken = async (action: string = 'submit', userEmail?: string): Promise<string> => {
  return 'BYPASS_COMPLETELY_DISABLED'; // Always bypass
};

/**
 * Always return success - CAPTCHA completely disabled
 */
export const verifyTurnstileToken = async (token: string | null): Promise<{success: boolean; error?: string}> => {
  return { success: true }; // Always success
};
