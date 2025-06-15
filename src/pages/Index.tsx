
import { useState, useEffect, useCallback } from "react";
import CookiebotInit from "@/components/cookiebot/CookiebotInit";
import LoadingManager from "./index/LoadingManager";
import CountdownManager from "./index/CountdownManager";
import MainContent from "./index/MainContent";
import { useEventHandlers } from "./index/EventHandlers";
import DeveloperAccess from "@/components/auth/DeveloperAccess";

const Index = () => {
  const [pageLoaded, setPageLoaded] = useState(false);
  const [renderContent, setRenderContent] = useState(false);
  const [introCompleted, setIntroCompleted] = useState(false);
  const [countdownCompleted, setCountdownCompleted] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showDeveloperAccess, setShowDeveloperAccess] = useState(false);

  // Verifica accesso sviluppatore e ambiente mobile
  useEffect(() => {
    const checkAccess = () => {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("resetDevAccess") === "true") {
        localStorage.removeItem("developer_access");
      }

      const isCapacitorApp = !!(window as any).Capacitor;
      const isMobile = /iPhone|iPad|iPod|Android|Mobile/i.test(navigator.userAgent) || isCapacitorApp;

      setShowDeveloperAccess(isMobile);
    };

    checkAccess();
  }, []);

  // Gestori eventi da custom hook
  const {
    showAgeVerification,
    showInviteFriend,
    handleRegisterClick,
    handleAgeVerified,
    openInviteFriend,
    closeAgeVerification,
    closeInviteFriend,
  } = useEventHandlers(countdownCompleted);

  // Sistema di retry automatico
  useEffect(() => {
    if (error && retryCount < 2) {
      const timeout = setTimeout(() => {
        setError(null);
        setRetryCount((prev) => prev + 1);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [error, retryCount]);

  // Verifica se l’intro è già stata mostrata
  useEffect(() => {
    try {
      const skipIntro = localStorage.getItem("skipIntro");
      setIntroCompleted(skipIntro === "true");
    } catch (err) {
      console.error("Errore localStorage:", err);
      setIntroCompleted(false);
    }
  }, []);

  // Rimozione sezioni obsolete da template precedenti
  useEffect(() => {
    const observer = new MutationObserver(() => {
      document.querySelectorAll("section").forEach((section) => {
        const txt = section.textContent?.toLowerCase() || "";
        if (
          txt.includes("cosa puoi vincere") ||
          txt.includes("vuoi provarci") ||
          txt.includes("premio principale") ||
          txt.includes("auto di lusso")
        ) {
          section.style.display = "none";
        }
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  // Timeout per health check
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!renderContent && pageLoaded) {
        setError(new Error("Timeout di rendering del contenuto"));
      }
    }, 8000);
    return () => clearTimeout(timeout);
  }, [renderContent, pageLoaded]);

  // Callback caricamento completato
  const handleLoaded = useCallback((isLoaded: boolean, canRender: boolean) => {
    setPageLoaded(isLoaded);
    setRenderContent(canRender);
  }, []);

  // Callback intro completata
  const handleIntroComplete = useCallback(() => {
    setIntroCompleted(true);
    try {
      localStorage.setItem("skipIntro", "true");
    } catch (err) {
      console.error("Errore salvataggio intro:", err);
    }
  }, []);

  // Callback countdown terminato
  const handleCountdownComplete = useCallback((isCompleted: boolean) => {
    setCountdownCompleted(isCompleted);
  }, []);

  // Callback retry manuale
  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  // Accesso sviluppatore su mobile
  if (showDeveloperAccess) {
    return <DeveloperAccess />;
  }

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

