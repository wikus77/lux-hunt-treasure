
import React, { useEffect } from "react";

/**
 * Componente che gestisce l'inizializzazione di Cookie Script CMP
 * Questo componente assicura che Cookie Script venga inizializzato correttamente
 * dopo il caricamento completo della pagina
 */
const CookiebotInit: React.FC = () => {
  useEffect(() => {
    // Verifichiamo se gli script di Cookie Script sono già presenti
    const checkScripts = () => {
      const mainScriptExists = document.querySelector('script[src*="cdn.cookie-script.com/s/2db074620da1ba3a3cc6c19025d1d99d.js"]');
      const reportScriptExists = document.querySelector('script[src*="report.cookie-script.com/r/2db074620da1ba3a3cc6c19025d1d99d.js"]');
      
      return {
        mainScriptExists,
        reportScriptExists
      };
    };

    // Funzione per inizializzare Cookie Script se gli script non sono già presenti
    const initializeCookieScript = () => {
      const { mainScriptExists, reportScriptExists } = checkScripts();
      
      if (!mainScriptExists) {
        console.log("Aggiunta dello script principale Cookie Script");
        const mainScript = document.createElement('script');
        mainScript.type = "text/javascript";
        mainScript.charset = "UTF-8";
        mainScript.src = "//cdn.cookie-script.com/s/2db074620da1ba3a3cc6c19025d1d99d.js";
        document.head.appendChild(mainScript);
      }
      
      if (!reportScriptExists) {
        console.log("Aggiunta dello script report Cookie Script");
        const reportScript = document.createElement('script');
        reportScript.type = "text/javascript";
        reportScript.charset = "UTF-8";
        reportScript.setAttribute("data-cookiescriptreport", "report");
        reportScript.src = "//report.cookie-script.com/r/2db074620da1ba3a3cc6c19025d1d99d.js";
        document.head.appendChild(reportScript);
      }
    };

    // Esecuzione immediata: se il DOM è già pronto, inizializza subito
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      initializeCookieScript();
    } else {
      // Altrimenti, attendi il caricamento del DOM
      document.addEventListener('DOMContentLoaded', initializeCookieScript);
    }

    // Add helper function to check for consent globally
    window.checkCookieConsent = (category: 'necessary' | 'preferences' | 'statistics' | 'marketing') => {
      if (window.CookieScriptConsent && window.CookieScriptConsent.categories) {
        return window.CookieScriptConsent.categories[category] === true;
      }
      return false;
    };

    // Cleanup della sottoscrizione all'evento
    return () => {
      document.removeEventListener('DOMContentLoaded', initializeCookieScript);
    };
  }, []);

  return null; // Questo componente non renderizza nulla
};

export default CookiebotInit;
