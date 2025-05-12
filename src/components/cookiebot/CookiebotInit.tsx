
import React, { useEffect } from "react";

/**
 * Componente che gestisce l'inizializzazione di Cookie Script CMP
 * Questo componente NON carica gli script (sono in index.html) ma
 * aggiunge solo funzionalità di helper per verificare il consenso
 */
const CookiebotInit: React.FC = () => {
  useEffect(() => {
    // Add helper function to check for consent globally
    if (typeof window !== 'undefined') {
      window.checkCookieConsent = (category: 'necessary' | 'preferences' | 'statistics' | 'marketing') => {
        if (window.CookieScriptConsent && window.CookieScriptConsent.categories) {
          return window.CookieScriptConsent.categories[category] === true;
        }
        return false;
      };
    }
  }, []);

  return null; // Questo componente non renderizza nulla
};

export default CookiebotInit;
