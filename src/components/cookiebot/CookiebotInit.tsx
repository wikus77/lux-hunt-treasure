
import React, { useEffect } from "react";

/**
 * Componente che gestisce l'inizializzazione di Klaro CMP
 * Questo componente assicura che Klaro venga inizializzato correttamente
 * dopo il caricamento completo della pagina e l'animazione introduttiva
 */
const CookiebotInit: React.FC = () => {
  useEffect(() => {
    // Funzione per inizializzare Klaro dopo l'animazione introduttiva
    const initializeKlaro = () => {
      console.log("Inizializzazione di Klaro dopo animazione");
      
      // Se lo script è già presente, non lo aggiungiamo nuovamente
      if (document.querySelector('script[src*="5510d78d444e464c8146e1b7577972e9/klaro.js"]')) {
        console.log("Script Klaro già caricato");
        return;
      }

      // Creazione e aggiunta dello script Klaro
      try {
        const klaroScript = document.createElement('script');
        klaroScript.src = "https://api.kiprotect.com/v1/privacy-managers/5510d78d444e464c8146e1b7577972e9/klaro.js";
        klaroScript.defer = true;
        document.head.appendChild(klaroScript);
        console.log("Script Klaro caricato dinamicamente");
      } catch (error) {
        console.error("Errore durante il caricamento di Klaro:", error);
      }
    };

    // Verifichiamo se la pagina è completamente caricata
    if (document.readyState === 'complete') {
      // Se la pagina è già caricata, inizializziamo Klaro dopo un ritardo
      // per assicurarci che l'animazione introduttiva sia terminata
      setTimeout(() => {
        initializeKlaro();
      }, 4000);
    } else {
      // Altrimenti, aspettiamo che la pagina sia completamente caricata
      window.addEventListener('load', () => {
        setTimeout(() => {
          initializeKlaro();
        }, 4000);
      });
    }

    // Cleanup function
    return () => {
      window.removeEventListener('load', initializeKlaro);
    };
  }, []);

  return null; // Questo componente non renderizza nulla
};

export default CookiebotInit;
