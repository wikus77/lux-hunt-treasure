
// © 2025 Joseph MULÉ – CEO di NIYVORA KFT™ – M1SSION™
import React from 'react';
import { Router } from 'wouter';
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/auth/AuthProvider";
import { SoundProvider } from "./contexts/SoundContext";
import { ErrorBoundary } from "./components/error/ErrorBoundary";
import WouterRoutes from "./routes/WouterRoutes";
import ProductionSafety from "./components/debug/ProductionSafety";
import { InstallPrompt } from "./components/pwa/InstallPrompt";
import PushSetup from "./components/pwa/PushSetup";
import { AuthenticationManager } from "./components/auth/AuthenticationManager";
import { useUnifiedAuth } from "./hooks/useUnifiedAuth";
import BuzzPaymentMonitor from "./components/payment/BuzzPaymentMonitor";
import { usePushNotificationProcessor } from "./hooks/usePushNotificationProcessor";
import M1ssionRevealAnimation from "./components/intro/M1ssionRevealAnimation";
import { useState, useEffect } from "react";

import LegalOnboarding from "./components/legal/LegalOnboarding";

function App() {
  console.log("🚀 App component rendering...");
  console.log("🔍 App mount - checking for potential reload loops");
  
  // M1SSION Post-Login Animation State
  const [showM1ssionAnimation, setShowM1ssionAnimation] = useState(false);
  const [animationChecked, setAnimationChecked] = useState(false);
  
  // Initialize push notification processor
  usePushNotificationProcessor();

  // Check for post-login animation need
  useEffect(() => {
    console.log("🎬 CHECKING M1SSION ANIMATION CONDITION...");
    
    const checkAnimationCondition = () => {
      try {
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          const hasSeenAnimation = sessionStorage.getItem("m1ssionPostLoginAnimationShown");
          const isHomePage = currentPath === '/home';
          
          console.log("🎬 Animation check:", {
            currentPath,
            hasSeenAnimation,
            isHomePage,
            shouldShow: isHomePage && !hasSeenAnimation
          });
          
          // FORCE SHOW ANIMATION CONDITIONS:
          // 1. Must be on /home page
          // 2. Animation flag not set in sessionStorage
          // 3. OR if user just navigated to home (to catch redirects)
          if (isHomePage && !hasSeenAnimation) {
            console.log("🎬 ✅ FORCING M1SSION ANIMATION SHOW - CONDITIONS MET");
            setShowM1ssionAnimation(true);
          } else {
            console.log("🎬 ❌ SKIPPING M1SSION ANIMATION", { 
              reason: hasSeenAnimation ? 'already_shown_in_session' : 'not_home_page',
              currentPath,
              hasSeenAnimation: !!hasSeenAnimation
            });
          }
          
          setAnimationChecked(true);
        }
      } catch (error) {
        console.error("🎬 Error checking animation condition:", error);
        setAnimationChecked(true);
      }
    };

    // Check immediately and also on path changes
    checkAnimationCondition();
    
    // Listen for route changes (wouter doesn't have built-in listener)
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    
    window.history.pushState = function() {
      originalPushState.apply(window.history, arguments);
      setTimeout(checkAnimationCondition, 100);
    };
    
    window.history.replaceState = function() {
      originalReplaceState.apply(window.history, arguments);
      setTimeout(checkAnimationCondition, 100);
    };
    
    window.addEventListener('popstate', checkAnimationCondition);
    
    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener('popstate', checkAnimationCondition);
    };
  }, []);

  const handleAnimationComplete = () => {
    console.log("🎬 M1SSION ANIMATION COMPLETED - setting flag and hiding");
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem("m1ssionPostLoginAnimationShown", "true");
      }
    } catch (error) {
      console.error("🎬 Error setting animation completion flag:", error);
    }
    setShowM1ssionAnimation(false);
  };
  
  const handleAuthenticated = (userId: string) => {
    console.log("✅ APP LEVEL - User authenticated:", userId);
    
    // Reset animation flag on successful authentication
    try {
      if (typeof window !== 'undefined') {
        const currentFlag = sessionStorage.getItem("m1ssionPostLoginAnimationShown");
        console.log("🎬 AUTH SUCCESS - Current animation flag:", currentFlag);
        
        // Clear the flag so animation can show
        sessionStorage.removeItem("m1ssionPostLoginAnimationShown");
        console.log("🎬 AUTH SUCCESS - Animation flag cleared, ready to show on /home");
      }
    } catch (error) {
      console.error("🎬 Error clearing animation flag on auth:", error);
    }
  };
  
  const handleNotAuthenticated = () => {
    console.log("❌ APP LEVEL - User not authenticated");
  };
  
  const handleEmailNotVerified = () => {
    console.log("📧 APP LEVEL - Email not verified");
  };
  
  
  // Show M1SSION animation if conditions are met
  if (animationChecked && showM1ssionAnimation) {
    console.log("🎬 RENDERING M1SSION ANIMATION OVERLAY");
    return <M1ssionRevealAnimation onComplete={handleAnimationComplete} />;
  }
  
  console.log("🎬 RENDERING NORMAL APP (animation check complete)");
  
  return (
    <ErrorBoundary fallback={
      <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
        <div className="glass-card p-6 max-w-md mx-auto text-center">
          <h2 className="text-xl font-bold mb-4">ERRORE CRITICO DI SISTEMA</h2>
          <p className="mb-6">L'applicazione ha riscontrato un errore fatale. Ricarica la pagina.</p>
          <button 
            onClick={() => {
              // Clear all storage and reload
              localStorage.clear();
              sessionStorage.clear();
              window.location.reload();
            }}
            className="px-4 py-2 bg-gradient-to-r from-m1ssion-blue to-m1ssion-pink rounded-md"
          >
            🔄 RIAVVIA EMERGENZA
          </button>
        </div>
      </div>
    }>
    <ProductionSafety>
      <Router>
        <SoundProvider>
          <AuthProvider>
            <AuthenticationManager 
              onAuthenticated={handleAuthenticated}
              onNotAuthenticated={handleNotAuthenticated}
              onEmailNotVerified={handleEmailNotVerified}
            />
            <BuzzPaymentMonitor />
            <LegalOnboarding />
            <WouterRoutes />
            <InstallPrompt />
            <PushSetup />
            <Toaster position="top-center" richColors closeButton style={{ zIndex: 9999 }} />
          </AuthProvider>
        </SoundProvider>
      </Router>
    </ProductionSafety>
    </ErrorBoundary>
  );
}

export default App;
