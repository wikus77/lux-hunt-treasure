import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import CookiebotInit from "@/components/cookiebot/CookiebotInit";
import LoadingManager from "./index/LoadingManager";
import CountdownManager from "./index/CountdownManager";
import MainContent from "./index/MainContent";
import { useEventHandlers } from "./index/EventHandlers";
import DeveloperAccess from "@/components/auth/DeveloperAccess";

// ✅ BLOCCO FORZATO LANDING PAGE SU iOS / Capacitor / accesso già concesso
if (typeof window !== "undefined") {
  const isCapacitor = !!(window as any).Capacitor;
  const hasAccess = localStorage.getItem("developer_access") === "granted";
  const url = new URL(window.location.href);
  const force = url.searchParams.get("force") === "true";

  if (isCapacitor || hasAccess || force) {
    console.warn("🚫 Landing bloccata – Redirect forzato a /home");
    localStorage.setItem("developer_access", "granted");
    window.location.href = "/home";
  }
}

const Index = () => {
  // ✅ Redirect automatico se sessione attiva
  useEffect(() => {
    const forceRedirectOrGrantAccess = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        console.log("✅ Sessione trovata, redirect a /home");
        window.location.href = "/home";
        return;
      }

      console.warn("❌ Nessuna sessione trovata – forzatura accesso per test");
      localStorage.setItem("developer_access", "granted");
      window.location.href = "/home";
    };

    forceRedirectOrGrantAccess();
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
      }

      const isCapacitorApp = !!(window as any).Capacitor;
      const userAgent = navigator.userAgent;
      const isMobile = /iPhone|iPad|iPod|Android|Mobile/i.test(userAgent) || isCapacitorApp;
      const hasStoredAccess = localStorage.getItem("developer_access") === "granted";

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
        setError(null);
        setRetryCount((prev) => prev + 1);
      }, 2000);
      return () => clearTimeout(recoveryTimeout);
    }
  }, [error, retryCount]);

  useEffect(() => {
    try {
      const skipIntro = localStorage.getItem("skipIntro");
      if (skipIntro === "true") {
        setIntroCompleted(true);
      } else {
        setIntroCompleted(false);
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
          }
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      return () => observer.disconnect();
    } catch (err) {
      console.error("Errore nel setup MutationObserver:", err);
    }
  }, []);

  useEffect(() => {
    const healthCheckTimeout = setTimeout(() => {
      if (!renderContent && pageLoaded) {
        setError(new Error("Timeout di rendering del contenuto"));
      }
    }, 8000);
    return () => clearTimeout(healthCheckTimeout);
  }, [renderContent, pageLoaded]);

  const handleLoaded = useCallback((isLoaded: boolean, canRender: boolean) => {
    setPageLoaded(isLoaded);
    setRenderContent(canRender);
  }, []);

  const handleIntroComplete = useCallback(() => {
    setIntroCompleted(true);
    try {
      localStorage.setItem("skipIntro", "true");
    } catch (error) {
      console.error("Error setting localStorage:", error);
    }
  }, []);

  const handleCountdownComplete = useCallback((isCompleted: boolean) => {
    setCountdownCompleted(isCompleted);
  }, []);

  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  const handleAccessGranted = useCallback(() => {
    setShowDeveloperAccess(false);
    window.location.href = "/home";
  }, []);

  if (showDeveloperAccess) {
    return <DeveloperAccess onAccessGranted={handleAccessGranted} />;
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
