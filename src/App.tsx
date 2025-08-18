
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
import GlobalErrorBoundary from './components/errors/GlobalErrorBoundary';
import { InstallPrompt } from "./components/pwa/InstallPrompt";
import PushSetup from "./components/pwa/PushSetup";
import OneSignalSetup from "./components/push/OneSignalSetup";
import { AuthenticationManager } from "./components/auth/AuthenticationManager";
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

  const handleAuthenticated = (userId: string) => {
    // User authenticated successfully
  };
  
  const handleNotAuthenticated = () => {
    // User not authenticated
  };
  
  const handleEmailNotVerified = () => {
    // Email verification required
  };
  
  return (
    <GlobalErrorBoundary>
      <HelmetProvider>
        <SkipToContent />
        <OfflineIndicator />
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
            <OneSignalSetup />
            <XpSystemManager />
            </AuthProvider>
            
          </SoundProvider>
        </Router>
        <Toaster closeButton={false} position="top-center" />
      </HelmetProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
