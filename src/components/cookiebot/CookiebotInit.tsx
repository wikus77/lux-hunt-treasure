
import React, { useEffect } from "react";

/**
 * Component that manages Cookie Script CMP helper functions
 * This component does NOT load the script (it's in index.html)
 * but only adds helper functionality to check consent
 */
const CookiebotInit: React.FC = () => {
  useEffect(() => {
    // Add helper function to check for consent globally
    if (typeof window !== 'undefined') {
      // Only add the helper function if it doesn't already exist
      if (!window.checkCookieConsent) {
        window.checkCookieConsent = (category: 'necessary' | 'preferences' | 'statistics' | 'marketing') => {
          if (window.CookieScriptConsent && window.CookieScriptConsent.categories) {
            return window.CookieScriptConsent.categories[category] === true;
          }
          return false;
        };
        console.log("Cookie consent helper function initialized");
      }

      // Add event listener for CookieScript events
      const cookieConsentListener = () => {
        console.log("Cookie consent updated:", window.CookieScriptConsent);
        // Check if cookie is actually set
        const cookieExists = document.cookie.split(';').some(c => c.trim().startsWith('CookieScriptConsent='));
        console.log("CookieScriptConsent cookie exists:", cookieExists);
      };

      // Listen for Cookie Script events
      document.addEventListener('cookieScriptAccept', cookieConsentListener);
      document.addEventListener('cookieScriptDecline', cookieConsentListener);

      return () => {
        document.removeEventListener('cookieScriptAccept', cookieConsentListener);
        document.removeEventListener('cookieScriptDecline', cookieConsentListener);
      };
    }
  }, []);

  // Debug function to check if the Cookie Script initialization is working
  useEffect(() => {
    // Delayed check for Cookie Script initialization
    const checkTimer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        console.log("Cookie Script initialized check:", {
          scriptLoaded: typeof window.CookieScriptConsent !== 'undefined',
          bannerVisible: document.querySelector('.cookiescript_badge') !== null,
          cookieExists: document.cookie.split(';').some(c => c.trim().startsWith('CookieScriptConsent=')),
        });
      }
    }, 2000);

    return () => clearTimeout(checkTimer);
  }, []);

  return null; // This component doesn't render anything
};

export default CookiebotInit;
