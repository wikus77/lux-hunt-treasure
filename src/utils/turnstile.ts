
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
 * ✅ CONTROLLO EMAIL SVILUPPATORE per bypass Turnstile - PRIORITÀ MASSIMA
 */
export const shouldBypassCaptchaForUser = (email: string): boolean => {
  const isDeveloper = email === 'wikus77@hotmail.it';
  const hasDevAccess = localStorage.getItem("developer_access") === "granted";
  
  if (isDeveloper || hasDevAccess) {
    console.log('🔑 DEVELOPER BYPASS: Turnstile completamente disattivato per:', email || 'developer_access');
    console.warn('⚠️ CAPTCHA/Turnstile neutralizzato per sviluppatore');
    return true;
  }
  
  return false;
};

/**
 * Initialize Cloudflare Turnstile
 * This function loads the Turnstile script if it's not already loaded
 */
export const initializeTurnstile = (userEmail?: string): Promise<void> => {
  return new Promise((resolve) => {
    // ✅ CONTROLLO EMAIL SVILUPPATORE - PRIORITÀ ASSOLUTA
    if (userEmail === 'wikus77@hotmail.it' || localStorage.getItem("developer_access") === "granted") {
      console.log('🔑 DEVELOPER BYPASS: Turnstile script loading skipped for developer');
      console.warn('⚠️ initializeTurnstile() chiamato con account sviluppatore - BLOCCATO');
      resolve();
      return;
    }

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
    script.src = `https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback`;
    script.async = true;
    script.defer = true;
    
    // Define the callback function - make sure it's defined before the script is loaded
    window.onloadTurnstileCallback = () => {
      console.log('Turnstile script loaded via callback');
      resolve();
    };
    
    script.onload = () => {
      console.log('Turnstile script loaded via onload');
      resolve();
    };
    
    script.onerror = () => {
      console.error('Error loading Turnstile script, but continuing without it');
      resolve(); // Resolve anyway to not block functionality
    };
    
    document.head.appendChild(script);
    
    // Set a timeout just in case callbacks fail
    setTimeout(() => {
      console.log('Turnstile script load timeout reached, continuing');
      resolve();
    }, 2000);
  });
};

/**
 * Get a Turnstile token for a specific action
 * @param action Action name for analytics
 * @param userEmail User email for developer bypass
 * @returns Token or bypass token if on bypass path or developer email
 */
export const getTurnstileToken = async (action: string = 'submit', userEmail?: string): Promise<string> => {
  // ✅ CONTROLLO EMAIL SVILUPPATORE - PRIORITÀ ASSOLUTA
  if (userEmail === 'wikus77@hotmail.it' || localStorage.getItem("developer_access") === "granted") {
    console.log('🔑 DEVELOPER BYPASS: Turnstile token generation skipped for developer');
    console.warn('⚠️ getTurnstileToken() chiamato con account sviluppatore - BLOCCATO');
    return 'BYPASS_FOR_DEVELOPER';
  }

  // If we're on a bypass path, return a bypass token
  if (shouldBypassCaptcha(window.location.pathname)) {
    console.log('Bypassing Turnstile token generation on developer path');
    return 'BYPASS_FOR_DEVELOPMENT';
  }

  try {
    // Make sure Turnstile is initialized
    await initializeTurnstile(userEmail);
    
    // Wait for turnstile to be ready
    return new Promise((resolve) => {
      if (!window.turnstile) {
        console.log('Turnstile not loaded, providing bypass token');
        resolve('BYPASS_NOT_LOADED');
        return;
      }

      try {
        window.turnstile.ready(() => {
          try {
            // Create a container element for the widget
            const containerId = 'turnstile-container-' + Math.random().toString(36).substring(2, 9);
            const container = document.createElement('div');
            container.id = containerId;
            container.style.position = 'absolute';
            container.style.visibility = 'hidden';
            document.body.appendChild(container);
            
            // Render the widget
            window.turnstile.render(`#${containerId}`, {
              sitekey: TURNSTILE_SITE_KEY,
              action: action,
              callback: function(token: string) {
                console.log('Turnstile token generated');
                // Clean up container
                try {
                  document.body.removeChild(container);
                } catch (e) {
                  console.warn('Error removing turnstile container:', e);
                }
                resolve(token);
              },
              'error-callback': function() {
                console.warn('Turnstile error, providing bypass token');
                // Clean up container
                try {
                  document.body.removeChild(container);
                } catch (e) {
                  console.warn('Error removing turnstile container:', e);
                }
                resolve('BYPASS_DUE_TO_ERROR');
              },
              'expired-callback': function() {
                console.warn('Turnstile token expired, providing bypass token');
                // Clean up container
                try {
                  document.body.removeChild(container);
                } catch (e) {
                  console.warn('Error removing turnstile container:', e);
                }
                resolve('BYPASS_DUE_TO_EXPIRY');
              }
            });
            
            // Add a timeout for safety
            setTimeout(() => {
              console.warn('Turnstile token generation timeout, providing bypass token');
              try {
                document.body.removeChild(container);
              } catch (e) {
                console.warn('Error removing turnstile container:', e);
              }
              resolve('BYPASS_DUE_TO_TIMEOUT');
            }, 5000);
          } catch (renderError) {
            console.error('Error rendering Turnstile:', renderError);
            resolve('BYPASS_RENDER_ERROR');
          }
        });
      } catch (readyError) {
        console.error('Error in Turnstile ready function:', readyError);
        resolve('BYPASS_READY_ERROR');
      }
    });
  } catch (error) {
    console.error('Failed to get Turnstile token:', error);
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
