
import { useEffect } from 'react';

// Questo componente si assicura che Cookiebot sia stato inizializzato correttamente
const CookiebotInit = () => {
  useEffect(() => {
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
    } else {
      console.log("Cookiebot già caricato:", window.Cookiebot);
      
      // Se già caricato ma il banner non è visibile, forza la visualizzazione
      if (window.Cookiebot && typeof window.Cookiebot.show === 'function') {
        console.log("Forzo la visualizzazione del banner Cookiebot");
        window.Cookiebot.show();
      }
    }
  }, []);

  return null; // Questo componente non renderizza nulla
};

export default CookiebotInit;
