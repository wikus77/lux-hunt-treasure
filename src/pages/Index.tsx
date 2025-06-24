
import { useState, useEffect, useCallback } from "react";
import CookiebotInit from "@/components/cookiebot/CookiebotInit";
import LoadingManager from "./index/LoadingManager";
import CountdownManager from "./index/CountdownManager";
import MainContent from "./index/MainContent";
import { useEventHandlers } from "./index/EventHandlers";
import DeveloperAccess from "@/components/auth/DeveloperAccess";

const Index = () => {
  console.log("Index component rendering - PUBLIC LANDING PAGE");
  
  // State management
  const [pageLoaded, setPageLoaded] = useState(false);
  const [renderContent, setRenderContent] = useState(false);
  const [introCompleted, setIntroCompleted] = useState(false);
  const [countdownCompleted, setCountdownCompleted] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showDeveloperAccess, setShowDeveloperAccess] = useState(false);
  
  // Check for developer access on mount - NO AUTOMATIC REDIRECTS
  useEffect(() => {
    const checkAccess = () => {
      // Check for URL parameter to reset access
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('resetDevAccess') === 'true') {
        localStorage.removeItem('developer_access');
        console.log('Developer access reset via URL parameter');
      }
      
      // Enhanced mobile detection including Capacitor
      const isCapacitorApp = !!(window as any).Capacitor;
      const userAgent = navigator.userAgent;
      const isMobile = /iPhone|iPad|iPod|Android|Mobile/i.test(userAgent) || isCapacitorApp;
      
      console.log('Index access check:', { isMobile, isCapacitorApp });
      
      // CRITICAL: Landing page is always accessible for web users
      // Mobile users may see developer access but NO automatic redirects
      if (isMobile) {
        setShowDeveloperAccess(true);
      } else {
        setShowDeveloperAccess(false);
      }
    };
    
    checkAccess();
  }, []);
  
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
  
  // Recovery automatico in caso di problemi
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
      if (typeof window !== 'undefined') {
        const skipIntro = localStorage.getItem("skipIntro");
        if (skipIntro === "true") {
          console.log("Intro already shown, skipping...");
          setIntroCompleted(true);
        } else {
          console.log("No skipIntro flag found, will show intro");
          setIntroCompleted(false);
        }
      }
    } catch (error) {
      console.error("localStorage error:", error);
      setIntroCompleted(false);
    }
  }, []);

  // Protezione contro errori di rendering
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
    }
  }, []);
  
  // Controllo periodico della salute del componente
  useEffect(() => {
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

  const handleIntroComplete = useCallback(() => {
    console.log("Intro completed callback, setting introCompleted to true");
    setIntroCompleted(true);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem("skipIntro", "true");
      }
    } catch (error) {
      console.error("Error setting localStorage:", error);
    }
  }, []);

  const handleCountdownComplete = useCallback((isCompleted: boolean) => {
    setCountdownCompleted(isCompleted);
  }, []);

  const handleRetry = useCallback(() => {
    console.log("Retry richiesto dall'utente");
    window.location.reload();
  }, []);

  // Show developer access screen for mobile users without access
  if (showDeveloperAccess) {
    return <DeveloperAccess />;
  }

  console.log("Index render state:", { introCompleted, pageLoaded, renderContent });

  return (
    <div className="min-h-screen flex flex-col w-full bg-black overflow-x-hidden full-viewport smooth-scroll">
      <CookiebotInit />
      
      <LoadingManager onLoaded={handleLoaded} />
      
      <CountdownManager onCountdownComplete={handleCountdownComplete} />
      
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
