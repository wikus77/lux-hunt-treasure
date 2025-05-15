
import { useState, useEffect, useCallback } from "react";
import CookiebotInit from "@/components/cookiebot/CookiebotInit";
import LoadingManager from "./index/LoadingManager";
import CountdownManager from "./index/CountdownManager";
import MainContent from "./index/MainContent";
import { useEventHandlers } from "./index/EventHandlers";

const Index = () => {
  console.log("Index component rendering");
  
  // State management
  const [pageLoaded, setPageLoaded] = useState(false);
  const [renderContent, setRenderContent] = useState(false);
  const [introCompleted, setIntroCompleted] = useState(false);
  const [countdownCompleted, setCountdownCompleted] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0); // Tracking per tentativi di recovery
  
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
  
  // AGGIUNTA: Tentativo di recovery automatico in caso di problemi
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
  
  // Verifica se l'intro è già stata mostrata in precedenza
  useEffect(() => {
    try {
      // Controlla solo se introCompleted deve essere true basandosi su stato precedente
      if (typeof window !== 'undefined') {
        const skipIntro = localStorage.getItem("skipIntro");
        if (skipIntro === "true") {
          console.log("Intro already shown, skipping...");
          setIntroCompleted(true);
        } else {
          // Solo se non c'è flag, impostiamo a false (inizia l'intro)
          console.log("No skipIntro flag found, will show intro");
          setIntroCompleted(false);
          // Non rimuoviamo qui il flag, per evitare cicli infiniti
        }
      }
    } catch (error) {
      console.error("localStorage error:", error);
      // In caso di errore, assumiamo che l'intro debba essere mostrata
      setIntroCompleted(false);
    }
  }, []);

  // MIGLIORAMENTO: Protezione contro errori di rendering
  useEffect(() => {
    try {
      const observer = new MutationObserver(() => {
        const allSections = document.querySelectorAll("section");
        allSections.forEach((section) => {
          const text = section.textContent?.toLowerCase() || "";
          if (
            text.includes("cosa puoi vincere") ||
            text.includes("vuoi provarci") ||
            text.includes("premio principale") ||
            text.includes("auto di lusso")
          ) {
            section.style.display = "none";
            console.log("✅ Sezione 'Cosa puoi vincere' rimossa con MutationObserver.");
          }
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      return () => {
        observer.disconnect();
        console.log("🛑 MutationObserver disattivato.");
      };
    } catch (err) {
      console.error("Errore nel setup MutationObserver:", err);
      // Non propaghiamo questo errore, è solo per logging
    }
  }, []);
  
  // MIGLIORAMENTO: Controllo periodico della salute del componente
  useEffect(() => {
    // Se il contenuto non viene mai renderizzato dopo un certo tempo, consideriamo un errore
    const healthCheckTimeout = setTimeout(() => {
      if (!renderContent && pageLoaded) {
        console.warn("❌ Health check fallito: contenuto non renderizzato dopo 8 secondi");
        setError(new Error("Timeout di rendering del contenuto"));
      }
    }, 8000);
    
    return () => clearTimeout(healthCheckTimeout);
  }, [renderContent, pageLoaded]);
  
  // Handlers for child components
  const handleLoaded = useCallback((isLoaded: boolean, canRender: boolean) => {
    console.log("handleLoaded chiamato con:", { isLoaded, canRender });
    setPageLoaded(isLoaded);
    setRenderContent(canRender);
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

  // Console logging state for debugging
  console.log("Index render state:", { introCompleted, pageLoaded, renderContent });

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
        pageLoaded={pageLoaded}
        introCompleted={introCompleted}
        renderContent={renderContent}
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
<div className="text-white text-xl animate-glow mt-10">
  Test Animazione Glow dopo 2s
</div>
