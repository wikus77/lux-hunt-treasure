
import React, { useEffect } from "react";

/**
 * Componente che gestisce l'inizializzazione di Klaro CMP
 * Questo componente assicura che Klaro venga inizializzato correttamente
 * dopo il caricamento completo della pagina
 */
const CookiebotInit: React.FC = () => {
  useEffect(() => {
    // Funzione per inizializzare manualmente Klaro se necessario
    const initializeKlaro = () => {
      try {
        if (typeof window !== 'undefined' && typeof window.klaro !== 'undefined') {
          console.log("Klaro già inizializzato");
        } else {
          console.log("Tentativo di inizializzazione manuale di Klaro");
          // Se Klaro non è stato inizializzato, possiamo forzarne il caricamento
          const klaroScript = document.createElement('script');
          klaroScript.async = true;
          klaroScript.src = "https://api.kiprotect.com/v1/privacy-managers/5510d78d444e464c8146e1b7577972e9/klaro.js";
          document.head.appendChild(klaroScript);
        }
      } catch (error) {
        console.error("Errore durante l'inizializzazione di Klaro:", error);
      }
    };

    // Verifichiamo se la pagina è completamente caricata
    if (document.readyState === 'complete') {
      // Se la pagina è già caricata, inizializziamo Klaro dopo un breve ritardo
      // per assicurarci che l'animazione introduttiva sia terminata
      setTimeout(() => {
        initializeKlaro();
      }, 2000);
    } else {
      // Altrimenti, aspettiamo che la pagina sia completamente caricata
      window.addEventListener('load', () => {
        setTimeout(() => {
          initializeKlaro();
        }, 2000);
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
