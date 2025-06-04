
/**
 * TURNSTILE COMPLETELY DISABLED - ALL FUNCTIONS RETURN BYPASS
 */

export const shouldBypassCaptcha = (path: string): boolean => {
  return true; // Always bypass - CAPTCHA completely disabled
};

export const shouldBypassCaptchaForUser = (email: string): boolean => {
  return true; // Always bypass - CAPTCHA completely disabled
};

export const initializeTurnstile = (userEmail?: string): Promise<void> => {
  return Promise.resolve(); // No-op - CAPTCHA disabled
};

export const getTurnstileToken = async (action: string = 'submit', userEmail?: string): Promise<string> => {
  return 'BYPASS_COMPLETELY_DISABLED'; // Always bypass
};

export const verifyTurnstileToken = async (token: string | null): Promise<{success: boolean; error?: string}> => {
  return { success: true }; // Always success
};
