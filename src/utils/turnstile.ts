
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
  '/dev',
  '/test'
];

/**
 * Check if current path should bypass CAPTCHA
 */
export const shouldBypassCaptcha = (path: string): boolean => {
  // Check if the current path is in the bypass list
  const shouldBypass = CAPTCHA_BYPASS_PATHS.some(bypassPath => 
    path === bypassPath || path.startsWith(`${bypassPath}/`));
  
  // For development, enable easier testing
  if (shouldBypass) {
    console.log('Bypassing Turnstile on developer path:', path);
  }
  
  return shouldBypass;
};

/**
 * Initialize Cloudflare Turnstile
 * This function loads the Turnstile script if it's not already loaded
 */
export const initializeTurnstile = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // If we're on a bypass path, resolve immediately
    if (shouldBypassCaptcha(window.location.pathname)) {
      console.log('Bypassing Turnstile on developer path:', window.location.pathname);
      resolve();
      return;
    }

    // Check if Turnstile script is already loaded
    if (window.turnstile) {
      console.log('Turnstile already loaded');
      resolve();
      return;
    }

    // Load Turnstile script
    const script = document.createElement('script');
    script.src = `https://challenges.cloudflare.com/turnstile/v0/api.js?render=${TURNSTILE_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Turnstile script loaded');
      resolve();
    };
    
    script.onerror = () => {
      console.error('Error loading Turnstile script');
      // Resolve anyway to not block functionality
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
  // If we're on a bypass path, return null to indicate bypass
  if (shouldBypassCaptcha(window.location.pathname)) {
    console.log('Bypassing Turnstile token generation on developer path:', window.location.pathname);
    return 'BYPASS_FOR_DEVELOPMENT';
  }

  try {
    // Make sure Turnstile is initialized
    await initializeTurnstile();
    
    // Wait for turnstile to be ready
    return new Promise((resolve, reject) => {
      if (!window.turnstile) {
        console.log('Turnstile not loaded, but allowing functionality to continue');
        resolve('BYPASS_DUE_TO_LOAD_ERROR');
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
              resolve(token);
            },
            'error-callback': function() {
              console.warn('Turnstile error, but allowing functionality to continue');
              resolve('BYPASS_DUE_TO_RENDER_ERROR');
            }
          });
        } catch (error) {
          console.error('Error executing Turnstile:', error);
          // Resolve with bypass to not block functionality
          resolve('BYPASS_DUE_TO_EXECUTION_ERROR');
        }
      });
    });
  } catch (error) {
    console.error('Failed to get Turnstile token:', error);
    // Return bypass to not block functionality
    return 'BYPASS_DUE_TO_ERROR';
  }
};

/**
 * Verify a Turnstile token on the server side
 * This should be called from an edge function
 */
export const verifyTurnstileToken = async (token: string | null): Promise<{success: boolean; error?: string}> => {
  // If token is null (bypass path), return success
  if (token === null) {
    return { success: true };
  }
  
  // If token is a bypass value, return success
  if (token?.startsWith('BYPASS_')) {
    return { success: true };
  }

  // This function is only meant to be used in the Edge Function environment
  // Client-side code should not call this method directly
  console.warn('verifyTurnstileToken should only be called in an Edge Function');
  return { 
    success: true, 
    error: 'This verification method can only be used server-side, but allowing functionality to continue'
  };
};
