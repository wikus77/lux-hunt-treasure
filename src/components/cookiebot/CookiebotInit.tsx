
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
      
      // Solo se gli script non esistono già, li aggiungiamo
      if (!mainScriptExists) {
        console.log("Aggiunta dello script principale Cookie Script (async)");
        const mainScript = document.createElement('script');
        mainScript.type = "text/javascript";
        mainScript.charset = "UTF-8";
        mainScript.src = "//cdn.cookie-script.com/s/2db074620da1ba3a3cc6c19025d1d99d.js";
        mainScript.async = true; // Imposta script come asincrono
        
        // IMPORTANTE: Prevenire il ricaricamento della pagina quando viene gestito l'evento di consenso
        window.addEventListener('CookieScriptConsent', function(e) {
          console.log('Cookie consent handled without page reload');
          e.preventDefault();
          return false;
        }, { once: false, capture: true });
        
        // FISSATO: Aggiungere attributi data per prevenire il ricaricamento
        mainScript.setAttribute('data-no-reload', 'true');
        mainScript.setAttribute('data-cs-no-reload', 'true');
        mainScript.setAttribute('data-no-duplicate', 'true'); // Previene duplicati
        mainScript.setAttribute('data-cookiescript', 'true'); // Identifica lo script correttamente
        
        // Funzione di callback dopo il caricamento
        mainScript.onload = () => {
          console.log("Cookie Script caricato con successo");
          // Configurazione dopo il caricamento
          if (window.CookieScriptConsent) {
            console.log("CookieScriptConsent trovato, impostazione preferenze");
            // Impostare cache preferences se disponibili
            try {
              const savedPreferences = localStorage.getItem('cookie_preferences');
              if (savedPreferences) {
                console.log("Ripristino preferenze cookie salvate");
              }
            } catch (e) {
              console.error("Errore nel ripristino preferenze cookie:", e);
            }
          }
        };
        
        document.head.appendChild(mainScript);
      } else {
        console.log("Script Cookie Script già presente, non verrà reinizializzato");
      }
      
      if (!reportScriptExists) {
        console.log("Aggiunta dello script report Cookie Script (async)");
        const reportScript = document.createElement('script');
        reportScript.type = "text/javascript";
        reportScript.charset = "UTF-8";
        reportScript.setAttribute("data-cookiescriptreport", "report");
        reportScript.src = "//report.cookie-script.com/r/2db074620da1ba3a3cc6c19025d1d99d.js";
        reportScript.async = true; // Imposta script come asincrono
        document.head.appendChild(reportScript);
      }
    };

    // Configurare un fallback per i servizi essenziali
    const setupEssentialFallback = () => {
      // Se dopo 3 secondi Cookie Script non è ancora inizializzato,
      // creiamo un fallback per consentire le funzionalità essenziali
      const fallbackTimer = setTimeout(() => {
        if (!window.CookieScriptConsent) {
          console.warn("Cookie Script non inizializzato dopo il timeout, configurazione fallback");
          // Impostare un oggetto fittizio per evitare errori
          window.CookieScriptConsent = {
            categories: {
              necessary: true,
              preferences: true,  // Consentiamo le preferenze per default nel fallback
              statistics: false,  // Aggiunto per conformità con il tipo richiesto
              marketing: false    // Aggiunto per conformità con il tipo richiesto
            },
            // Implementiamo i metodi richiesti come funzioni vuote
            show: () => {
              console.log("Fallback CookieScript: show called");
            },
            hide: () => {
              console.log("Fallback CookieScript: hide called");
            },
            renew: () => {
              console.log("Fallback CookieScript: renew called");
            },
            withdraw: () => {
              console.log("Fallback CookieScript: withdraw called");
            }
          };
          
          // Simulare l'evento di consenso
          const event = new Event('CookieScriptConsentFallback');
          document.dispatchEvent(event);
        }
      }, 3000);
      
      return fallbackTimer;
    };

    // FISSATO: Controllo se lo script è già caricato
    // Esecuzione immediata: se il DOM è già pronto, inizializza subito
    // SOLO SE non c'è già lo script caricato
    const { mainScriptExists } = checkScripts();
    if (mainScriptExists) {
      console.log("Cookie Script già caricato in precedenza, skip inizializzazione");
      return;
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      initializeCookieScript();
    } else {
      // Altrimenti, attendi il caricamento del DOM
      document.addEventListener('DOMContentLoaded', initializeCookieScript);
    }

    // Setup fallback per funzionalità essenziali
    const fallbackTimer = setupEssentialFallback();

    // CORREZIONE: Gestire l'evento di consenso a livello globale
    const handleCookieConsentEvent = (e: Event) => {
      console.log('Cookie consent event detected');
      e.preventDefault();
      // Non ricaricare la pagina, consentire all'applicazione di continuare
      return false;
    };

    // Aggiungere handler per diversi eventi di consenso cookie
    window.addEventListener('CookieScriptConsent', handleCookieConsentEvent, { capture: true });
    document.addEventListener('CookieScriptConsent', handleCookieConsentEvent, { capture: true });
    
    // Add helper function to check for consent globally
    window.checkCookieConsent = (category: 'necessary' | 'preferences' | 'statistics' | 'marketing') => {
      if (window.CookieScriptConsent && window.CookieScriptConsent.categories) {
        return window.CookieScriptConsent.categories[category] === true;
      }
      // Fallback: allow necessary, block others
      return category === 'necessary';
    };

    // Cleanup della sottoscrizione all'evento e timer
    return () => {
      document.removeEventListener('DOMContentLoaded', initializeCookieScript);
      window.removeEventListener('CookieScriptConsent', handleCookieConsentEvent, { capture: true });
      document.removeEventListener('CookieScriptConsent', handleCookieConsentEvent, { capture: true });
      clearTimeout(fallbackTimer);
    };
  }, []); // Eseguito solo una volta al montaggio del componente

  return null; // Questo componente non renderizza nulla
};

export default CookiebotInit;
