
import React, { useEffect } from 'react';

const CookiebotInit: React.FC = () => {
  useEffect(() => {
    // Verifica se Cookiebot è già stato caricato
    if (window.Cookiebot) {
      // Impostazione del link alla privacy policy
      // Nota: questa è una soluzione client-side che funzionerà solo se Cookiebot è già stato inizializzato
      try {
        console.log("Inizializzazione Cookiebot con link alla Privacy Policy");
        
        // Questo codice può essere eseguito solo se hai accesso al backend di Cookiebot
        // Altrimenti, dovrai impostare il link manualmente dal pannello di controllo di Cookiebot
        if (window.Cookiebot.dialog) {
          window.Cookiebot.dialog.privacyPolicyLink = "https://m1ssion.com/privacy";
        }
      } catch (error) {
        console.error("Errore durante l'impostazione del link alla privacy policy", error);
      }
    } else {
      console.log("Cookiebot non ancora inizializzato");
    }
  }, []);

  return null; // Questo componente non renderizza nulla nel DOM
};

export default CookiebotInit;
