
/**
 * CAPTCHA COMPLETELY DISABLED - ALL FUNCTIONS RETURN BYPASS
 */

export const shouldBypassCaptcha = (path: string): boolean => {
  return true; // Always bypass - CAPTCHA completely disabled
};

export const shouldBypassCaptchaForUser = (email: string): boolean => {
  return true; // Always bypass - CAPTCHA completely disabled
};

export const initializeRecaptcha = (): Promise<void> => {
  return Promise.resolve(); // No-op - CAPTCHA disabled
};

export const getReCaptchaToken = async (action: string = 'submit'): Promise<string | null> => {
  return 'BYPASS_COMPLETELY_DISABLED'; // Always bypass
};

export const verifyReCaptchaToken = async (token: string | null): Promise<{success: boolean; score?: number; error?: string}> => {
  return { success: true, score: 1.0 }; // Always success
};
