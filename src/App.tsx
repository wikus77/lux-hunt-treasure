
// © 2025 Joseph MULÉ – CEO di NIYVORA KFT™ – M1SSION™
import React from 'react';
import { Router } from 'wouter';
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./contexts/auth/AuthProvider";
import { SoundProvider } from "./contexts/SoundContext";
import { ErrorBoundary } from "./components/error/ErrorBoundary";
import { XpSystemManager } from "./components/xp/XpSystemManager";
import { HelmetProvider } from "./components/helmet/HelmetProvider";
import SkipToContent from "./components/accessibility/SkipToContent";
import OfflineIndicator from "./components/offline/OfflineIndicator";
import WouterRoutes from "./routes/WouterRoutes";
import ProductionSafety from "./components/debug/ProductionSafety";
import { InstallPrompt } from "./components/pwa/InstallPrompt";
import PushSetup from "./components/pwa/PushSetup";
import OneSignalSetup from "./components/push/OneSignalSetup";
import { OneSignalSingletonManager } from "./components/OneSignalSingletonManager";
import { useUnifiedAuth } from "./hooks/useUnifiedAuth";
import BuzzPaymentMonitor from "./components/payment/BuzzPaymentMonitor";
import { usePushNotificationProcessor } from "./hooks/usePushNotificationProcessor";
import { useGlobalProfileSync } from "./hooks/useGlobalProfileSync";
import { useState, useEffect } from "react";

import LegalOnboarding from "./components/legal/LegalOnboarding";

function App() {
  // Production-ready logging removed
  
  // Initialize push notification processor
  usePushNotificationProcessor();
  
  // Initialize global profile sync for real-time updates across all components
  useGlobalProfileSync();

  
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
      <HelmetProvider>
        <SkipToContent />
        <OfflineIndicator />
        <Router>
          <SoundProvider>
            <AuthProvider>
            <OneSignalSingletonManager />
            <XpSystemManager />
            </AuthProvider>
            
          </SoundProvider>
        </Router>
      </HelmetProvider>
    </ProductionSafety>
    </ErrorBoundary>
  );
}

export default App;
