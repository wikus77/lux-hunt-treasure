
import { useEffect } from 'react';

// Questo componente si assicura che Cookiebot sia stato inizializzato correttamente
const CookiebotInit = () => {
  useEffect(() => {
    // Funzione per verificare e inizializzare Cookiebot
    const initCookiebot = () => {
      // Verifica se Cookiebot è già caricato
      if (window.Cookiebot === undefined) {
        console.log("Cookiebot non è ancora caricato, reinizializzazione...");
        
        // Forza il reload dello script Cookiebot se non è stato caricato
        const existingScript = document.getElementById('Cookiebot');
        if (existingScript) {
          existingScript.remove();
        }
        
        const script = document.createElement('script');
        script.id = 'Cookiebot';
        script.src = 'https://consent.cookiebot.com/uc.js';
        script.setAttribute('data-cbid', 'qfr87kY0ukx-ZP');
        script.setAttribute('data-blockingmode', 'auto');
        script.async = false; // Impostiamo a false per assicurarci che venga caricato in modo sincrono
        document.head.appendChild(script);
        
        console.log("Script Cookiebot reinizializzato");
        
        // Aggiungiamo un timeout per verificare se Cookiebot è stato caricato dopo un breve periodo
        setTimeout(() => {
          if (window.Cookiebot) {
            console.log("Cookiebot caricato dopo timeout:", window.Cookiebot);
            tryShowCookiebot();
          } else {
            console.log("Cookiebot ancora non disponibile dopo timeout");
          }
        }, 1000);
      } else {
        console.log("Cookiebot già caricato:", window.Cookiebot);
        tryShowCookiebot();
      }
    };
    
    // Funzione per forzare la visualizzazione del banner
    const tryShowCookiebot = () => {
      if (window.Cookiebot) {
        if (typeof window.Cookiebot.show === 'function') {
          console.log("Forzo la visualizzazione del banner Cookiebot");
          window.Cookiebot.show();
        } else {
          console.log("La funzione 'show' non è disponibile in Cookiebot");
          // Proviamo il renew come alternativa
          if (typeof window.Cookiebot.renew === 'function') {
            console.log("Eseguo Cookiebot.renew() come alternativa");
            window.Cookiebot.renew();
          }
        }
      }
    };

    // Inizializzazione immediata
    initCookiebot();
    
    // Aggiunta di un listener per l'evento DOMContentLoaded per assicurarsi che il DOM sia completamente caricato
    const handleDOMContentLoaded = () => {
      console.log("DOM completamente caricato, riprovo l'inizializzazione di Cookiebot");
      initCookiebot();
    };
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', handleDOMContentLoaded);
    } else {
      // Se il DOM è già caricato, esegui subito
      handleDOMContentLoaded();
    }
    
    // Pulizia del listener quando il componente viene smontato
    return () => {
      document.removeEventListener('DOMContentLoaded', handleDOMContentLoaded);
    };
  }, []);

  return null; // Questo componente non renderizza nulla
};

export default CookiebotInit;
