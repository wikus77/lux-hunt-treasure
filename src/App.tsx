
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
import { ThemeToggle } from "./components/ui/theme-toggle";
import { OfflineIndicator } from "./components/offline/OfflineIndicator";
import { SkipToContent } from "./components/accessibility/SkipToContent";
import BuzzPaymentMonitor from "./components/payment/BuzzPaymentMonitor";
import { usePushNotificationProcessor } from "./hooks/usePushNotificationProcessor";
import { useState, useEffect } from "react";

import LegalOnboarding from "./components/legal/LegalOnboarding";

function App() {
  // © 2025 Joseph MULÉ – M1SSION™ – Production optimized
  
  // Initialize push notification processor
  usePushNotificationProcessor();

  const handleAuthenticated = (userId: string) => {
    // User authenticated successfully
  };
  
  const handleNotAuthenticated = () => {
    // User authentication required
  };
  
  const handleEmailNotVerified = () => {
    // Email verification required
  };
  
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
            <SkipToContent />
            <OfflineIndicator />
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
            <Toaster 
              position="top-center" 
              richColors 
              closeButton 
              style={{ zIndex: 9999 }}
              toastOptions={{
                duration: 4000,
                className: "!bg-black/90 !text-white !border-cyan-500/30"
              }}
            />
          </AuthProvider>
        </SoundProvider>
      </Router>
    </ProductionSafety>
    </ErrorBoundary>
  );
}

export default App;
