import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import CookiebotInit from "@/components/cookiebot/CookiebotInit";
import LoadingManager from "./index/LoadingManager";
import CountdownManager from "./index/CountdownManager";
import MainContent from "./index/MainContent";
import { useEventHandlers } from "./index/EventHandlers";

const Index = () => {
  console.log("Index component rendering - PUBLIC LANDING PAGE");
  
  const navigate = useNavigate();
  
  // 🔥 IMMEDIATE CAPACITOR BYPASS - NO LANDING PAGE ON CAPACITOR
  useEffect(() => {
    const isCapacitorApp = !!(window as any).Capacitor;
    
    if (isCapacitorApp) {
      console.log("🚀 CAPACITOR DETECTED: Immediate redirect to /home - NO LANDING PAGE");
      
      // Setup developer session with VALID UUID
      const fakeUser = {
        id: "6c789e77-a58a-4135-b9ed-2d96ec4f7849", // Valid UUID for wikus77@hotmail.it
        email: "wikus77@hotmail.it",
        role: "developer",
        aud: "authenticated",
        app_metadata: { provider: "email" },
        user_metadata: { name: "Developer" },
        created_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString(),
      };
      
      // Store all necessary bypass flags
      sessionStorage.setItem('developer_bypass_user', JSON.stringify(fakeUser));
      sessionStorage.setItem('developer_bypass_active', 'true');
      sessionStorage.setItem('developer-access', 'true');
      sessionStorage.setItem('dev-bypass', 'true');
      sessionStorage.setItem('developer_magic_link_verified', 'true');
      localStorage.setItem('developer_access', 'granted');
      localStorage.setItem('developer_user_email', 'wikus77@hotmail.it');
      
      // IMMEDIATE redirect - no delays
      navigate('/home', { replace: true });
      return;
    }
  }, [navigate]);
  
  // 🔥 DEVELOPER EMAIL BYPASS
  useEffect(() => {
    const currentUserEmail = sessionStorage.getItem('email');
    if (currentUserEmail === 'wikus77@hotmail.it') {
      console.log("🔓 DEVELOPER EMAIL BYPASS: Redirecting to /home");
      navigate('/home', { replace: true });
      return;
    }
  }, [navigate]);

  // State management
  const [pageLoaded, setPageLoaded] = useState(false);
  const [renderContent, setRenderContent] = useState(false);
  const [introCompleted, setIntroCompleted] = useState(false);
  const [countdownCompleted, setCountdownCompleted] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // 🔥 BYPASS LANDING PAGE + INTRO for Capacitor or developer email
  useEffect(() => {
    const isCapacitorApp = !!(window as any).Capacitor;
    const developerEmail = sessionStorage.getItem('email') === 'wikus77@hotmail.it';
    
    if (isCapacitorApp || developerEmail) {
      console.log("🚀 BYPASS: Forcing intro and content to load immediately");
      setIntroCompleted(true);
      setPageLoaded(true);
      setRenderContent(true);
    }
  }, []);
  
  // 🔥 DEVELOPER BYPASS: Immediate check for Capacitor + developer magic link verification
  useEffect(() => {
    const checkForDeveloperBypass = async () => {
      const isCapacitorApp = !!(window as any).Capacitor;
      
      if (isCapacitorApp) {
        console.log("🔓 CAPACITOR DEVELOPER BYPASS: Checking for developer verification");
        
        // Check if magic link was verified or developer bypass is active
        const magicLinkVerified = sessionStorage.getItem('developer_magic_link_verified') === 'true';
        const developerBypassActive = sessionStorage.getItem('developer_bypass_active') === 'true';
        const developerUser = sessionStorage.getItem('developer_bypass_user');
        const developerAccess = sessionStorage.getItem('developer-access') === 'true';
        const devBypass = sessionStorage.getItem('dev-bypass') === 'true';
        
        if (magicLinkVerified || developerBypassActive || (developerUser && developerAccess) || devBypass) {
          console.log("🏠 DEVELOPER VERIFIED: Redirecting to /home immediately - BYPASS LANDING PAGE");
          navigate('/home', { replace: true });
          return;
        }
        
        // For Capacitor without verification, still auto-setup developer session for wikus77@hotmail.it
        console.log("🔧 CAPACITOR FALLBACK: Setting up developer session for this device");
        const fakeUser = {
          id: "dev-user-id",
          email: "wikus77@hotmail.it",
          role: "developer",
          aud: "authenticated",
          app_metadata: { provider: "email" },
          user_metadata: { name: "Developer" },
          created_at: new Date().toISOString(),
          email_confirmed_at: new Date().toISOString(),
        };
        
        // Store developer session for Capacitor
        sessionStorage.setItem('developer_bypass_user', JSON.stringify(fakeUser));
        sessionStorage.setItem('developer_bypass_active', 'true');
        sessionStorage.setItem('developer-access', 'true');
        sessionStorage.setItem('dev-bypass', 'true');
        
        // Immediate redirect to /home - NO LANDING PAGE ON CAPACITOR FOR DEVELOPER
        console.log("🏠 CAPACITOR DEVELOPER: Auto-redirecting to /home - SKIP LANDING");
        navigate('/home', { replace: true });
        return;
      }
    };
    
    checkForDeveloperBypass();
  }, [navigate]);
  
  // Check for developer access on mount (only for non-Capacitor)
  useEffect(() => {
    const checkAccess = () => {
      // Skip if Capacitor (already handled above)
      const isCapacitorApp = !!(window as any).Capacitor;
      if (isCapacitorApp) return;
      
      // Check for URL parameter to reset access
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('resetDevAccess') === 'true') {
        localStorage.removeItem('developer_access');
        console.log('Developer access reset via URL parameter');
      }
      
      // Enhanced mobile detection
      const userAgent = navigator.userAgent;
      const isMobile = /iPhone|iPad|iPod|Android|Mobile/i.test(userAgent);
      const hasStoredAccess = localStorage.getItem('developer_access') === 'granted';
      
      console.log('Index access check:', { isMobile, hasStoredAccess, isCapacitorApp });
      
      // TEMPORARY BYPASS: Disable Developer Access screen for all cases
      // This allows direct access to /home without authentication
      console.log('🔓 TEMPORARY BYPASS: Developer Access screen disabled for testing');
      setShowDeveloperAccess(false);
      
      // Original logic commented out for testing:
      // if (isMobile && !hasStoredAccess) {
      //   // Mobile users without access need to login
      //   setShowDeveloperAccess(true);
      // } else if (!isMobile) {
      //   // Web users always see landing page
      //   setShowDeveloperAccess(false);
      // } else {
      //   // Mobile users with access see landing page
      //   setShowDeveloperAccess(false);
      // }
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
