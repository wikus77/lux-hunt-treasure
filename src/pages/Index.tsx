import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import CookiebotInit from "@/components/cookiebot/CookiebotInit";
import LoadingManager from "./index/LoadingManager";
import CountdownManager from "./index/CountdownManager";
import MainContent from "./index/MainContent";
import { useEventHandlers } from "./index/EventHandlers";
import DeveloperAccess from "@/components/auth/DeveloperAccess";

const Index = () => {
  // Controllo sessione e redirect automatico
  useEffect(() => {
    const redirectIfAuthenticated = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        window.location.href = "/home";
        return;
      }
    };
    redirectIfAuthenticated();
  }, []);

  // Gestione developer_access
  const hasAccess = localStorage.getItem("developer_access") === "granted";
  if (hasAccess) {
    window.location.href = "/home";
    return null;
  }

  // Disabilitare Index.tsx su WebView Capacitor
  const isCapacitor = !!(window as any).Capacitor;
  if (isCapacitor) {
    window.location.href = "/home";
    return null;
  }
  
  // State management
  const [pageLoaded, setPageLoaded] = useState(false);
  const [renderContent, setRenderContent] = useState(false);
  const [introCompleted, setIntroCompleted] = useState(false);
  const [countdownCompleted, setCountdownCompleted] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showDeveloperAccess, setShowDeveloperAccess] = useState(false);
  
  // Check for developer access on mount
  useEffect(() => {
    const checkAccess = () => {
      // Check for URL parameter to reset access
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('resetDevAccess') === 'true') {
        localStorage.removeItem('developer_access');
      }
      
      // Enhanced mobile detection including Capacitor
      const isCapacitorApp = !!(window as any).Capacitor;
      const userAgent = navigator.userAgent;
      const isMobile = /iPhone|iPad|iPod|Android|Mobile/i.test(userAgent) || isCapacitorApp;
      const hasStoredAccess = localStorage.getItem('developer_access') === 'granted';
      
      if (isMobile && !hasStoredAccess) {
        // Mobile users without access need to login
        setShowDeveloperAccess(true);
      } else if (!isMobile) {
        // Web users always see landing page
        setShowDeveloperAccess(false);
      } else {
        // Mobile users with access see landing page
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
          setIntroCompleted(true);
        } else {
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
          }
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      return () => {
        observer.disconnect();
      };
    } catch (err) {
      console.error("Errore nel setup MutationObserver:", err);
    }
  }, []);
  
  // Controllo periodico della salute del componente
  useEffect(() => {
    const healthCheckTimeout = setTimeout(() => {
      if (!renderContent && pageLoaded) {
        setError(new Error("Timeout di rendering del contenuto"));
      }
    }, 8000);
    
    return () => clearTimeout(healthCheckTimeout);
  }, [renderContent, pageLoaded]);
  
  // Handlers for child components
  const handleLoaded = useCallback((isLoaded: boolean, canRender: boolean) => {
    setPageLoaded(isLoaded);
    setRenderContent(canRender);
  }, []);

  const handleIntroComplete = useCallback(() => {
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
    window.location.reload();
  }, []);

  const handleAccessGranted = useCallback(() => {
    setShowDeveloperAccess(false);
    // Redirect to home after access granted
    window.location.href = '/home';
  }, []);

  // Show developer access screen for mobile users without access
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
