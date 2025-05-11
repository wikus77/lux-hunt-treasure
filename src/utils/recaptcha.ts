
/**
 * Google reCAPTCHA v3 utility functions
 */

// Define the SITE_KEY to use (replace with your actual key when ready)
const RECAPTCHA_SITE_KEY = "YOUR_RECAPTCHA_SITE_KEY"; // This will be replaced with the real key

/**
 * Paths that should bypass reCAPTCHA verification
 */
const CAPTCHA_BYPASS_PATHS = [
  '/email-campaign',
  '/dev-campaign-test'
];

/**
 * Check if current path should bypass CAPTCHA
 */
export const shouldBypassCaptcha = (path: string): boolean => {
  // Check if the current path is in the bypass list
  return CAPTCHA_BYPASS_PATHS.some(bypassPath => 
    path === bypassPath || path.startsWith(`${bypassPath}/`));
};

/**
 * Initialize Google reCAPTCHA v3
 * This function loads the reCAPTCHA script if it's not already loaded
 */
export const initializeRecaptcha = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // If we're on a bypass path, resolve immediately
    if (shouldBypassCaptcha(window.location.pathname)) {
      console.log('Bypassing reCAPTCHA on developer path:', window.location.pathname);
      resolve();
      return;
    }

    // Check if reCAPTCHA script is already loaded
    if (window.grecaptcha) {
      console.log('reCAPTCHA already loaded');
      resolve();
      return;
    }

    // Load reCAPTCHA script
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('reCAPTCHA script loaded');
      resolve();
    };
    
    script.onerror = () => {
      console.error('Error loading reCAPTCHA script');
      reject(new Error('Failed to load reCAPTCHA'));
    };
    
    document.head.appendChild(script);
  });
};

/**
 * Get a reCAPTCHA token for a specific action
 * @param action Action name for analytics
 * @returns Token or null if on bypass path
 */
export const getReCaptchaToken = async (action: string = 'submit'): Promise<string | null> => {
  // If we're on a bypass path, return null to indicate bypass
  if (shouldBypassCaptcha(window.location.pathname)) {
    console.log('Bypassing reCAPTCHA token generation on developer path:', window.location.pathname);
    return null;
  }

  try {
    // Make sure reCAPTCHA is initialized
    await initializeRecaptcha();
    
    // Wait for grecaptcha to be ready
    return new Promise((resolve, reject) => {
      if (!window.grecaptcha) {
        console.error('grecaptcha is not loaded');
        reject(new Error('reCAPTCHA not loaded'));
        return;
      }

      window.grecaptcha.ready(async () => {
        try {
          if (!window.grecaptcha) {
            throw new Error('grecaptcha became unavailable');
          }
          const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
          console.log('reCAPTCHA token generated for action:', action);
          resolve(token);
        } catch (error) {
          console.error('Error executing reCAPTCHA:', error);
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Failed to get reCAPTCHA token:', error);
    throw error;
  }
};

/**
 * Verify a reCAPTCHA token on the server side
 * This should be called from an edge function
 */
export const verifyReCaptchaToken = async (token: string | null): Promise<{success: boolean; score?: number; error?: string}> => {
  // If token is null (bypass path), return success
  if (token === null) {
    return { success: true, score: 1.0 };
  }

  // This function is only meant to be used in the Edge Function environment
  // Client-side code should not call this method directly
  console.error('verifyReCaptchaToken should only be called in an Edge Function');
  return { 
    success: false, 
    error: 'This verification method can only be used server-side'
  };
};
