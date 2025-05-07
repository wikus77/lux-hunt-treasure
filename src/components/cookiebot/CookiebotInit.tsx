
import { useEffect, useState } from 'react';

// Componente migliorato per l'inizializzazione e il debug di Cookiebot
const CookiebotInit = () => {
  const [initAttempts, setInitAttempts] = useState(0);
  const [cookiebotLoaded, setCookiebotLoaded] = useState(false);
  
  useEffect(() => {
    // Funzione per verificare lo stato di Cookiebot
    const checkCookiebotStatus = () => {
      if (window.Cookiebot) {
        console.log("✅ Cookiebot rilevato:", window.Cookiebot);
        setCookiebotLoaded(true);
        return true;
      }
      console.log("❌ Cookiebot non rilevato");
      return false;
    };
    
    // Funzione per forzare la visualizzazione del banner
    const forceCookiebotDisplay = () => {
      if (!window.Cookiebot) return false;
      
      try {
        // Prima proviamo il metodo show se disponibile
        if (typeof window.Cookiebot.show === 'function') {
          console.log("🔄 Tentativo di esecuzione Cookiebot.show()");
          window.Cookiebot.show();
          return true;
        }
        
        // Altrimenti proviamo il metodo renew
        if (typeof window.Cookiebot.renew === 'function') {
          console.log("🔄 Tentativo di esecuzione Cookiebot.renew()");
          window.Cookiebot.renew();
          return true;
        }
        
        // Se entrambi i metodi falliscono, proviamo a ritirare il consenso
        if (typeof window.Cookiebot.withdraw === 'function') {
          console.log("🔄 Tentativo di esecuzione Cookiebot.withdraw()");
          window.Cookiebot.withdraw();
          return true;
        }
        
        console.log("⚠️ Nessun metodo di visualizzazione disponibile in Cookiebot");
        return false;
      } catch (error) {
        console.error("❌ Errore durante il tentativo di mostrare Cookiebot:", error);
        return false;
      }
    };
    
    // Funzione per reinizializzare Cookiebot da zero
    const reinitializeCookiebot = () => {
      setInitAttempts(prev => prev + 1);
      console.log(`🔄 Reinizializzazione di Cookiebot (tentativo ${initAttempts + 1})`);
      
      // Rimuovi lo script esistente se presente
      const existingScript = document.getElementById('Cookiebot');
      if (existingScript) {
        existingScript.remove();
        console.log("🗑️ Rimosso script Cookiebot esistente");
      }
      
      // Crea e inserisci un nuovo script
      const script = document.createElement('script');
      script.id = 'Cookiebot';
      script.src = 'https://consent.cookiebot.com/uc.js';
      script.setAttribute('data-cbid', 'qfr87kY0ukx-ZP');
      script.setAttribute('data-blockingmode', 'auto');
      script.async = false;
      
      // Aggiungiamo un listener per sapere quando lo script è caricato
      script.onload = () => {
        console.log("✅ Script Cookiebot caricato con successo");
        // Dopo il caricamento, controlliamo se l'oggetto Cookiebot è disponibile
        setTimeout(() => {
          if (checkCookiebotStatus()) {
            forceCookiebotDisplay();
          }
        }, 500);
      };
      
      script.onerror = (error) => {
        console.error("❌ Errore nel caricamento dello script Cookiebot:", error);
      };
      
      document.head.appendChild(script);
      console.log("➕ Nuovo script Cookiebot aggiunto al DOM");
    };
    
    // Definisci una sequenza temporizzata di tentativi
    const initSequence = () => {
      // Controllo immediato
      if (checkCookiebotStatus()) {
        forceCookiebotDisplay();
        return;
      }
      
      // Se non è disponibile, pianifica una sequenza di tentativi
      const attemptTimes = [500, 1500, 3000, 5000, 8000];
      
      attemptTimes.forEach((delay, index) => {
        setTimeout(() => {
          console.log(`⏱️ Tentativo ${index + 1} di controllare Cookiebot dopo ${delay}ms`);
          
          if (checkCookiebotStatus()) {
            forceCookiebotDisplay();
          } else if (index === attemptTimes.length - 1) {
            // Se siamo all'ultimo tentativo pianificato e ancora non funziona
            console.log("⚠️ Tutti i tentativi pianificati falliti, reinizializzando Cookiebot");
            reinitializeCookiebot();
          }
        }, delay);
      });
    };
    
    // Avvia la sequenza di inizializzazione
    initSequence();
    
    // Pulisci quando il componente viene smontato
    return () => {};
  }, [initAttempts]);

  // Aggiungi un effetto per controllare di nuovo quando la pagina è completamente caricata
  useEffect(() => {
    const handleLoad = () => {
      console.log("📄 Pagina completamente caricata, verifica lo stato di Cookiebot");
      if (!cookiebotLoaded) {
        setInitAttempts(prev => prev + 1);
      }
    };
    
    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, [cookiebotLoaded]);

  // Questo componente non renderizza nulla visivamente
  return null;
};

export default CookiebotInit;
