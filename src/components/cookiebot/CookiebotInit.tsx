
import React, { useEffect } from 'react';

// Using optional chaining for safer access to Cookiebot
const cookiebot = typeof window !== "undefined" && window.Cookiebot;

const CookiebotInit: React.FC = () => {
  useEffect(() => {
    // Verifica se Cookiebot è già stato caricato
    if (window.Cookiebot) {
      // Impostazione del link alla privacy policy e cookie policy
      try {
        console.log("Inizializzazione Cookiebot con link alle policy");
        
        // Gli URL delle policy - In un'implementazione reale, questi dovrebbero essere configurati
        // direttamente nel pannello di controllo di Cookiebot
        const privacyPolicyUrl = "https://m1ssion.com/privacy";
        const cookiePolicyUrl = "https://m1ssion.com/cookie-policy";
        
        // Nota: questi URL dovranno essere configurati manualmente nel pannello di Cookiebot
        // Questa è solo una nota per ricordare all'utente di farlo
      } catch (error) {
        console.error("Errore durante l'impostazione dei link alle policy", error);
      }
    } else {
      console.log("Cookiebot non ancora inizializzato");
    }
  }, []);

  return null; // Questo componente non renderizza nulla nel DOM
};

export default CookiebotInit;
