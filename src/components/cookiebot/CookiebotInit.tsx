
import { useEffect, useState } from 'react';

// Componente migliorato per l'inizializzazione e il debug di Cookiebot
const CookiebotInit = () => {
  const [initAttempts, setInitAttempts] = useState(0);
  const [cookiebotLoaded, setCookiebotLoaded] = useState(false);
  const [cookiebotError, setCookiebotError] = useState<Error | null>(null);
  
  useEffect(() => {
    // Funzione per verificare lo stato di Cookiebot
    const checkCookiebotStatus = () => {
      try {
        if (window.Cookiebot) {
          console.log("✅ Cookiebot rilevato:", window.Cookiebot);
          setCookiebotLoaded(true);
          return true;
        }
        console.log("❌ Cookiebot non rilevato");
        return false;
      } catch (error) {
        console.error("❌ Errore durante il controllo di Cookiebot:", error);
        setCookiebotError(error instanceof Error ? error : new Error(String(error)));
        return false;
      }
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
        setCookiebotError(error instanceof Error ? error : new Error(String(error)));
        return false;
      }
    };
    
    // Funzione per reinizializzare Cookiebot da zero
    const reinitializeCookiebot = () => {
      setInitAttempts(prev => prev + 1);
      console.log(`🔄 Reinizializzazione di Cookiebot (tentativo ${initAttempts + 1})`);
      
      try {
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
        script.setAttribute('crossorigin', 'anonymous'); // Aggiungiamo l'attributo crossorigin
        script.async = false;
        
        // Aggiungiamo un listener per sapere quando lo script è caricato
        script.onload = () => {
          console.log("✅ Script Cookiebot caricato con successo");
          // Dopo il caricamento, controlliamo se l'oggetto Cookiebot è disponibile
          setTimeout(() => {
            try {
              if (checkCookiebotStatus()) {
                forceCookiebotDisplay();
              }
            } catch (error) {
              console.error("❌ Errore post-caricamento di Cookiebot:", error);
              setCookiebotError(error instanceof Error ? error : new Error(String(error)));
            }
          }, 500);
        };
        
        script.onerror = (error) => {
          console.error("❌ Errore nel caricamento dello script Cookiebot:", error);
          setCookiebotError(new Error("Errore nel caricamento dello script Cookiebot"));
        };
        
        document.head.appendChild(script);
        console.log("➕ Nuovo script Cookiebot aggiunto al DOM");
      } catch (error) {
        console.error("❌ Errore durante la reinizializzazione di Cookiebot:", error);
        setCookiebotError(error instanceof Error ? error : new Error(String(error)));
      }
    };
    
    // Definisci una sequenza temporizzata di tentativi
    const initSequence = () => {
      try {
        // Controllo immediato
        if (checkCookiebotStatus()) {
          forceCookiebotDisplay();
          return;
        }
        
        // Se non è disponibile, pianifica una sequenza di tentativi
        const attemptTimes = [500, 1500, 3000, 5000, 8000];
        
        attemptTimes.forEach((delay, index) => {
          setTimeout(() => {
            try {
              console.log(`⏱️ Tentativo ${index + 1} di controllare Cookiebot dopo ${delay}ms`);
              
              if (checkCookiebotStatus()) {
                forceCookiebotDisplay();
              } else if (index === attemptTimes.length - 1) {
                // Se siamo all'ultimo tentativo pianificato e ancora non funziona
                console.log("⚠️ Tutti i tentativi pianificati falliti, reinizializzando Cookiebot");
                reinitializeCookiebot();
              }
            } catch (error) {
              console.error(`❌ Errore durante il tentativo ${index + 1}:`, error);
              setCookiebotError(error instanceof Error ? error : new Error(String(error)));
            }
          }, delay);
        });
      } catch (error) {
        console.error("❌ Errore durante l'inizializzazione della sequenza:", error);
        setCookiebotError(error instanceof Error ? error : new Error(String(error)));
      }
    };
    
    // Avvia la sequenza di inizializzazione
    try {
      initSequence();
    } catch (error) {
      console.error("❌ Errore critico durante l'avvio di Cookiebot:", error);
      setCookiebotError(error instanceof Error ? error : new Error(String(error)));
    }
    
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
    
    try {
      if (document.readyState === 'complete') {
        handleLoad();
      } else {
        window.addEventListener('load', handleLoad);
        return () => window.removeEventListener('load', handleLoad);
      }
    } catch (error) {
      console.error("❌ Errore durante l'impostazione del listener di caricamento:", error);
      setCookiebotError(error instanceof Error ? error : new Error(String(error)));
    }
  }, [cookiebotLoaded]);

  // Renderizza un messaggio di errore se c'è stato un problema con Cookiebot
  if (cookiebotError) {
    console.error("Cookiebot error:", cookiebotError);
    // Non mostriamo nulla visivamente, ma logghiamo l'errore
  }

  // Questo componente non renderizza nulla visivamente
  return null;
};

export default CookiebotInit;
