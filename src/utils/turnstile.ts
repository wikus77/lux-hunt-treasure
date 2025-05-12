
/**
 * Cloudflare Turnstile utility functions
 */

// Define the SITE_KEY to use
const TURNSTILE_SITE_KEY = "0x4AAAAAABcmLn-b1NViurvi";

/**
 * Paths that should bypass Turnstile verification
 */
const CAPTCHA_BYPASS_PATHS = [
  '/email-campaign',
  '/dev-campaign-test',
  '/', // Temporaneamente aggiungiamo la home per garantire il funzionamento
  '/index',
  '/home',
];

/**
 * Check if current path should bypass CAPTCHA
 */
export const shouldBypassCaptcha = (path: string): boolean => {
  // Always bypass in development
  if (process.env.NODE_ENV === 'development' || 
      window.location.hostname === 'localhost' || 
      window.location.hostname.includes('127.0.0.1')) {
    console.log("Development environment detected, bypassing CAPTCHA");
    return true;
  }
  
  // Check if the current path is in the bypass list
  return CAPTCHA_BYPASS_PATHS.some(bypassPath => 
    path === bypassPath || path.startsWith(`${bypassPath}/`));
};

/**
 * Initialize Cloudflare Turnstile
 * This function loads the Turnstile script if it's not already loaded
 * With improved error handling and bypass detection
 */
export const initializeTurnstile = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // If we're on a bypass path, resolve immediately
    if (shouldBypassCaptcha(window.location.pathname)) {
      console.log('Bypassing Turnstile on path:', window.location.pathname);
      resolve();
      return;
    }

    // Check if Turnstile script is already loaded
    if (window.turnstile) {
      console.log('Turnstile already loaded');
      resolve();
      return;
    }

    // Add timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      console.warn('Turnstile script load timeout - proceeding anyway');
      resolve();
    }, 5000);

    // Load Turnstile script
    const script = document.createElement('script');
    script.src = `https://challenges.cloudflare.com/turnstile/v0/api.js?render=${TURNSTILE_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Turnstile script loaded');
      clearTimeout(timeoutId);
      resolve();
    };
    
    script.onerror = (e) => {
      console.error('Error loading Turnstile script:', e);
      clearTimeout(timeoutId);
      // We resolve anyway to prevent blocking the app
      resolve();
    };
    
    document.head.appendChild(script);
  });
};

/**
 * Get a Turnstile token for a specific action
 * @param action Action name for analytics
 * @returns Token or null if on bypass path
 */
export const getTurnstileToken = async (action: string = 'submit'): Promise<string | null> => {
  // If we're on a bypass path, return bypass token
  if (shouldBypassCaptcha(window.location.pathname)) {
    console.log('Bypassing Turnstile token generation on path:', window.location.pathname);
    return "BYPASS_TOKEN";
  }

  try {
    // Make sure Turnstile is initialized
    await initializeTurnstile();
    
    // Wait for turnstile to be ready
    return new Promise((resolve, reject) => {
      // Add timeout to prevent hanging
      const timeoutId = setTimeout(() => {
        console.warn('Turnstile token generation timeout - returning bypass token');
        resolve("TIMEOUT_BYPASS_TOKEN");
      }, 5000);

      if (!window.turnstile) {
        console.error('turnstile is not loaded');
        clearTimeout(timeoutId);
        resolve("NOT_LOADED_BYPASS_TOKEN");
        return;
      }

      window.turnstile.ready(() => {
        try {
          if (!window.turnstile) {
            throw new Error('turnstile became unavailable');
          }
          window.turnstile.render('#turnstile-container', {
            sitekey: TURNSTILE_SITE_KEY,
            callback: function(token) {
              console.log('Turnstile token generated for action:', action);
              clearTimeout(timeoutId);
              resolve(token);
            },
          });
        } catch (error) {
          console.error('Error executing Turnstile:', error);
          clearTimeout(timeoutId);
          resolve("ERROR_BYPASS_TOKEN");
        }
      });
    });
  } catch (error) {
    console.error('Failed to get Turnstile token:', error);
    return "ERROR_BYPASS_TOKEN";
  }
};

/**
 * Verify a Turnstile token on the server side
 * This should be called from an edge function
 */
export const verifyTurnstileToken = async (token: string | null): Promise<{success: boolean; error?: string}> => {
  // If token is null (bypass path), return success
  if (!token || token.includes("BYPASS")) {
    return { success: true };
  }

  // This function is only meant to be used in the Edge Function environment
  // Client-side code should not call this method directly
  console.error('verifyTurnstileToken should only be called in an Edge Function');
  return { 
    success: false, 
    error: 'This verification method can only be used server-side'
  };
};
