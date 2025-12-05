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
import DynamicIslandAutoActivator from "./components/dynamic-island/DynamicIslandAutoActivator";
import DynamicIslandContextManager from "./components/dynamic-island/DynamicIslandContextManager";
import { DynamicIslandProvider } from "./contexts/DynamicIslandContext";
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
import { usePWAStabilizer } from "./hooks/usePWAStabilizer";
import { usePushSync } from "./hooks/usePushSync";
import { useActivityTracker } from "./hooks/useActivityTracker";
import { useState, useEffect } from "react";
import LegalOnboarding from "./components/legal/LegalOnboarding";
import { InterestSignalsProvider } from "./components/InterestSignalsProvider";
import FirstLoginQuizManager from "./components/quiz/FirstLoginQuizManager";
// WalkthroughManager RIMOSSO - verrà ricreato
import DNAManager from "./components/dna/DNAManager";
import { CookieConsentManager } from "./features/consent/CookieConsentManager";
// Import per esporre funzione popolamento KB globalmente
import "@/utils/populateKnowledgeBase";
import { NorahProactiveManager } from "./components/norah/NorahProactiveManager";
import { MissionBadgeInjector } from "./components/home/MissionBadgeInjector";
import { UpdateBanner } from "./components/sw/UpdateBanner";
import '@/features/living-map/styles/livingMap.css';
import { OnboardingProvider, OnboardingOverlay } from "./components/onboarding";
import { PULSE_ENABLED } from "@/config/featureFlags";
import { PulseContributionListener, PulseRewardNotification } from "@/features/pulse";
import { RouteAnnouncer } from "./components/a11y/RouteAnnouncer";
import { useRouteAnnouncements } from "./hooks/useRouteAnnouncements";
import { ReconnectBadge } from "./components/net/ReconnectBadge";
import { M1UnitsDebugPanel } from "./components/debug/M1UnitsDebugPanel";
import { initGA4, trackPageView } from './lib/analytics/ga4';
import { useLocation } from 'wouter';
import { usePullToRefresh } from "./hooks/usePullToRefresh";
import PullToRefreshIndicator from "./components/pwa/PullToRefreshIndicator";
import M1LogoSplash from "./components/intro/M1LogoSplash";
import { useGlobalGlitchListener } from "./hooks/useGlobalGlitch";

function App() {
  // 🚀 NATIVE APP FEEL: Show splash on EVERY app launch (but only once per session)
  // sessionStorage clears when app is closed, localStorage persists
  const [showSplash, setShowSplash] = useState(() => {
    // Check if splash was already shown in this session
    return !sessionStorage.getItem('m1_splash_shown_session');
  });
  // SW registration now handled by swControl utils - no duplicate registration
  const [location] = useLocation();
  
  // Initialize GA4 once on mount
  useEffect(() => {
    initGA4();
  }, []);

  // Preload heavy components in background for smoother navigation
  useEffect(() => {
    const preloadTimer = setTimeout(() => {
      // Preload map after 2 seconds
      import('@/pages/sandbox/MapTiler3D').catch(() => {});
    }, 2000);
    return () => clearTimeout(preloadTimer);
  }, []);

  // Track page views on route change
  useEffect(() => {
    if (location) {
      trackPageView(location);
    }
  }, [location]);
  
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
  
  // Push sync - sincronizza subscription al login e mantiene SW attivo
  usePushSync();
  
  // Activity tracker - traccia comportamento per notifiche intelligenti
  useActivityTracker();

  // Pull to Refresh - scroll down prolungato per refresh
  // DISABILITATO su pagine mappa per evitare conflitti con touch events
  const isMapPage = location.includes('map') || location.includes('buzz');
  const { pullDistance, isRefreshing, progress } = usePullToRefresh({
    threshold: 120, // pixels to pull before refresh
    enabled: !isMapPage // Disabilitato su pagine mappa
  });

  // 🎬 Global Glitch Listener - riceve broadcast da admin
  useGlobalGlitchListener();
  
  return (
    <div className="app-shell relative">
      {/* 🚀 M1 LOGO SPLASH - Shows on EVERY app launch (native feel) */}
      {showSplash && (
        <M1LogoSplash 
          onComplete={() => {
            setShowSplash(false);
            // Mark splash as shown for this session (clears when app closes)
            sessionStorage.setItem('m1_splash_shown_session', 'true');
          }} 
          duration={5000} // 5 seconds
        />
      )}
      
      {/* SFONDO GRADIENTE CHE COPRE TUTTO INCLUSA SAFE AREA iOS */}
      <div className="m1-fullscreen-bg" />
      <div className="m1-grain"></div>
      
      {/* Pull to Refresh Indicator */}
      <PullToRefreshIndicator 
        pullDistance={pullDistance}
        isRefreshing={isRefreshing}
        progress={progress}
      />
      
      <PushFrozenNotice />
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
                  <OnboardingProvider>
                  <InterestSignalsProvider>
                    {/* OneSignal rimosso - usando solo FCM */}
                    {/* © 2025 M1SSION™ - Conditional render to prevent loop */}
                    {!localStorage.getItem('m1ssion_legal_consent') && <LegalOnboarding />}
                    {/* 🚫 QUIZ AGENTE DISABILITATO - Da ricreare in futuro */}
                    {/* <FirstLoginQuizManager /> */}
                    <DNAManager />
                    <CookieConsentManager />
                    {/* Onboarding Tutorial Interattivo */}
                    <OnboardingOverlay />
                    <WouterRoutes />
                    <InstallPrompt />
                    <IOSPermissionManager />
                    <AndroidPushSetup className="hidden" />
                    <PushNotificationSetup className="hidden" />
                    <XpSystemManager />
                    <DynamicIslandProvider>
                      <DynamicIslandAutoActivator />
                      <DynamicIslandContextManager />
                    </DynamicIslandProvider>
                    <NorahProactiveManager />
                    <MissionBadgeInjector />
                    {/* 🔋 PULSE: Toast globale per contribuzioni energia */}
                    <PulseContributionListener />
                    {/* 🎁 PULSE: Notifiche ricompense soglie */}
                    <PulseRewardNotification />
                    <Toaster />
                    <BadgeAuditReport />
                    <M1UnitsDebugPanel />
                  </InterestSignalsProvider>
                  </OnboardingProvider>
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

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™