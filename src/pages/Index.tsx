
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

  // Check for mobile or developer override
  useEffect(() => {
    const checkAccess = () => {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("resetDevAccess") === "true") {
        localStorage.removeItem("developer_access");
      }

      const isCapacitorApp = !!(window as any).Capacitor;
      const userAgent = navigator.userAgent;
      const isMobile = /iPhone|iPad|iPod|Android|Mobile/i.test(userAgent) || isCapacitorApp;

      setShowDeveloperAccess(isMobile);
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

  // Retry system
  useEffect(() => {
    if (error && retryCount < 2) {
      const timeout = setTimeout(() => {
        setError(null);
        setRetryCount((prev) => prev + 1);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [error, retryCount]);

  // Check for intro already played
  useEffect(() => {
    try {
      const skipIntro = localStorage.getItem("skipIntro");
      setIntroCompleted(skipIntro === "true");
    } catch (err) {
      console.error("LocalStorage error:", err);
      setIntroCompleted(false);
    }
  }, []);

  // Hide unwanted sections from old templates
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const sections = document.querySelectorAll("section");
      sections.forEach((section) => {
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

  // Health check timeout
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!renderContent && pageLoaded) {
        setError(new Error("Timeout di rendering del contenuto"));
      }
    }, 8000);
    return () => clearTimeout(timeout);
  }, [renderContent, pageLoaded]);

  const handleLoaded = useCallback((isLoaded: boolean, canRender: boolean) => {
    setPageLoaded(isLoaded);
    setRenderContent(canRender);
  }, []);

  const handleIntroComplete = useCallback(() => {
    setIntroCompleted(true);
    try {
      localStorage.setItem("skipIntro", "true");
    } catch (err) {
      console.error("Error saving intro skip flag:", err);
    }
  }, []);

  const handleCountdownComplete = useCallback((isCompleted: boolean) => {
    setCountdownCompleted(isCompleted);
  }, []);

  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

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
