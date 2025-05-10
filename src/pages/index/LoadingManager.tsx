
import { useState, useEffect } from "react";
import LoadingScreen from "@/components/index/LoadingScreen";

interface LoadingManagerProps {
  onLoaded: (isLoaded: boolean, canRender: boolean) => void;
}

/**
 * Manages the loading state of the application
 */
const LoadingManager = ({ onLoaded }: LoadingManagerProps) => {
  const [pageLoaded, setPageLoaded] = useState(false);
  const [renderContent, setRenderContent] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // MIGLIORAMENTO: Gestione più robusta del caricamento della pagina
  useEffect(() => {
    let isMounted = true;
    
    const loadTimer = setTimeout(() => {
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
        }, 100);
      }
    }, 800);
    
    // Gestione più robusta del caricamento
    const handleDocumentReady = () => {
      if (document.readyState === 'complete' && isMounted) {
        clearTimeout(loadTimer);
        console.log("Document ready state is complete");
        setPageLoaded(true);
        // Piccolo ritardo come sopra
        setTimeout(() => {
          if (isMounted) {
            setRenderContent(true);
            // Notifica il componente padre che tutto è pronto
            onLoaded(true, true);
          }
        }, 100);
      }
    };
    
    // Controllo immediato
    handleDocumentReady();
    
    // Anche ascolto per eventi futuri
    document.addEventListener('readystatechange', handleDocumentReady);
    window.addEventListener('load', handleDocumentReady);
    
    return () => {
      isMounted = false;
      clearTimeout(loadTimer);
      document.removeEventListener('readystatechange', handleDocumentReady);
      window.removeEventListener('load', handleDocumentReady);
    };
  }, [onLoaded]);

  // Se c'è un errore durante il caricamento, notifica il componente padre
  if (error) {
    console.error("Loading error:", error);
    return <LoadingScreen />;
  }

  // Durante il caricamento iniziale, mostra LoadingScreen
  if (!pageLoaded || !renderContent) {
    return <LoadingScreen />;
  }

  // Quando tutto è caricato, non rendiamo nulla qui (il componente padre gestirà il rendering)
  return null;
};

export default LoadingManager;
