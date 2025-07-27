
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
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const { isAuthenticated, isLoading } = useUnifiedAuth();
  
  // Initialize push notification processor
  usePushNotificationProcessor();
  
  // Check authentication status and animation need
  useEffect(() => {
    console.log("🔐 AUTHENTICATION CHECK - Starting auth verification");
    
    if (isLoading) {
      console.log("🔄 Auth still loading...");
      return;
    }
    
    if (!isAuthChecked) {
      setIsAuthChecked(true);
      console.log("✅ Auth check completed", { isAuthenticated });
      
      if (isAuthenticated) {
        const hasSeenIntro = sessionStorage.getItem("hasSeenIntro");
        console.log("🎬 POST-LOGIN ANIMATION CHECK", { 
          isAuthenticated, 
          hasSeenIntro,
          shouldShowAnimation: !hasSeenIntro 
        });
        
        if (!hasSeenIntro) {
          console.log("🎯 TRIGGERING M1SSION ANIMATION - User authenticated, no intro seen");
          setShowM1ssionAnimation(true);
        } else {
          console.log("⏭️ SKIPPING M1SSION ANIMATION - Already seen in session");
        }
      }
    }
  }, [isAuthenticated, isLoading, isAuthChecked]);

  const handleAnimationComplete = () => {
    console.log("🏁 M1SSION INTRO COMPLETED - Setting completion flag and navigating to home");
    console.log("🚫 Blocchi Home disattivati");
    
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem("hasSeenIntro", "true");
        console.log("💾 hasSeenIntro flag set to true");
      }
    } catch (error) {
      console.error("🎬 Error setting animation completion flag:", error);
    }
    
    setShowM1ssionAnimation(false);
    
    // Use timeout to ensure clean state transition
    setTimeout(() => {
      console.log("🏠 Navigating to /home after animation completion");
      window.location.href = '/home';
    }, 200);
  };
  
  const handleAuthenticated = (userId: string) => {
    console.log("✅ APP LEVEL - User authenticated:", userId);
    console.log("🎯 Fresh login detected - will trigger animation on next render");
    
    // Clear any existing intro flag to ensure animation shows for fresh logins
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem("hasSeenIntro");
        console.log("🗑️ Cleared hasSeenIntro to ensure animation shows");
      }
    } catch (error) {
      console.error("🎬 Error clearing animation flag:", error);
    }
  };
  
  const handleNotAuthenticated = () => {
    console.log("❌ APP LEVEL - User not authenticated");
  };
  
  const handleEmailNotVerified = () => {
    console.log("📧 APP LEVEL - Email not verified");
  };
  
  
  // Manual trigger for testing - clear sessionStorage to see animation again
  useEffect(() => {
    // If we're on /home and user wants to test animation, clear the flag
    const currentPath = window.location.pathname;
    if (currentPath === '/home' && isAuthenticated) {
      // Add a manual way to trigger animation for testing
      const testTrigger = () => {
        if (confirm("Vuoi vedere l'animazione M1SSION?")) {
          sessionStorage.removeItem("hasSeenIntro");
          window.location.reload();
        }
      };
      
      // Add keyboard shortcut for testing (Ctrl+M)
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.key === 'm') {
          testTrigger();
        }
      };
      
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [isAuthenticated]);

  // Show M1SSION animation if user is authenticated and hasn't seen intro
  if (isAuthChecked && showM1ssionAnimation) {
    console.log("🎬 RENDERING M1SSION ANIMATION OVERLAY - BLOCKING ALL OTHER CONTENT");
    return <M1ssionRevealAnimation onComplete={handleAnimationComplete} />;
  }
  
  // Show loading while checking auth
  if (!isAuthChecked || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-lg">Inizializzazione...</div>
      </div>
    );
  }
  
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
