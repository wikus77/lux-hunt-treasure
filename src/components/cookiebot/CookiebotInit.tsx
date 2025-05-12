
import React, { useEffect, useRef } from "react";

/**
 * Component for initializing Cookiebot consent management
 */
const CookiebotInit: React.FC = () => {
  // Riferimento per tenere traccia se lo script è già stato caricato
  const scriptLoaded = useRef(false);

  useEffect(() => {
    // Se lo script è già caricato, non fare nulla
    if (scriptLoaded.current) return;
    
    console.log("Inizializzazione Cookiebot");
    
    try {
      // Controlla se lo script è già presente nella pagina
      const existingScript = document.querySelector('script[src*="cookie-script.com/s/"]');
      
      if (!existingScript) {
        // Carica lo script principale solo se non è già presente
        const scriptMain = document.createElement('script');
        scriptMain.type = 'text/javascript';
        scriptMain.charset = 'UTF-8';
        scriptMain.dataset.cookiescript = 'main';
        scriptMain.src = '//cdn.cookie-script.com/s/2db074620da1ba3a3cc6c19025d1d99d.js';
        scriptMain.async = true;
        document.head.appendChild(scriptMain);
        
        // Carica lo script di report
        const scriptReport = document.createElement('script');
        scriptReport.type = 'text/javascript';
        scriptReport.charset = 'UTF-8';
        scriptReport.dataset.cookiescriptreport = 'report';
        scriptReport.src = '//report.cookie-script.com/r/2db074620da1ba3a3cc6c19025d1d99d.js';
        scriptReport.async = true;
        document.head.appendChild(scriptReport);
        
        console.log("Script Cookiebot caricati");
      } else {
        console.log("Script Cookiebot già presenti, non ricaricati");
      }
      
      // Marca come caricato per evitare caricamenti multipli
      scriptLoaded.current = true;
    } catch (error) {
      console.error("Errore nell'inizializzazione di Cookiebot:", error);
    }
    
    return () => {
      // Non rimuoviamo gli script durante lo smontaggio per evitare comportamenti strani
    };
  }, []);

  // Nessun rendering visibile
  return null;
};

export default CookiebotInit;
