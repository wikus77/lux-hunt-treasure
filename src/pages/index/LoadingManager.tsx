
import { useState, useEffect } from "react";
import LoadingScreen from "@/components/index/LoadingScreen";

interface LoadingManagerProps {
  onLoaded: (isLoaded: boolean, canRender: boolean) => void;
}

/**
 * Manages the loading state of the application
 * Migliorato per robustezza e resistenza al refresh
 */
const LoadingManager = ({ onLoaded }: LoadingManagerProps) => {
  const [pageLoaded, setPageLoaded] = useState(false);
  const [renderContent, setRenderContent] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [loadingTimeout, setLoadingTimeout] = useState<boolean>(false);

  // MIGLIORAMENTO: Gestione più robusta del caricamento della pagina
  useEffect(() => {
    console.log("LoadingManager montato");
    
    let isMounted = true;
    let loadTimer: number;
    let safetyTimer: number;
    
    try {
      // Timer di sicurezza - Se dopo 5 secondi non abbiamo ancora caricato, 
      // forziamo il caricamento per evitare la pagina bianca infinita
      safetyTimer = window.setTimeout(() => {
        if (isMounted && !pageLoaded) {
          console.log("⚠️ Safety timeout attivato! Forziamo il caricamento");
          setLoadingTimeout(true);
          setPageLoaded(true);
          
          // Timer per renderContent, con un piccolo ritardo
          setTimeout(() => {
            if (isMounted) {
              setRenderContent(true);
              onLoaded(true, true);
            }
          }, 200);
        }
      }, 5000);
      
      // Timer normale di caricamento
      loadTimer = window.setTimeout(() => {
        if (isMounted) {
          setPageLoaded(true);
          console.log("Page loaded state set to true");
          
          // Piccolo ritardo prima di renderizzare il contenuto effettivo
          // per garantire che l'hydration sia completata
          setTimeout(() => {
            if (isMounted) {
              setRenderContent(true);
              console.log("Content rendering enabled");
              // Notifica il componente padre che tutto è pronto
              onLoaded(true, true);
            }
          }, 200);
        }
      }, 800);
      
      // Gestione più robusta del caricamento
      const handleDocumentReady = () => {
        if (document.readyState === 'complete' && isMounted) {
          window.clearTimeout(loadTimer);
          console.log("Document ready state is complete");
          setPageLoaded(true);
          // Piccolo ritardo come sopra
          setTimeout(() => {
            if (isMounted) {
              setRenderContent(true);
              // Notifica il componente padre che tutto è pronto
              onLoaded(true, true);
            }
          }, 200);
        }
      };
      
      // Controllo immediato
      handleDocumentReady();
      
      // Anche ascolto per eventi futuri
      document.addEventListener('readystatechange', handleDocumentReady);
      window.addEventListener('load', handleDocumentReady);
      
      return () => {
        isMounted = false;
        window.clearTimeout(loadTimer);
        window.clearTimeout(safetyTimer);
        document.removeEventListener('readystatechange', handleDocumentReady);
        window.removeEventListener('load', handleDocumentReady);
        console.log("LoadingManager smontato, timer puliti");
      };
    } catch (error) {
      console.error("Errore in LoadingManager:", error);
      if (isMounted) {
        setError(error as Error);
        // Notifica il componente padre dell'errore
        onLoaded(false, false);
      }
      return () => {
        isMounted = false;
        window.clearTimeout(loadTimer);
        window.clearTimeout(safetyTimer);
      };
    }
  }, [onLoaded]);

  // Se c'è un errore durante il caricamento, notifica il componente padre
  useEffect(() => {
    if (error) {
      console.error("Loading error:", error);
    }
    
    if (loadingTimeout) {
      console.warn("Caricamento forzato dopo timeout di sicurezza");
    }
  }, [error, loadingTimeout]);

  // Durante il caricamento iniziale, mostra LoadingScreen
  if (!pageLoaded || !renderContent) {
    return <LoadingScreen />;
  }

  // Quando tutto è caricato, non rendiamo nulla qui (il componente padre gestirà il rendering)
  return null;
};

export default LoadingManager;
