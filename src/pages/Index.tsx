
import { useState, useEffect } from "react";
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
  
  // Handlers for child components
  const handleLoaded = (isLoaded: boolean, canRender: boolean) => {
    setPageLoaded(isLoaded);
    setRenderContent(canRender);
  };

  // Callback per quando l'intro è completa
  const handleIntroComplete = () => {
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
  };

  // Callback for when countdown completes
  const handleCountdownComplete = (isCompleted: boolean) => {
    setCountdownCompleted(isCompleted);
  };

  // Function to handle page retry on error
  const handleRetry = () => {
    window.location.reload();
  };

  // Console logging state for debugging
  console.log("Render state:", { introCompleted, pageLoaded, renderContent });

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
