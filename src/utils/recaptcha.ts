
/**
 * Legacy reCAPTCHA utility functions - COMPLETELY DISABLED
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
export const initializeRecaptcha = (): Promise<void> => {
  return Promise.resolve(); // No-op - CAPTCHA disabled
};

/**
 * Return bypass token - CAPTCHA completely disabled
 */
export const getReCaptchaToken = async (action: string = 'submit'): Promise<string | null> => {
  return 'BYPASS_COMPLETELY_DISABLED'; // Always bypass
};

/**
 * Always return success - CAPTCHA completely disabled
 */
export const verifyReCaptchaToken = async (token: string | null): Promise<{success: boolean; score?: number; error?: string}> => {
  return { success: true, score: 1.0 }; // Always success
};
