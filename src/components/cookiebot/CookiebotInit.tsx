
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
    }
  }, []);

  return null; // This component doesn't render anything
};

export default CookiebotInit;
