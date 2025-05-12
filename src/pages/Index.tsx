
import { useState, useEffect, useCallback } from "react";
import CookiebotInit from "@/components/cookiebot/CookiebotInit";
import LoadingManager from "./index/LoadingManager";
import CountdownManager from "./index/CountdownManager";
import MainContent from "./index/MainContent";
import { useEventHandlers } from "./index/EventHandlers";

const Index = () => {
  console.log("Index component rendering");
  
  // State management
  const [pageLoaded, setPageLoaded] = useState(true); // IMPORTANT: Forziamo pageLoaded a true
  const [renderContent, setRenderContent] = useState(true); // IMPORTANT: Forziamo renderContent a true
  const [introCompleted, setIntroCompleted] = useState(true); // IMPORTANT: Forziamo introCompleted a true
  const [countdownCompleted, setCountdownCompleted] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Get event handlers
  const {
    showAgeVerification,
    showInviteFriend,
    handleRegisterClick,
    handleAgeVerified,
    openInviteFriend,
    closeAgeVerification,
    closeInviteFriend
  } = useEventHandlers(countdownCompleted);
  
  // MIGLIORAMENTO: Tentativo di recovery automatico in caso di problemi
  useEffect(() => {
    if (error && retryCount < 2) {
      const recoveryTimeout = setTimeout(() => {
        console.log(`⚠️ Tentativo di recovery automatico #${retryCount + 1}`);
        setError(null);
        setRetryCount(prev => prev + 1);
      }, 2000);
      
      return () => clearTimeout(recoveryTimeout);
    }
  }, [error, retryCount]);
  
  // CORREZIONE: Gestione sicura del localStorage
  useEffect(() => {
    try {
      // Per assicurarci che l'intro venga mostrata, rimuoviamo il flag dal localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem("skipIntro");
        console.log("Removed skipIntro from localStorage");
      }
    } catch (error) {
      console.error("localStorage error:", error);
    }
  }, []);

  // Forzare l'inizializzazione completa dei componenti principali
  useEffect(() => {
    console.log("Index component montato, forzando caricamento della landing page");
    setPageLoaded(true);
    setRenderContent(true);
    setIntroCompleted(true);
  }, []);
  
  // Handlers for child components
  const handleLoaded = useCallback((isLoaded: boolean, canRender: boolean) => {
    console.log("handleLoaded chiamato con:", { isLoaded, canRender });
    setPageLoaded(true); // Forziamo a true
    setRenderContent(true); // Forziamo a true
  }, []);

  // Callback per quando l'intro è completa
  const handleIntroComplete = useCallback(() => {
    console.log("Intro completed callback, setting introCompleted to true");
    setIntroCompleted(true);
    // Memorizziamo che l'intro è stata mostrata
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem("skipIntro", "true");
      }
    } catch (error) {
      console.error("Error setting localStorage:", error);
    }
  }, []);

  // Callback for when countdown completes
  const handleCountdownComplete = useCallback((isCompleted: boolean) => {
    setCountdownCompleted(isCompleted);
  }, []);

  // Function to handle page retry on error
  const handleRetry = useCallback(() => {
    console.log("Retry richiesto dall'utente");
    window.location.reload();
  }, []);

  return (
    <div className="min-h-screen flex flex-col w-full bg-black overflow-x-hidden">
      {/* CookiebotInit sempre disponibile */}
      <CookiebotInit />
      
      {/* Loading Manager */}
      <LoadingManager onLoaded={handleLoaded} />
      
      {/* Countdown Manager */}
      <CountdownManager onCountdownComplete={handleCountdownComplete} />
      
      {/* Main Content */}
      <MainContent 
        pageLoaded={true} // Forziamo a true
        introCompleted={true} // Forziamo a true
        renderContent={true} // Forziamo a true
        error={error}
        countdownCompleted={countdownCompleted}
        showAgeVerification={showAgeVerification}
        showInviteFriend={showInviteFriend}
        onIntroComplete={handleIntroComplete}
        onRetry={handleRetry}
        onRegisterClick={handleRegisterClick}
        openInviteFriend={openInviteFriend}
        onCloseAgeVerification={closeAgeVerification}
        onCloseInviteFriend={closeInviteFriend}
        onAgeVerified={handleAgeVerified}
      />
    </div>
  );
};

export default Index;
