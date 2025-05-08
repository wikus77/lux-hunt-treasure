
import React, { useEffect } from 'react';

declare global {
  interface Window {
    Cookiebot: {
      show: () => void;
      hide: () => void;
      renew: () => void;
      withdraw: () => void;
      consent: {
        statistics: boolean;
        marketing: boolean;
        preferences: boolean;
        necessary: boolean;
      };
    };
  }
}

const Cookiebot = window.Cookiebot;

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
