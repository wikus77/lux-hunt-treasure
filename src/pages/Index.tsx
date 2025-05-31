import { useState, useEffect, useCallback } from "react";
import CookiebotInit from "@/components/cookiebot/CookiebotInit";
import LoadingManager from "./index/LoadingManager";
import CountdownManager from "./index/CountdownManager";
import MainContent from "./index/MainContent";
import { useEventHandlers } from "./index/EventHandlers";
import DeveloperAccess from "@/components/auth/DeveloperAccess";

const Index = () => {
  console.log("Index component rendering - PUBLIC LANDING PAGE");

  // 🔁 Redirect automatico se sviluppatore
  useEffect(() => {
    const email = localStorage.getItem("developer_email");
    if (email === "wikus77@hotmail.it") {
      console.log("🔁 Redirect sviluppatore a /home");
      window.location.replace("/home");
    }
  }, []);

  const [pageLoaded, setPageLoaded] = useState(false);
  const [renderContent, setRenderContent] = useState(false);
  const [introCompleted, setIntroCompleted] = useState(false);
  const [countdownCompleted, setCountdownCompleted] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showDeveloperAccess, setShowDeveloperAccess] = useState(false);

  useEffect(() => {
    const checkAccess = () => {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("resetDevAccess") === "true") {
        localStorage.removeItem("developer_access");
        localStorage.removeItem("developer_email");
        console.log("🔄 Developer access reset via URL");
      }

      const isCapacitorApp = !!(window as any).Capacitor;
      const userAgent = navigator.userAgent;
      const isMobile = /iPhone|iPad|iPod|Android|Mobile/i.test(userAgent) || isCapacitorApp;
      const hasStoredAccess = localStorage.getItem("developer_access") === "granted";

      console.log("Index access check:", { isMobile, hasStoredAccess, isCapacitorApp });

      if (isMobile && !hasStoredAccess) {
        setShowDeveloperAccess(true);
      } else {
        setShowDeveloperAccess(false);
      }
    };

    checkAccess();
  }, []);

  const {
    showAgeVerification,
    showInviteFriend,
    handleRegisterClick,
    handleAgeVerified,
    openInviteFriend,
    closeAgeVerification,
    closeInviteFriend,
  } = useEventHandlers(countdownCompleted);

  useEffect(() => {
    if (error && retryCount < 2) {
      const recoveryTimeout = setTimeout(() => {
        console.log(`⚠️ Tentativo di recovery automatico #${retryCount + 1}`);
        setError(null);
        setRetryCount((prev) => prev + 1);
      }, 2000);
      return () => clearTimeout(recoveryTimeout);
    }
  }, [error, retryCount]);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
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

  useEffect(() => {
    const healthCheckTimeout = setTimeout(() => {
      if (!renderContent && pageLoaded) {
        console.warn("❌ Health check fallito: contenuto non renderizzato dopo 8 secondi");
        setError(new Error("Timeout di rendering del contenuto"));
      }
    }, 8000);
    return () => clearTimeout(healthCheckTimeout);
  }, [renderContent, pageLoaded]);

  const handleLoaded = useCallback((isLoaded: boolean, canRender: boolean) => {
    console.log("handleLoaded chiamato con:", { isLoaded, canRender });
    setPageLoaded(isLoaded);
    setRenderContent(canRender);
  }, []);

  const handleIntroComplete = useCallback(() => {
    console.log("Intro completed callback, setting introCompleted to true");
    setIntroCompleted(true);
    try {
      if (typeof window !== "undefined") {
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

  const handleAccessGranted = useCallback(() => {
    setShowDeveloperAccess(false);
    localStorage.setItem("developer_access", "granted");
    localStorage.setItem("developer_email", "wikus77@hotmail.it");
    window.location.href = "/home";
  }, []);

  if (showDeveloperAccess) {
    return <DeveloperAccess onAccessGranted={handleAccessGranted} />;
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
