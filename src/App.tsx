// © 2025 Joseph MULÉ – CEO di NIYVORA KFT™ – M1SSION™
import React from 'react';
import { Router } from 'wouter';
import { Toaster } from "./components/ui/sonner";
import { BadgeAuditReport } from "./components/debug/BadgeAuditReport";
import PushFrozenNotice from "./banners/PushFrozenNotice";
import { AuthProvider } from "./contexts/auth/AuthProvider";
import { SoundProvider } from "./contexts/SoundContext";
import { ErrorBoundary } from "./components/error/ErrorBoundary";
import { XpSystemManager } from "./components/xp/XpSystemManager";
import { HelmetProvider } from "./components/helmet/HelmetProvider";
import SkipToContent from "./components/accessibility/SkipToContent";
import OfflineIndicator from "./components/offline/OfflineIndicator";
import WouterRoutes from "./routes/WouterRoutes";
import ProductionSafety from "./components/debug/ProductionSafety";
import { ProductionSafetyWrapper } from "./components/ProductionSafetyWrapper";
import { InstallPrompt } from "./components/pwa/InstallPrompt";
// OneSignal rimosso - usando solo FCM
import { IOSPermissionManager } from "./components/IOSPermissionManager";
import { AndroidPushSetup } from "./components/android/AndroidPushSetup";
import { PushNotificationSetup } from "./components/PushNotificationSetup";
import { useUnifiedAuth } from "./hooks/useUnifiedAuth";
import BuzzPaymentMonitor from "./components/payment/BuzzPaymentMonitor";
import { usePWAStabilizer } from "./hooks/usePWAStabilizer";
import { useState, useEffect } from "react";
import LegalOnboarding from "./components/legal/LegalOnboarding";
import { InterestSignalsProvider } from "./components/InterestSignalsProvider";
import FirstLoginQuizManager from "./components/quiz/FirstLoginQuizManager";
import { WalkthroughManager } from "./components/walkthrough/WalkthroughManager";
// Import per esporre funzione popolamento KB globalmente
import "@/utils/populateKnowledgeBase";
import { NorahProactiveManager } from "./components/norah/NorahProactiveManager";
import { MissionBadgeInjector } from "./components/home/MissionBadgeInjector";
import { UpdateBanner } from "./components/sw/UpdateBanner";
import '@/features/living-map/styles/livingMap.css';
import { RitualOrchestratorWrapper } from "@/features/pulse/ritual";
import { RouteAnnouncer } from "./components/a11y/RouteAnnouncer";
import { useRouteAnnouncements } from "./hooks/useRouteAnnouncements";
import { ReconnectBadge } from "./components/net/ReconnectBadge";

function App() {
  // SW registration now handled by swControl utils - no duplicate registration
  
  // A11y: Route announcements for screen readers
  useRouteAnnouncements();

  // Debug iOS rendering issue - essential for troubleshooting black screen
  useEffect(() => {
    console.log('🍎 [iOS DEBUG] App rendering started');
    console.log('🍎 [iOS DEBUG] Environment:', {
      userAgent: navigator.userAgent,
      isStandalone: window.matchMedia('(display-mode: standalone)').matches,
      protocol: window.location.protocol,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      pathname: window.location.pathname,
      timestamp: new Date().toISOString()
    });
    
    // CSS Variables check (without creating DOM elements to avoid flicker)
    const styles = getComputedStyle(document.documentElement);
    console.log('🍎 [iOS DEBUG] CSS Variables:', {
      background: styles.getPropertyValue('--background').trim(),
      color: styles.getPropertyValue('--foreground').trim(),
      hasBackground: !!styles.getPropertyValue('--background').trim(),
      hasColor: !!styles.getPropertyValue('--foreground').trim(),
    });
    
    // Remove any reload triggers that could cause loops
  }, []);
  
  // Initialize PWA stabilizer (prevents reload loops and manages push)
  usePWAStabilizer();

  
  return (
    <div className="app-shell">
      <PushFrozenNotice />
      <div className="ios-safe-top"></div>
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
        <ProductionSafetyWrapper>
          <ProductionSafety>
            <HelmetProvider>
              <SkipToContent />
              <OfflineIndicator />
              <RouteAnnouncer />
              <ReconnectBadge />
              <Router>
              <SoundProvider>
                <AuthProvider>
                  <InterestSignalsProvider>
                    {/* OneSignal rimosso - usando solo FCM */}
                    <BuzzPaymentMonitor />
                    <LegalOnboarding />
                    <FirstLoginQuizManager />
                    <WalkthroughManager />
                    <WouterRoutes />
                    <InstallPrompt />
                    <IOSPermissionManager />
                    <AndroidPushSetup className="hidden" />
                    <PushNotificationSetup className="hidden" />
                    <XpSystemManager />
                    <NorahProactiveManager />
                    <MissionBadgeInjector />
                    <RitualOrchestratorWrapper />
                    <Toaster />
                    <BadgeAuditReport />
                  </InterestSignalsProvider>
                </AuthProvider>
              </SoundProvider>
            </Router>
          </HelmetProvider>
        </ProductionSafety>
      </ProductionSafetyWrapper>
      </ErrorBoundary>
      
      {/* Service Worker Update Banner - outside router/auth context */}
      <UpdateBanner />
    </div>
  );
}

export default App;