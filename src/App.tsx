
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
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  
  // Initialize push notification processor
  usePushNotificationProcessor();

  const handleAnimationComplete = () => {
    console.log("✅ M1SSION INTRO ESEGUITA - Animation completed, navigating to home");
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem("hasSeenIntro", "true");
      }
    } catch (error) {
      console.error("🎬 Error setting animation completion flag:", error);
    }
    setShowM1ssionAnimation(false);
    setJustLoggedIn(false);
    // Navigate to home after animation
    window.location.href = '/home';
  };
  
  const handleAuthenticated = (userId: string) => {
    console.log("✅ APP LEVEL - User authenticated:", userId);
    
    // Check if animation should be shown
    try {
      if (typeof window !== 'undefined') {
        const hasSeenIntro = sessionStorage.getItem("hasSeenIntro");
        console.log("🎬 AUTH SUCCESS - Animation flag check:", hasSeenIntro);
        
        if (!hasSeenIntro) {
          console.log("🎬 ✅ TRIGGERING M1SSION ANIMATION - User just logged in");
          setJustLoggedIn(true);
          setShowM1ssionAnimation(true);
        } else {
          console.log("🎬 ❌ SKIPPING M1SSION ANIMATION - Already seen in this session");
        }
      }
    } catch (error) {
      console.error("🎬 Error checking animation flag on auth:", error);
    }
  };
  
  const handleNotAuthenticated = () => {
    console.log("❌ APP LEVEL - User not authenticated");
  };
  
  const handleEmailNotVerified = () => {
    console.log("📧 APP LEVEL - Email not verified");
  };
  
  
  // Show M1SSION animation if user just logged in and hasn't seen it
  if (justLoggedIn && showM1ssionAnimation) {
    console.log("🎬 RENDERING M1SSION ANIMATION OVERLAY");
    return <M1ssionRevealAnimation onComplete={handleAnimationComplete} />;
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
