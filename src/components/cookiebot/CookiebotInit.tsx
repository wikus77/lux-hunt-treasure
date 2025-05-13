
import React, { useEffect } from "react";
import "./cookie-script-fix.css"; // Import the CSS fix

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

      // Fix for Cookie Script buttons not being clickable
      const fixCookieScriptButtons = () => {
        const cookieScriptBannerButtons = document.querySelectorAll('.cookiescript_buttons button');
        if (cookieScriptBannerButtons.length > 0) {
          console.log("Found Cookie Script buttons, ensuring they are clickable");
          cookieScriptBannerButtons.forEach(button => {
            // Ensure buttons have proper z-index and pointer-events
            if (button instanceof HTMLElement) {
              button.style.pointerEvents = 'auto';
              button.style.position = 'relative';
              button.style.zIndex = '999999';
            }
          });
        }
      };

      // Check for Cookie Script buttons periodically after page load
      const buttonCheckInterval = setInterval(() => {
        const banner = document.querySelector('.cookiescript_badge');
        if (banner) {
          fixCookieScriptButtons();
          clearInterval(buttonCheckInterval);
        }
      }, 500);

      // Clear interval after 10 seconds to prevent infinite checking
      setTimeout(() => clearInterval(buttonCheckInterval), 10000);

      // Listen for Cookie Script events
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
        clearInterval(buttonCheckInterval);
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
        
        // If script is loaded but banner elements might have issues, try to fix them
        if (typeof window.CookieScriptConsent !== 'undefined') {
          const banner = document.querySelector('.cookiescript_badge');
          if (banner) {
            // Ensure banner is clickable
            if (banner instanceof HTMLElement) {
              banner.style.pointerEvents = 'auto';
            }
            
            // Check buttons specifically
            const acceptBtn = document.querySelector('.cookiescript_accept');
            const declineBtn = document.querySelector('.cookiescript_reject');
            
            console.log("Cookie Script buttons found:", {
              acceptButton: acceptBtn !== null,
              declineButton: declineBtn !== null
            });
          }
        }
      }
    }, 2000);

    return () => clearTimeout(checkTimer);
  }, []);

  return null; // This component doesn't render anything
};

export default CookiebotInit;
